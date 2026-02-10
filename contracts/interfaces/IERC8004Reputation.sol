// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC8004Reputation
 * @notice Interface for ERC-8004 Reputation Registry
 * @dev Manages feedback with x402 payment proof verification
 */
interface IERC8004Reputation {
    /**
     * @notice Proof of payment structure for x402 integration
     * @param fromAddress Client who paid
     * @param toAddress Agent who received payment
     * @param chainId Chain ID where payment occurred (8453 for Base)
     * @param txHash Transaction hash of the USDC payment
     * @param amount Payment amount in USDC (6 decimals)
     * @param timestamp When the payment was made
     * @param signature x402 signature or empty for on-chain payments
     */
    struct ProofOfPayment {
        address fromAddress;
        address toAddress;
        uint256 chainId;
        bytes32 txHash;
        uint256 amount;
        uint256 timestamp;
        bytes signature;
    }

    /**
     * @notice Feedback structure
     * @param feedbackId Unique feedback identifier
     * @param agentId Agent receiving the feedback
     * @param clientAddress Client providing feedback
     * @param taskId Associated task identifier
     * @param score Rating from 0-100
     * @param skill Skill being rated
     * @param context Context/category of the task
     * @param feedbackUri Link to detailed feedback JSON (IPFS)
     * @param contentHash Hash of feedback content for integrity
     * @param proofOfPayment Payment proof
     * @param timestamp When feedback was submitted
     */
    struct Feedback {
        uint256 feedbackId;
        uint256 agentId;
        address clientAddress;
        bytes32 taskId;
        uint8 score;
        string skill;
        string context;
        string feedbackUri;
        bytes32 contentHash;
        ProofOfPayment proofOfPayment;
        uint256 timestamp;
    }

    /**
     * @notice Emitted when client is authorized to provide feedback
     * @param agentId Agent identifier
     * @param clientAddress Authorized client
     * @param taskId Task identifier
     * @param expiresAt Authorization expiration timestamp
     */
    event FeedbackAuthorized(
        uint256 indexed agentId,
        address indexed clientAddress,
        bytes32 indexed taskId,
        uint256 expiresAt
    );

    /**
     * @notice Emitted when feedback is registered
     * @param feedbackId Unique feedback identifier
     * @param agentId Agent identifier
     * @param clientAddress Client address
     * @param taskId Task identifier
     * @param score Rating score
     */
    event FeedbackRegistered(
        uint256 indexed feedbackId,
        uint256 indexed agentId,
        address indexed clientAddress,
        bytes32 taskId,
        uint8 score
    );

    /**
     * @notice Emitted when payment proof is verified
     * @param txHash Transaction hash
     * @param fromAddress Payer
     * @param toAddress Recipient
     * @param amount Payment amount
     */
    event PaymentProofVerified(
        bytes32 indexed txHash,
        address indexed fromAddress,
        address indexed toAddress,
        uint256 amount
    );

    /**
     * @notice Authorize a client to provide feedback for a specific task
     * @param agentId Agent identifier
     * @param clientAddress Client to authorize
     * @param taskId Task identifier
     * @param expiresAt Authorization expiration timestamp
     * @param signature Signature from agent owner
     */
    function authorizeClientFeedback(
        uint256 agentId,
        address clientAddress,
        bytes32 taskId,
        uint256 expiresAt,
        bytes calldata signature
    ) external;

    /**
     * @notice Register feedback for an agent
     * @param agentId Agent identifier
     * @param taskId Task identifier
     * @param score Rating from 0-100
     * @param skill Skill being rated
     * @param context Task context
     * @param feedbackUri Link to detailed feedback JSON
     * @param contentHash Hash of feedback content
     * @param proofOfPayment Payment proof
     * @return feedbackId Unique feedback identifier
     */
    function registerFeedback(
        uint256 agentId,
        bytes32 taskId,
        uint8 score,
        string calldata skill,
        string calldata context,
        string calldata feedbackUri,
        bytes32 contentHash,
        ProofOfPayment calldata proofOfPayment
    ) external returns (uint256 feedbackId);

    /**
     * @notice Calculate weighted average score for an agent
     * @param agentId Agent identifier
     * @return weightedScore Weighted average score (0-100)
     * @return totalFeedbacks Total number of feedbacks
     */
    function calculateAverageScore(uint256 agentId)
        external
        view
        returns (uint256 weightedScore, uint256 totalFeedbacks);

    /**
     * @notice Calculate score for a specific skill
     * @param agentId Agent identifier
     * @param skill Skill name
     * @return averageScore Average score for the skill
     * @return count Number of feedbacks for this skill
     */
    function calculateScoreBySkill(uint256 agentId, string calldata skill)
        external
        view
        returns (uint256 averageScore, uint256 count);

    /**
     * @notice Get feedback history for an agent
     * @param agentId Agent identifier
     * @param offset Starting index
     * @param limit Number of feedbacks to return
     * @return Feedback[] Array of feedback structures
     */
    function getFeedbackHistory(
        uint256 agentId,
        uint256 offset,
        uint256 limit
    ) external view returns (Feedback[] memory);

    /**
     * @notice Get feedback by task ID
     * @param taskId Task identifier
     * @return Feedback structure
     */
    function getFeedbackByTask(bytes32 taskId)
        external
        view
        returns (Feedback memory);

    /**
     * @notice Check if client has provided feedback for a task
     * @param taskId Task identifier
     * @param clientAddress Client address
     * @return bool True if feedback exists
     */
    function hasClientProvidedFeedback(bytes32 taskId, address clientAddress)
        external
        view
        returns (bool);

    /**
     * @notice Get total feedback count for an agent
     * @param agentId Agent identifier
     * @return uint256 Total count
     */
    function getTotalFeedbackCount(uint256 agentId)
        external
        view
        returns (uint256);
}
