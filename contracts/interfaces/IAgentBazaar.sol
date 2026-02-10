// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IERC8004Validation.sol";

/**
 * @title IAgentBazaar
 * @notice Interface for AgentBazaar marketplace
 */
interface IAgentBazaar {
    /**
     * @notice Task status enum
     */
    enum TaskStatus {
        OPEN,          // Created, waiting for agent
        ACCEPTED,      // Agent accepted
        IN_PROGRESS,   // Work started
        COMPLETED,     // Agent marked complete
        VALIDATED,     // Client validated
        DISPUTED,      // Client disputed
        CANCELLED      // Cancelled before acceptance
    }

    /**
     * @notice Agent listing structure
     * @param agentId Agent identifier
     * @param isActive Whether agent is accepting tasks
     * @param category Agent category
     * @param basePrice Base price per complexity unit (USDC, 6 decimals)
     * @param skills Array of skills offered
     * @param supportedTrustModels Trust models supported
     * @param totalTasksCompleted Total tasks completed
     * @param totalEarnings Total earnings in USDC
     */
    struct AgentListing {
        uint256 agentId;
        bool isActive;
        string category;
        uint256 basePrice;
        string[] skills;
        IERC8004Validation.ValidationType[] supportedTrustModels;
        uint256 totalTasksCompleted;
        uint256 totalEarnings;
    }

    /**
     * @notice Task structure
     * @param taskId Unique task identifier
     * @param agentId Agent assigned to task
     * @param clientAddress Client who created task
     * @param skill Required skill
     * @param complexity Task complexity (1-10)
     * @param description Task description or URI
     * @param filesUri IPFS link to task files
     * @param deadline Task deadline timestamp
     * @param price Total price in USDC (6 decimals)
     * @param status Current task status
     * @param resultUri IPFS link to result (when completed)
     * @param createdAt Creation timestamp
     * @param completedAt Completion timestamp
     */
    struct Task {
        bytes32 taskId;
        uint256 agentId;
        address clientAddress;
        string skill;
        uint256 complexity;
        string description;
        string filesUri;
        uint256 deadline;
        uint256 price;
        TaskStatus status;
        string resultUri;
        uint256 createdAt;
        uint256 completedAt;
    }

    /**
     * @notice Escrow information
     * @param taskId Task identifier
     * @param amount Escrowed amount
     * @param clientAddress Client address
     * @param agentId Agent identifier
     * @param released Whether escrow has been released
     * @param autoReleaseAt Timestamp for automatic release
     */
    struct Escrow {
        bytes32 taskId;
        uint256 amount;
        address clientAddress;
        uint256 agentId;
        bool released;
        uint256 autoReleaseAt;
    }

    // Events
    event AgentListed(
        uint256 indexed agentId,
        string category,
        uint256 basePrice
    );
    event AgentListingUpdated(uint256 indexed agentId, bool isActive);
    event TaskCreated(
        bytes32 indexed taskId,
        uint256 indexed agentId,
        address indexed clientAddress,
        uint256 price
    );
    event TaskAccepted(bytes32 indexed taskId, uint256 indexed agentId);
    event TaskCompleted(bytes32 indexed taskId, string resultUri);
    event TaskValidated(bytes32 indexed taskId, bool approved);
    event EscrowReleased(
        bytes32 indexed taskId,
        uint256 amount,
        address indexed recipient
    );
    event TaskDisputed(bytes32 indexed taskId);
    event TaskCancelled(bytes32 indexed taskId);
    event MarketplaceFeesWithdrawn(address indexed owner, uint256 amount);

    // Functions
    function listAgent(
        uint256 agentId,
        string calldata category,
        uint256 basePrice,
        string[] calldata skills,
        IERC8004Validation.ValidationType[] calldata trustModels
    ) external;

    function updateAgentListing(uint256 agentId, bool isActive) external;

    function createTask(
        uint256 agentId,
        string calldata skill,
        uint256 complexity,
        string calldata description,
        string calldata filesUri,
        uint256 deadline
    ) external returns (bytes32 taskId);

    function acceptTask(bytes32 taskId) external;

    function completeTask(bytes32 taskId, string calldata resultUri) external;

    function validateAndRelease(bytes32 taskId, bool approved) external;

    function cancelTask(bytes32 taskId) external;

    function disputeTask(bytes32 taskId) external;

    function autoReleaseEscrow(bytes32 taskId) external;

    function getAgentListing(uint256 agentId)
        external
        view
        returns (AgentListing memory);

    function getTask(bytes32 taskId) external view returns (Task memory);

    function getTasksByAgent(uint256 agentId)
        external
        view
        returns (Task[] memory);

    function getTasksByClient(address clientAddress)
        external
        view
        returns (Task[] memory);

    function withdrawMarketplaceFees() external;
}
