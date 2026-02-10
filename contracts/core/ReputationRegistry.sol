// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IERC8004Reputation.sol";
import "../interfaces/IERC8004Identity.sol";
import "../libraries/X402ProofVerifier.sol";
import "../libraries/ReputationCalculator.sol";

/**
 * @title ReputationRegistry
 * @notice ERC-8004 compliant Reputation Registry with x402 payment proof verification
 * @dev Manages feedback with weighted scoring based on payment proofs
 * @custom:security-contact security@agentbazaar.xyz
 */
contract ReputationRegistry is
    Ownable,
    ReentrancyGuard,
    IERC8004Reputation
{
    using X402ProofVerifier for ProofOfPayment;
    using ReputationCalculator for uint8[];

    // Identity Registry reference
    IERC8004Identity public immutable identityRegistry;

    // Feedback counter
    uint256 private _feedbackIdCounter;

    // Mapping: feedbackId => Feedback
    mapping(uint256 => Feedback) private _feedbacks;

    // Mapping: agentId => feedbackId[]
    mapping(uint256 => uint256[]) private _agentFeedbacks;

    // Mapping: taskId => feedbackId
    mapping(bytes32 => uint256) private _taskFeedbacks;

    // Mapping: agentId => clientAddress => taskId => authorized
    mapping(uint256 => mapping(address => mapping(bytes32 => bool)))
        private _authorizations;

    // Mapping: agentId => clientAddress => taskId => expiresAt
    mapping(uint256 => mapping(address => mapping(bytes32 => uint256)))
        private _authorizationExpiry;

    // Custom errors
    error AgentNotFound(uint256 agentId);
    error NotAuthorized(uint256 agentId, address client, bytes32 taskId);
    error AuthorizationExpired(uint256 expiresAt);
    error FeedbackAlreadyExists(bytes32 taskId);
    error InvalidScore(uint8 score);
    error InvalidProofOfPayment();
    error FeedbackNotFound(uint256 feedbackId);

    /**
     * @notice Constructor
     * @param _identityRegistry Address of the Identity Registry
     */
    constructor(address _identityRegistry) Ownable(msg.sender) {
        identityRegistry = IERC8004Identity(_identityRegistry);
        _feedbackIdCounter = 1;
    }

    /**
     * @notice Authorize a client to provide feedback for a specific task
     * @param agentId Agent identifier
     * @param clientAddress Client to authorize
     * @param taskId Task identifier
     * @param expiresAt Authorization expiration timestamp
     * @param signature Signature from agent owner (currently unused, for future use)
     */
    function authorizeClientFeedback(
        uint256 agentId,
        address clientAddress,
        bytes32 taskId,
        uint256 expiresAt,
        bytes calldata signature
    ) external {
        // Verify agent exists
        IERC8004Identity.AgentInfo memory agent = identityRegistry.getAgent(
            agentId
        );
        if (agent.agentId == 0) revert AgentNotFound(agentId);

        // Verify caller owns the agent
        if (agent.agentAddress != msg.sender) {
            revert NotAuthorized(agentId, msg.sender, taskId);
        }

        // Store authorization
        _authorizations[agentId][clientAddress][taskId] = true;
        _authorizationExpiry[agentId][clientAddress][taskId] = expiresAt;

        emit FeedbackAuthorized(agentId, clientAddress, taskId, expiresAt);
    }

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
    ) external nonReentrant returns (uint256 feedbackId) {
        // Validate score
        if (score > 100) revert InvalidScore(score);

        // Check authorization
        if (!_authorizations[agentId][msg.sender][taskId]) {
            revert NotAuthorized(agentId, msg.sender, taskId);
        }

        // Check expiration
        uint256 expiresAt = _authorizationExpiry[agentId][msg.sender][taskId];
        if (block.timestamp > expiresAt) {
            revert AuthorizationExpired(expiresAt);
        }

        // Check for duplicate feedback
        if (_taskFeedbacks[taskId] != 0) {
            revert FeedbackAlreadyExists(taskId);
        }

        // Verify payment proof (basic validation)
        if (!X402ProofVerifier.verifyBasicProof(proofOfPayment)) {
            revert InvalidProofOfPayment();
        }

        // Verify proof parameters match
        IERC8004Identity.AgentInfo memory agent = identityRegistry.getAgent(
            agentId
        );
        if (
            !X402ProofVerifier.verifyProofParameters(
                proofOfPayment,
                msg.sender,
                agent.agentAddress,
                0 // Allow any amount
            )
        ) {
            revert InvalidProofOfPayment();
        }

        // Get new feedback ID
        feedbackId = _feedbackIdCounter++;

        // Create feedback
        _feedbacks[feedbackId] = Feedback({
            feedbackId: feedbackId,
            agentId: agentId,
            clientAddress: msg.sender,
            taskId: taskId,
            score: score,
            skill: skill,
            context: context,
            feedbackUri: feedbackUri,
            contentHash: contentHash,
            proofOfPayment: proofOfPayment,
            timestamp: block.timestamp
        });

        // Add to agent's feedback list
        _agentFeedbacks[agentId].push(feedbackId);

        // Map task to feedback
        _taskFeedbacks[taskId] = feedbackId;

        // Emit payment proof verified event if signature exists
        if (proofOfPayment.signature.length > 0) {
            emit PaymentProofVerified(
                proofOfPayment.txHash,
                proofOfPayment.fromAddress,
                proofOfPayment.toAddress,
                proofOfPayment.amount
            );
        }

        emit FeedbackRegistered(
            feedbackId,
            agentId,
            msg.sender,
            taskId,
            score
        );
    }

    /**
     * @notice Calculate weighted average score for an agent
     * @param agentId Agent identifier
     * @return weightedScore Weighted average score (0-100)
     * @return totalFeedbacks Total number of feedbacks
     */
    function calculateAverageScore(uint256 agentId)
        external
        view
        returns (uint256 weightedScore, uint256 totalFeedbacks)
    {
        uint256[] memory feedbackIds = _agentFeedbacks[agentId];
        totalFeedbacks = feedbackIds.length;

        if (totalFeedbacks == 0) {
            return (0, 0);
        }

        // Prepare arrays for calculation
        uint8[] memory scores = new uint8[](totalFeedbacks);
        uint256[] memory weights = new uint256[](totalFeedbacks);
        uint256[] memory timestamps = new uint256[](totalFeedbacks);

        for (uint256 i = 0; i < totalFeedbacks; i++) {
            Feedback memory feedback = _feedbacks[feedbackIds[i]];
            scores[i] = feedback.score;
            weights[i] = X402ProofVerifier.calculateFeedbackWeight(
                feedback.proofOfPayment
            );
            timestamps[i] = feedback.timestamp;
        }

        // Calculate weighted score with time decay
        (weightedScore, ) = ReputationCalculator.calculateWeightedScore(
            scores,
            weights,
            timestamps
        );
    }

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
        returns (uint256 averageScore, uint256 count)
    {
        uint256[] memory feedbackIds = _agentFeedbacks[agentId];

        if (feedbackIds.length == 0) {
            return (0, 0);
        }

        // Find feedbacks with matching skill
        uint256[] memory matchingIndices = new uint256[](feedbackIds.length);
        uint256 matchCount = 0;

        for (uint256 i = 0; i < feedbackIds.length; i++) {
            Feedback memory feedback = _feedbacks[feedbackIds[i]];
            if (
                keccak256(abi.encodePacked(feedback.skill)) ==
                keccak256(abi.encodePacked(skill))
            ) {
                matchingIndices[matchCount] = i;
                matchCount++;
            }
        }

        if (matchCount == 0) {
            return (0, 0);
        }

        // Prepare arrays for matching feedbacks
        uint8[] memory scores = new uint8[](matchCount);
        uint256[] memory weights = new uint256[](matchCount);

        for (uint256 i = 0; i < matchCount; i++) {
            uint256 idx = matchingIndices[i];
            Feedback memory feedback = _feedbacks[feedbackIds[idx]];
            scores[i] = feedback.score;
            weights[i] = X402ProofVerifier.calculateFeedbackWeight(
                feedback.proofOfPayment
            );
        }

        // Calculate average
        uint256 totalWeightedScore = 0;
        uint256 totalWeight = 0;

        for (uint256 i = 0; i < matchCount; i++) {
            totalWeightedScore += scores[i] * weights[i];
            totalWeight += weights[i];
        }

        averageScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
        count = matchCount;
    }

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
    ) external view returns (Feedback[] memory) {
        uint256[] memory feedbackIds = _agentFeedbacks[agentId];
        uint256 total = feedbackIds.length;

        if (offset >= total) {
            return new Feedback[](0);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        uint256 resultSize = end - offset;

        Feedback[] memory result = new Feedback[](resultSize);
        for (uint256 i = 0; i < resultSize; i++) {
            result[i] = _feedbacks[feedbackIds[offset + i]];
        }

        return result;
    }

    /**
     * @notice Get feedback by task ID
     * @param taskId Task identifier
     * @return Feedback structure
     */
    function getFeedbackByTask(bytes32 taskId)
        external
        view
        returns (Feedback memory)
    {
        uint256 feedbackId = _taskFeedbacks[taskId];
        if (feedbackId == 0) revert FeedbackNotFound(0);
        return _feedbacks[feedbackId];
    }

    /**
     * @notice Check if client has provided feedback for a task
     * @param taskId Task identifier
     * @param clientAddress Client address
     * @return bool True if feedback exists
     */
    function hasClientProvidedFeedback(bytes32 taskId, address clientAddress)
        external
        view
        returns (bool)
    {
        uint256 feedbackId = _taskFeedbacks[taskId];
        if (feedbackId == 0) return false;

        return _feedbacks[feedbackId].clientAddress == clientAddress;
    }

    /**
     * @notice Get total feedback count for an agent
     * @param agentId Agent identifier
     * @return uint256 Total count
     */
    function getTotalFeedbackCount(uint256 agentId)
        external
        view
        returns (uint256)
    {
        return _agentFeedbacks[agentId].length;
    }
}
