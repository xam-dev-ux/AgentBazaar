// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IAgentBazaar.sol";
import "../interfaces/IERC8004Identity.sol";
import "../interfaces/IERC8004Reputation.sol";
import "../interfaces/IERC8004Validation.sol";

/**
 * @title AgentBazaar
 * @notice Decentralized marketplace for AI agents with USDC escrow
 * @dev Implements task lifecycle management with secure escrow system
 * @custom:security-contact security@agentbazaar.xyz
 */
contract AgentBazaar is Ownable, ReentrancyGuard, IAgentBazaar {
    using SafeERC20 for IERC20;

    // Contract references
    IERC8004Identity public immutable identityRegistry;
    IERC8004Reputation public immutable reputationRegistry;
    IERC8004Validation public immutable validationRegistry;
    IERC20 public immutable usdc;

    // Marketplace fee (2.5% = 250 basis points)
    uint256 public constant MARKETPLACE_FEE_BPS = 250;
    uint256 public constant BPS_DENOMINATOR = 10000;

    // Auto-release timeout (7 days)
    uint256 public constant AUTO_RELEASE_TIMEOUT = 7 days;

    // Cancellation timeout (24 hours after creation)
    uint256 public constant CANCELLATION_TIMEOUT = 24 hours;

    // Mapping: agentId => AgentListing
    mapping(uint256 => AgentListing) private _listings;

    // Mapping: taskId => Task
    mapping(bytes32 => Task) private _tasks;

    // Mapping: taskId => Escrow
    mapping(bytes32 => Escrow) private _escrows;

    // Mapping: agentId => taskId[]
    mapping(uint256 => bytes32[]) private _agentTasks;

    // Mapping: clientAddress => taskId[]
    mapping(address => bytes32[]) private _clientTasks;

    // Accumulated marketplace fees
    uint256 private _accumulatedFees;

    // Custom errors
    error AgentNotFound(uint256 agentId);
    error AgentNotListed(uint256 agentId);
    error AgentNotActive(uint256 agentId);
    error NotAgentOwner(uint256 agentId, address caller);
    error TaskNotFound(bytes32 taskId);
    error InvalidTaskStatus(TaskStatus current, TaskStatus expected);
    error NotTaskClient(bytes32 taskId, address caller);
    error DeadlineInPast(uint256 deadline);
    error InvalidComplexity(uint256 complexity);
    error InsufficientAllowance(uint256 required, uint256 provided);
    error EscrowAlreadyReleased(bytes32 taskId);
    error AutoReleaseNotReady(uint256 autoReleaseAt, uint256 currentTime);
    error CancellationTimeoutNotPassed(uint256 createdAt, uint256 currentTime);

    /**
     * @notice Constructor
     * @param _identityRegistry Identity Registry address
     * @param _reputationRegistry Reputation Registry address
     * @param _validationRegistry Validation Registry address
     * @param _usdc USDC token address on Base
     */
    constructor(
        address _identityRegistry,
        address _reputationRegistry,
        address _validationRegistry,
        address _usdc
    ) Ownable(msg.sender) {
        identityRegistry = IERC8004Identity(_identityRegistry);
        reputationRegistry = IERC8004Reputation(_reputationRegistry);
        validationRegistry = IERC8004Validation(_validationRegistry);
        usdc = IERC20(_usdc);
    }

    /**
     * @notice List an agent in the marketplace
     * @param agentId Agent identifier
     * @param category Agent category
     * @param basePrice Base price per complexity unit (USDC, 6 decimals)
     * @param skills Array of skills offered
     * @param trustModels Trust models supported
     */
    function listAgent(
        uint256 agentId,
        string calldata category,
        uint256 basePrice,
        string[] calldata skills,
        IERC8004Validation.ValidationType[] calldata trustModels
    ) external {
        // Verify agent exists
        IERC8004Identity.AgentInfo memory agent = identityRegistry.getAgent(
            agentId
        );
        if (agent.agentId == 0) revert AgentNotFound(agentId);

        // Verify caller owns the agent
        if (agent.agentAddress != msg.sender) {
            revert NotAgentOwner(agentId, msg.sender);
        }

        // Create or update listing
        _listings[agentId] = AgentListing({
            agentId: agentId,
            isActive: true,
            category: category,
            basePrice: basePrice,
            skills: skills,
            supportedTrustModels: trustModels,
            totalTasksCompleted: _listings[agentId].totalTasksCompleted,
            totalEarnings: _listings[agentId].totalEarnings
        });

        emit AgentListed(agentId, category, basePrice);
    }

    /**
     * @notice Update agent listing status
     * @param agentId Agent identifier
     * @param isActive New active status
     */
    function updateAgentListing(uint256 agentId, bool isActive) external {
        // Verify agent exists
        IERC8004Identity.AgentInfo memory agent = identityRegistry.getAgent(
            agentId
        );
        if (agent.agentId == 0) revert AgentNotFound(agentId);

        // Verify caller owns the agent
        if (agent.agentAddress != msg.sender) {
            revert NotAgentOwner(agentId, msg.sender);
        }

        // Verify agent is listed
        if (_listings[agentId].agentId == 0) {
            revert AgentNotListed(agentId);
        }

        _listings[agentId].isActive = isActive;

        emit AgentListingUpdated(agentId, isActive);
    }

    /**
     * @notice Create a new task with escrow
     * @param agentId Agent identifier
     * @param skill Required skill
     * @param complexity Task complexity (1-10)
     * @param description Task description
     * @param filesUri IPFS link to task files
     * @param deadline Task deadline timestamp
     * @return taskId Unique task identifier
     */
    function createTask(
        uint256 agentId,
        string calldata skill,
        uint256 complexity,
        string calldata description,
        string calldata filesUri,
        uint256 deadline
    ) external nonReentrant returns (bytes32 taskId) {
        // Validate inputs
        if (complexity == 0 || complexity > 10) {
            revert InvalidComplexity(complexity);
        }
        if (deadline <= block.timestamp) {
            revert DeadlineInPast(deadline);
        }

        // Verify agent is listed and active
        AgentListing storage listing = _listings[agentId];
        if (listing.agentId == 0) revert AgentNotListed(agentId);
        if (!listing.isActive) revert AgentNotActive(agentId);

        // Calculate price: basePrice * complexity
        uint256 price = listing.basePrice * complexity;

        // Verify USDC allowance
        uint256 allowance = usdc.allowance(msg.sender, address(this));
        if (allowance < price) {
            revert InsufficientAllowance(price, allowance);
        }

        // Generate task ID
        taskId = keccak256(
            abi.encodePacked(
                msg.sender,
                agentId,
                block.timestamp,
                block.prevrandao
            )
        );

        // Create task
        _tasks[taskId] = Task({
            taskId: taskId,
            agentId: agentId,
            clientAddress: msg.sender,
            skill: skill,
            complexity: complexity,
            description: description,
            filesUri: filesUri,
            deadline: deadline,
            price: price,
            status: TaskStatus.OPEN,
            resultUri: "",
            createdAt: block.timestamp,
            completedAt: 0
        });

        // Create escrow
        _escrows[taskId] = Escrow({
            taskId: taskId,
            amount: price,
            clientAddress: msg.sender,
            agentId: agentId,
            released: false,
            autoReleaseAt: 0
        });

        // Add to agent's tasks
        _agentTasks[agentId].push(taskId);

        // Add to client's tasks
        _clientTasks[msg.sender].push(taskId);

        // Transfer USDC to escrow
        usdc.safeTransferFrom(msg.sender, address(this), price);

        emit TaskCreated(taskId, agentId, msg.sender, price);
    }

    /**
     * @notice Agent accepts a task
     * @param taskId Task identifier
     */
    function acceptTask(bytes32 taskId) external {
        Task storage task = _tasks[taskId];

        // Verify task exists
        if (task.taskId == bytes32(0)) revert TaskNotFound(taskId);

        // Verify task is open
        if (task.status != TaskStatus.OPEN) {
            revert InvalidTaskStatus(task.status, TaskStatus.OPEN);
        }

        // Verify caller owns the agent
        IERC8004Identity.AgentInfo memory agent = identityRegistry.getAgent(
            task.agentId
        );
        if (agent.agentAddress != msg.sender) {
            revert NotAgentOwner(task.agentId, msg.sender);
        }

        // Update task status
        task.status = TaskStatus.ACCEPTED;

        emit TaskAccepted(taskId, task.agentId);
    }

    /**
     * @notice Agent marks task as completed
     * @param taskId Task identifier
     * @param resultUri IPFS link to result
     */
    function completeTask(bytes32 taskId, string calldata resultUri) external {
        Task storage task = _tasks[taskId];

        // Verify task exists
        if (task.taskId == bytes32(0)) revert TaskNotFound(taskId);

        // Verify task is accepted
        if (task.status != TaskStatus.ACCEPTED) {
            revert InvalidTaskStatus(task.status, TaskStatus.ACCEPTED);
        }

        // Verify caller owns the agent
        IERC8004Identity.AgentInfo memory agent = identityRegistry.getAgent(
            task.agentId
        );
        if (agent.agentAddress != msg.sender) {
            revert NotAgentOwner(task.agentId, msg.sender);
        }

        // Update task
        task.status = TaskStatus.COMPLETED;
        task.resultUri = resultUri;
        task.completedAt = block.timestamp;

        // Set auto-release timestamp
        _escrows[taskId].autoReleaseAt =
            block.timestamp +
            AUTO_RELEASE_TIMEOUT;

        emit TaskCompleted(taskId, resultUri);
    }

    /**
     * @notice Client validates task and releases payment
     * @param taskId Task identifier
     * @param approved Whether work is approved
     */
    function validateAndRelease(bytes32 taskId, bool approved)
        external
        nonReentrant
    {
        Task storage task = _tasks[taskId];

        // Verify task exists
        if (task.taskId == bytes32(0)) revert TaskNotFound(taskId);

        // Verify caller is client
        if (task.clientAddress != msg.sender) {
            revert NotTaskClient(taskId, msg.sender);
        }

        // Verify task is completed
        if (task.status != TaskStatus.COMPLETED) {
            revert InvalidTaskStatus(task.status, TaskStatus.COMPLETED);
        }

        if (approved) {
            // Release escrow to agent
            _releaseEscrow(taskId, true);

            // Update task status
            task.status = TaskStatus.VALIDATED;

            // Authorize client to give feedback
            IERC8004Identity.AgentInfo memory agent = identityRegistry
                .getAgent(task.agentId);
            reputationRegistry.authorizeClientFeedback(
                task.agentId,
                msg.sender,
                taskId,
                block.timestamp + 30 days,
                "" // Signature not required in this implementation
            );

            emit TaskValidated(taskId, true);
        } else {
            // Client disputes - mark as disputed
            task.status = TaskStatus.DISPUTED;
            emit TaskDisputed(taskId);
        }
    }

    /**
     * @notice Dispute a task (triggers validation)
     * @param taskId Task identifier
     */
    function disputeTask(bytes32 taskId) external {
        Task storage task = _tasks[taskId];

        // Verify task exists
        if (task.taskId == bytes32(0)) revert TaskNotFound(taskId);

        // Verify caller is client
        if (task.clientAddress != msg.sender) {
            revert NotTaskClient(taskId, msg.sender);
        }

        // Verify task is completed or validated
        if (
            task.status != TaskStatus.COMPLETED &&
            task.status != TaskStatus.VALIDATED
        ) {
            revert InvalidTaskStatus(task.status, TaskStatus.COMPLETED);
        }

        // Update status
        task.status = TaskStatus.DISPUTED;

        emit TaskDisputed(taskId);
    }

    /**
     * @notice Cancel task if agent hasn't accepted
     * @param taskId Task identifier
     */
    function cancelTask(bytes32 taskId) external nonReentrant {
        Task storage task = _tasks[taskId];

        // Verify task exists
        if (task.taskId == bytes32(0)) revert TaskNotFound(taskId);

        // Verify caller is client
        if (task.clientAddress != msg.sender) {
            revert NotTaskClient(taskId, msg.sender);
        }

        // Verify task is still open
        if (task.status != TaskStatus.OPEN) {
            revert InvalidTaskStatus(task.status, TaskStatus.OPEN);
        }

        // Verify cancellation timeout has passed (24 hours)
        if (block.timestamp < task.createdAt + CANCELLATION_TIMEOUT) {
            revert CancellationTimeoutNotPassed(
                task.createdAt,
                block.timestamp
            );
        }

        // Update status
        task.status = TaskStatus.CANCELLED;

        // Refund escrow to client
        _releaseEscrow(taskId, false);

        emit TaskCancelled(taskId);
    }

    /**
     * @notice Auto-release escrow if client doesn't validate in time
     * @param taskId Task identifier
     */
    function autoReleaseEscrow(bytes32 taskId) external nonReentrant {
        Task storage task = _tasks[taskId];

        // Verify task exists
        if (task.taskId == bytes32(0)) revert TaskNotFound(taskId);

        // Verify task is completed
        if (task.status != TaskStatus.COMPLETED) {
            revert InvalidTaskStatus(task.status, TaskStatus.COMPLETED);
        }

        // Verify auto-release timeout has passed
        uint256 autoReleaseAt = _escrows[taskId].autoReleaseAt;
        if (block.timestamp < autoReleaseAt) {
            revert AutoReleaseNotReady(autoReleaseAt, block.timestamp);
        }

        // Release escrow to agent
        _releaseEscrow(taskId, true);

        // Update task status
        task.status = TaskStatus.VALIDATED;

        emit TaskValidated(taskId, true);
    }

    /**
     * @notice Internal function to release escrow
     * @param taskId Task identifier
     * @param toAgent Whether to release to agent (true) or refund to client (false)
     */
    function _releaseEscrow(bytes32 taskId, bool toAgent) private {
        Escrow storage escrow = _escrows[taskId];

        // Verify escrow not already released
        if (escrow.released) revert EscrowAlreadyReleased(taskId);

        escrow.released = true;

        uint256 amount = escrow.amount;
        address recipient;

        if (toAgent) {
            // Calculate marketplace fee
            uint256 fee = (amount * MARKETPLACE_FEE_BPS) / BPS_DENOMINATOR;
            uint256 agentAmount = amount - fee;

            // Update accumulated fees
            _accumulatedFees += fee;

            // Update agent stats
            _listings[escrow.agentId].totalTasksCompleted++;
            _listings[escrow.agentId].totalEarnings += agentAmount;

            // Get agent address
            IERC8004Identity.AgentInfo memory agent = identityRegistry
                .getAgent(escrow.agentId);
            recipient = agent.agentAddress;

            // Transfer to agent (minus fee)
            usdc.safeTransfer(recipient, agentAmount);
        } else {
            // Refund to client (no fee)
            recipient = escrow.clientAddress;
            usdc.safeTransfer(recipient, amount);
        }

        emit EscrowReleased(taskId, amount, recipient);
    }

    /**
     * @notice Withdraw accumulated marketplace fees (only owner)
     */
    function withdrawMarketplaceFees() external onlyOwner nonReentrant {
        uint256 amount = _accumulatedFees;
        _accumulatedFees = 0;

        usdc.safeTransfer(msg.sender, amount);

        emit MarketplaceFeesWithdrawn(msg.sender, amount);
    }

    /**
     * @notice Get agent listing
     * @param agentId Agent identifier
     * @return AgentListing structure
     */
    function getAgentListing(uint256 agentId)
        external
        view
        returns (AgentListing memory)
    {
        if (_listings[agentId].agentId == 0) revert AgentNotListed(agentId);
        return _listings[agentId];
    }

    /**
     * @notice Get task details
     * @param taskId Task identifier
     * @return Task structure
     */
    function getTask(bytes32 taskId) external view returns (Task memory) {
        if (_tasks[taskId].taskId == bytes32(0)) revert TaskNotFound(taskId);
        return _tasks[taskId];
    }

    /**
     * @notice Get tasks by agent
     * @param agentId Agent identifier
     * @return Task[] Array of tasks
     */
    function getTasksByAgent(uint256 agentId)
        external
        view
        returns (Task[] memory)
    {
        bytes32[] memory taskIds = _agentTasks[agentId];
        Task[] memory tasks = new Task[](taskIds.length);

        for (uint256 i = 0; i < taskIds.length; i++) {
            tasks[i] = _tasks[taskIds[i]];
        }

        return tasks;
    }

    /**
     * @notice Get tasks by client
     * @param clientAddress Client address
     * @return Task[] Array of tasks
     */
    function getTasksByClient(address clientAddress)
        external
        view
        returns (Task[] memory)
    {
        bytes32[] memory taskIds = _clientTasks[clientAddress];
        Task[] memory tasks = new Task[](taskIds.length);

        for (uint256 i = 0; i < taskIds.length; i++) {
            tasks[i] = _tasks[taskIds[i]];
        }

        return tasks;
    }

    /**
     * @notice Get accumulated marketplace fees
     * @return uint256 Fees amount
     */
    function getAccumulatedFees() external view returns (uint256) {
        return _accumulatedFees;
    }

    /**
     * @notice Get escrow details
     * @param taskId Task identifier
     * @return Escrow structure
     */
    function getEscrow(bytes32 taskId) external view returns (Escrow memory) {
        return _escrows[taskId];
    }
}
