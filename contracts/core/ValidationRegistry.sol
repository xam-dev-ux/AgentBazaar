// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IERC8004Validation.sol";
import "../interfaces/IERC8004Identity.sol";

/**
 * @title ValidationRegistry
 * @notice ERC-8004 compliant Validation Registry with multi-trust-level support
 * @dev Supports REPUTATION, CRYPTO_ECONOMIC, ZKML, and TEE validation types
 * @custom:security-contact security@agentbazaar.xyz
 */
contract ValidationRegistry is
    Ownable,
    ReentrancyGuard,
    IERC8004Validation
{
    // Identity Registry reference
    IERC8004Identity public immutable identityRegistry;

    // Validation request counter
    uint256 private _requestIdCounter;

    // Minimum stake required for validators (in wei)
    uint256 public constant MIN_VALIDATOR_STAKE = 0.01 ether;

    // Reward per successful validation (in wei)
    uint256 public constant VALIDATION_REWARD = 0.001 ether;

    // Slashing percentage (50%)
    uint256 public constant SLASH_PERCENTAGE = 50;

    // Mapping: requestId => ValidationRequest
    mapping(uint256 => ValidationRequest) private _requests;

    // Mapping: requestId => ValidationResponse
    mapping(uint256 => ValidationResponse) private _responses;

    // Mapping: agentId => requestId[]
    mapping(uint256 => uint256[]) private _agentValidations;

    // Mapping: taskId => requestId[]
    mapping(bytes32 => uint256[]) private _taskValidations;

    // Mapping: validatorAddress => ValidatorStake
    mapping(address => ValidatorStake) private _validatorStakes;

    // Custom errors
    error AgentNotFound(uint256 agentId);
    error InvalidValidator(address validator);
    error InsufficientStake(uint256 required, uint256 provided);
    error ValidationNotFound(uint256 requestId);
    error ValidationAlreadyResponded(uint256 requestId);
    error NotDesignatedValidator(address caller, address expected);
    error DisputeNotAllowed(uint256 requestId);
    error InvalidProof();

    /**
     * @notice Constructor
     * @param _identityRegistry Address of the Identity Registry
     */
    constructor(address _identityRegistry) Ownable(msg.sender) {
        identityRegistry = IERC8004Identity(_identityRegistry);
        _requestIdCounter = 1;
    }

    /**
     * @notice Request validation of agent's work
     * @param agentId Agent identifier
     * @param taskId Task identifier
     * @param validationType Type of validation
     * @param validationRequestUri Link to validation data
     * @param contentHash Hash of request
     * @param validatorAddress Designated validator
     * @return requestId Unique request identifier
     */
    function requestValidation(
        uint256 agentId,
        bytes32 taskId,
        ValidationType validationType,
        string calldata validationRequestUri,
        bytes32 contentHash,
        address validatorAddress
    ) external returns (uint256 requestId) {
        // Verify agent exists
        IERC8004Identity.AgentInfo memory agent = identityRegistry.getAgent(
            agentId
        );
        if (agent.agentId == 0) revert AgentNotFound(agentId);

        // For CRYPTO_ECONOMIC, verify validator has stake
        if (validationType == ValidationType.CRYPTO_ECONOMIC) {
            if (_validatorStakes[validatorAddress].stakedAmount < MIN_VALIDATOR_STAKE) {
                revert InsufficientStake(
                    MIN_VALIDATOR_STAKE,
                    _validatorStakes[validatorAddress].stakedAmount
                );
            }
        }

        // Get new request ID
        requestId = _requestIdCounter++;

        // Create validation request
        _requests[requestId] = ValidationRequest({
            requestId: requestId,
            agentId: agentId,
            taskId: taskId,
            requester: msg.sender,
            validationType: validationType,
            validationRequestUri: validationRequestUri,
            contentHash: contentHash,
            validatorAddress: validatorAddress,
            timestamp: block.timestamp,
            status: ValidationStatus.PENDING
        });

        // Add to agent's validations
        _agentValidations[agentId].push(requestId);

        // Add to task's validations
        _taskValidations[taskId].push(requestId);

        emit ValidationRequested(
            requestId,
            agentId,
            taskId,
            validationType,
            validatorAddress
        );
    }

    /**
     * @notice Register as validator by staking
     */
    function registerValidatorStake() external payable {
        if (msg.value < MIN_VALIDATOR_STAKE) {
            revert InsufficientStake(MIN_VALIDATOR_STAKE, msg.value);
        }

        // Update or create validator stake
        if (_validatorStakes[msg.sender].validator == address(0)) {
            _validatorStakes[msg.sender] = ValidatorStake({
                validator: msg.sender,
                stakedAmount: msg.value,
                correctValidations: 0,
                incorrectValidations: 0,
                slashedAmount: 0
            });
        } else {
            _validatorStakes[msg.sender].stakedAmount += msg.value;
        }

        emit ValidatorStaked(msg.sender, msg.value);
    }

    /**
     * @notice Submit validation response
     * @param requestId Request identifier
     * @param approved Whether work is approved
     * @param validationResponseUri Link to evidence
     * @param evidenceHash Hash of evidence
     * @param proof Cryptographic proof (for zkML/TEE)
     */
    function submitValidationResponse(
        uint256 requestId,
        bool approved,
        string calldata validationResponseUri,
        bytes32 evidenceHash,
        bytes calldata proof
    ) external nonReentrant {
        ValidationRequest storage request = _requests[requestId];

        // Verify request exists
        if (request.requestId == 0) revert ValidationNotFound(requestId);

        // Verify not already responded
        if (request.status != ValidationStatus.PENDING) {
            revert ValidationAlreadyResponded(requestId);
        }

        // Verify caller is designated validator
        if (request.validatorAddress != msg.sender) {
            revert NotDesignatedValidator(msg.sender, request.validatorAddress);
        }

        // Verify proof for zkML/TEE validations
        if (
            request.validationType == ValidationType.ZKML ||
            request.validationType == ValidationType.TEE
        ) {
            if (proof.length == 0) revert InvalidProof();
            // In production, verify actual zkML/TEE proof here
        }

        // Create response
        _responses[requestId] = ValidationResponse({
            requestId: requestId,
            validatorAddress: msg.sender,
            approved: approved,
            validationResponseUri: validationResponseUri,
            evidenceHash: evidenceHash,
            timestamp: block.timestamp,
            rewardClaimed: false
        });

        // Update request status
        request.status = approved
            ? ValidationStatus.APPROVED
            : ValidationStatus.REJECTED;

        // Record validation for validator reputation
        if (request.validationType == ValidationType.CRYPTO_ECONOMIC) {
            _validatorStakes[msg.sender].correctValidations++;
        }

        emit ValidationResponseSubmitted(requestId, msg.sender, approved);

        // Reward validator (for crypto-economic)
        if (request.validationType == ValidationType.CRYPTO_ECONOMIC) {
            _rewardValidator(msg.sender, VALIDATION_REWARD);
        }
    }

    /**
     * @notice Dispute a validation
     * @param requestId Request identifier
     */
    function disputeValidation(uint256 requestId) external {
        ValidationRequest storage request = _requests[requestId];

        // Verify request exists
        if (request.requestId == 0) revert ValidationNotFound(requestId);

        // Verify requester is disputing
        if (request.requester != msg.sender) {
            revert DisputeNotAllowed(requestId);
        }

        // Verify validation has been responded to
        if (request.status == ValidationStatus.PENDING) {
            revert DisputeNotAllowed(requestId);
        }

        // Update status
        request.status = ValidationStatus.DISPUTED;

        emit DisputeRaised(requestId, msg.sender);
    }

    /**
     * @notice Resolve a dispute (only owner)
     * @param requestId Request identifier
     * @param validatorWasCorrect Resolution outcome
     */
    function resolveDispute(uint256 requestId, bool validatorWasCorrect)
        external
        onlyOwner
    {
        ValidationRequest storage request = _requests[requestId];

        // Verify dispute exists
        if (request.status != ValidationStatus.DISPUTED) {
            revert DisputeNotAllowed(requestId);
        }

        if (validatorWasCorrect) {
            // Validator was correct - update reputation
            request.status = ValidationStatus.APPROVED;
        } else {
            // Validator was incorrect - slash stake
            request.status = ValidationStatus.REJECTED;

            if (request.validationType == ValidationType.CRYPTO_ECONOMIC) {
                _slashValidator(request.validatorAddress);
            }
        }

        emit DisputeResolved(requestId, validatorWasCorrect);
    }

    /**
     * @notice Withdraw validator stake
     * @param amount Amount to withdraw
     */
    function withdrawValidatorStake(uint256 amount) external nonReentrant {
        ValidatorStake storage stake = _validatorStakes[msg.sender];

        if (stake.stakedAmount < amount) {
            revert InsufficientStake(amount, stake.stakedAmount);
        }

        stake.stakedAmount -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }

    /**
     * @notice Get validation request details
     * @param requestId Request identifier
     * @return ValidationRequest structure
     */
    function getValidationRequest(uint256 requestId)
        external
        view
        returns (ValidationRequest memory)
    {
        if (_requests[requestId].requestId == 0) {
            revert ValidationNotFound(requestId);
        }
        return _requests[requestId];
    }

    /**
     * @notice Get validation response details
     * @param requestId Request identifier
     * @return ValidationResponse structure
     */
    function getValidationResponse(uint256 requestId)
        external
        view
        returns (ValidationResponse memory)
    {
        if (_responses[requestId].requestId == 0) {
            revert ValidationNotFound(requestId);
        }
        return _responses[requestId];
    }

    /**
     * @notice Get validations for an agent
     * @param agentId Agent identifier
     * @return ValidationRequest[] Array of validation requests
     */
    function getValidationsByAgent(uint256 agentId)
        external
        view
        returns (ValidationRequest[] memory)
    {
        uint256[] memory requestIds = _agentValidations[agentId];
        ValidationRequest[] memory result = new ValidationRequest[](
            requestIds.length
        );

        for (uint256 i = 0; i < requestIds.length; i++) {
            result[i] = _requests[requestIds[i]];
        }

        return result;
    }

    /**
     * @notice Get validations for a task
     * @param taskId Task identifier
     * @return ValidationRequest[] Array of validation requests
     */
    function getValidationsByTask(bytes32 taskId)
        external
        view
        returns (ValidationRequest[] memory)
    {
        uint256[] memory requestIds = _taskValidations[taskId];
        ValidationRequest[] memory result = new ValidationRequest[](
            requestIds.length
        );

        for (uint256 i = 0; i < requestIds.length; i++) {
            result[i] = _requests[requestIds[i]];
        }

        return result;
    }

    /**
     * @notice Calculate approval rate for an agent
     * @param agentId Agent identifier
     * @return approvedCount Number of approved validations
     * @return totalCount Total validations
     */
    function calculateApprovalRate(uint256 agentId)
        external
        view
        returns (uint256 approvedCount, uint256 totalCount)
    {
        uint256[] memory requestIds = _agentValidations[agentId];
        totalCount = requestIds.length;
        approvedCount = 0;

        for (uint256 i = 0; i < totalCount; i++) {
            if (_requests[requestIds[i]].status == ValidationStatus.APPROVED) {
                approvedCount++;
            }
        }
    }

    /**
     * @notice Get validator reputation
     * @param validator Validator address
     * @return ValidatorStake structure
     */
    function getValidatorReputation(address validator)
        external
        view
        returns (ValidatorStake memory)
    {
        return _validatorStakes[validator];
    }

    /**
     * @notice Internal function to reward validator
     * @param validator Validator address
     * @param amount Reward amount
     */
    function _rewardValidator(address validator, uint256 amount) private {
        _responses[_requestIdCounter - 1].rewardClaimed = true;

        (bool success, ) = validator.call{value: amount}("");
        require(success, "Reward transfer failed");

        emit ValidatorRewarded(validator, amount);
    }

    /**
     * @notice Internal function to slash validator
     * @param validator Validator address
     */
    function _slashValidator(address validator) private {
        ValidatorStake storage stake = _validatorStakes[validator];

        uint256 slashAmount = (stake.stakedAmount * SLASH_PERCENTAGE) / 100;
        stake.stakedAmount -= slashAmount;
        stake.slashedAmount += slashAmount;
        stake.incorrectValidations++;

        emit ValidatorSlashed(validator, slashAmount);
    }

    /**
     * @notice Receive function to accept ETH for rewards
     */
    receive() external payable {}
}
