// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC8004Validation
 * @notice Interface for ERC-8004 Validation Registry
 * @dev Multi-trust-level validation system
 */
interface IERC8004Validation {
    /**
     * @notice Validation types supported
     * @param REPUTATION Social trust based on feedback history (free, for <$10 tasks)
     * @param CRYPTO_ECONOMIC Validator stakes and re-executes work (for $10-$100)
     * @param ZKML Zero-knowledge ML proof of correct execution (for >$50 sensitive ML)
     * @param TEE Trusted execution environment attestation (for >$50 confidential)
     */
    enum ValidationType {
        REPUTATION,
        CRYPTO_ECONOMIC,
        ZKML,
        TEE
    }

    /**
     * @notice Validation status
     */
    enum ValidationStatus {
        PENDING,
        APPROVED,
        REJECTED,
        DISPUTED
    }

    /**
     * @notice Validation request structure
     * @param requestId Unique request identifier
     * @param agentId Agent being validated
     * @param taskId Associated task
     * @param requester Address requesting validation
     * @param validationType Type of validation requested
     * @param validationRequestUri Link to validation request data
     * @param contentHash Hash of request content
     * @param validatorAddress Designated validator
     * @param timestamp Request timestamp
     * @param status Current status
     */
    struct ValidationRequest {
        uint256 requestId;
        uint256 agentId;
        bytes32 taskId;
        address requester;
        ValidationType validationType;
        string validationRequestUri;
        bytes32 contentHash;
        address validatorAddress;
        uint256 timestamp;
        ValidationStatus status;
    }

    /**
     * @notice Validation response structure
     * @param requestId Associated request ID
     * @param validatorAddress Validator who responded
     * @param approved Whether work was approved
     * @param validationResponseUri Link to validation evidence
     * @param evidenceHash Hash of evidence
     * @param timestamp Response timestamp
     * @param rewardClaimed Whether validator claimed reward
     */
    struct ValidationResponse {
        uint256 requestId;
        address validatorAddress;
        bool approved;
        string validationResponseUri;
        bytes32 evidenceHash;
        uint256 timestamp;
        bool rewardClaimed;
    }

    /**
     * @notice Validator stake information
     * @param validator Validator address
     * @param stakedAmount Amount staked
     * @param correctValidations Number of correct validations
     * @param incorrectValidations Number of incorrect validations
     * @param slashedAmount Total amount slashed
     */
    struct ValidatorStake {
        address validator;
        uint256 stakedAmount;
        uint256 correctValidations;
        uint256 incorrectValidations;
        uint256 slashedAmount;
    }

    /**
     * @notice Emitted when validation is requested
     * @param requestId Unique identifier
     * @param agentId Agent identifier
     * @param taskId Task identifier
     * @param validationType Type of validation
     * @param validatorAddress Designated validator
     */
    event ValidationRequested(
        uint256 indexed requestId,
        uint256 indexed agentId,
        bytes32 indexed taskId,
        ValidationType validationType,
        address validatorAddress
    );

    /**
     * @notice Emitted when validator responds
     * @param requestId Request identifier
     * @param validatorAddress Validator
     * @param approved Approval result
     */
    event ValidationResponseSubmitted(
        uint256 indexed requestId,
        address indexed validatorAddress,
        bool approved
    );

    /**
     * @notice Emitted when validator stakes
     * @param validator Validator address
     * @param amount Staked amount
     */
    event ValidatorStaked(address indexed validator, uint256 amount);

    /**
     * @notice Emitted when validator is rewarded
     * @param validator Validator address
     * @param amount Reward amount
     */
    event ValidatorRewarded(address indexed validator, uint256 amount);

    /**
     * @notice Emitted when validator is slashed
     * @param validator Validator address
     * @param amount Slashed amount
     */
    event ValidatorSlashed(address indexed validator, uint256 amount);

    /**
     * @notice Emitted when dispute is raised
     * @param requestId Request identifier
     * @param disputer Address raising dispute
     */
    event DisputeRaised(uint256 indexed requestId, address indexed disputer);

    /**
     * @notice Emitted when dispute is resolved
     * @param requestId Request identifier
     * @param validatorWasCorrect Whether validator was correct
     */
    event DisputeResolved(uint256 indexed requestId, bool validatorWasCorrect);

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
    ) external returns (uint256 requestId);

    /**
     * @notice Register as validator by staking
     */
    function registerValidatorStake() external payable;

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
    ) external;

    /**
     * @notice Dispute a validation
     * @param requestId Request identifier
     */
    function disputeValidation(uint256 requestId) external;

    /**
     * @notice Resolve a dispute
     * @param requestId Request identifier
     * @param validatorWasCorrect Resolution outcome
     */
    function resolveDispute(uint256 requestId, bool validatorWasCorrect)
        external;

    /**
     * @notice Withdraw validator stake
     * @param amount Amount to withdraw
     */
    function withdrawValidatorStake(uint256 amount) external;

    /**
     * @notice Get validation request details
     * @param requestId Request identifier
     * @return ValidationRequest structure
     */
    function getValidationRequest(uint256 requestId)
        external
        view
        returns (ValidationRequest memory);

    /**
     * @notice Get validation response details
     * @param requestId Request identifier
     * @return ValidationResponse structure
     */
    function getValidationResponse(uint256 requestId)
        external
        view
        returns (ValidationResponse memory);

    /**
     * @notice Get validations for an agent
     * @param agentId Agent identifier
     * @return ValidationRequest[] Array of validation requests
     */
    function getValidationsByAgent(uint256 agentId)
        external
        view
        returns (ValidationRequest[] memory);

    /**
     * @notice Get validations for a task
     * @param taskId Task identifier
     * @return ValidationRequest[] Array of validation requests
     */
    function getValidationsByTask(bytes32 taskId)
        external
        view
        returns (ValidationRequest[] memory);

    /**
     * @notice Calculate approval rate for an agent
     * @param agentId Agent identifier
     * @return approvedCount Number of approved validations
     * @return totalCount Total validations
     */
    function calculateApprovalRate(uint256 agentId)
        external
        view
        returns (uint256 approvedCount, uint256 totalCount);

    /**
     * @notice Get validator reputation
     * @param validator Validator address
     * @return ValidatorStake structure
     */
    function getValidatorReputation(address validator)
        external
        view
        returns (ValidatorStake memory);
}
