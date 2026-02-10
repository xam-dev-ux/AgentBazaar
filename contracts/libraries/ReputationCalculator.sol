// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ReputationCalculator
 * @notice Library for calculating weighted reputation scores
 * @dev Provides time decay and weighted scoring algorithms
 */
library ReputationCalculator {
    // Time decay constants
    uint256 private constant DECAY_PERIOD = 90 days; // 3 months
    uint256 private constant MAX_DECAY_FACTOR = 100; // 100% weight for recent feedback
    uint256 private constant MIN_DECAY_FACTOR = 50; // 50% weight for old feedback

    /**
     * @notice Calculate weighted average score
     * @param scores Array of feedback scores (0-100)
     * @param weights Array of weights (1x or 10x based on payment proof)
     * @param timestamps Array of feedback timestamps
     * @return weightedScore Weighted average score (0-100)
     * @return totalWeight Total weight used in calculation
     */
    function calculateWeightedScore(
        uint8[] memory scores,
        uint256[] memory weights,
        uint256[] memory timestamps
    ) internal view returns (uint256 weightedScore, uint256 totalWeight) {
        require(
            scores.length == weights.length && weights.length == timestamps.length,
            "Array length mismatch"
        );

        if (scores.length == 0) {
            return (0, 0);
        }

        uint256 totalWeightedScore = 0;
        totalWeight = 0;

        for (uint256 i = 0; i < scores.length; i++) {
            // Apply time decay to weight
            uint256 decayFactor = calculateTimeDecay(timestamps[i]);
            uint256 adjustedWeight = (weights[i] * decayFactor) / 100;

            totalWeightedScore += scores[i] * adjustedWeight;
            totalWeight += adjustedWeight;
        }

        if (totalWeight == 0) {
            return (0, 0);
        }

        weightedScore = totalWeightedScore / totalWeight;
    }

    /**
     * @notice Calculate time decay factor for feedback
     * @param timestamp Feedback timestamp
     * @return decayFactor Percentage weight to apply (50-100)
     * @dev Recent feedback (< 3 months) = 100%, older = linear decay to 50%
     */
    function calculateTimeDecay(uint256 timestamp)
        internal
        view
        returns (uint256 decayFactor)
    {
        uint256 age = block.timestamp - timestamp;

        // Recent feedback (< 3 months): 100% weight
        if (age <= DECAY_PERIOD) {
            return MAX_DECAY_FACTOR;
        }

        // Old feedback (> 3 months): Linear decay from 100% to 50%
        // After 6 months: 50% weight
        uint256 decayAge = age - DECAY_PERIOD;
        uint256 decayAmount =
            (decayAge * (MAX_DECAY_FACTOR - MIN_DECAY_FACTOR)) / DECAY_PERIOD;

        if (decayAmount >= (MAX_DECAY_FACTOR - MIN_DECAY_FACTOR)) {
            return MIN_DECAY_FACTOR;
        }

        return MAX_DECAY_FACTOR - decayAmount;
    }

    /**
     * @notice Calculate score for specific skill
     * @param scores Array of scores
     * @param weights Array of weights
     * @param skillIndices Array of indices for specific skill
     * @return averageScore Average score for skill
     * @return count Number of feedbacks for skill
     */
    function calculateSkillScore(
        uint8[] memory scores,
        uint256[] memory weights,
        uint256[] memory skillIndices
    ) internal pure returns (uint256 averageScore, uint256 count) {
        if (skillIndices.length == 0) {
            return (0, 0);
        }

        uint256 totalWeightedScore = 0;
        uint256 totalWeight = 0;

        for (uint256 i = 0; i < skillIndices.length; i++) {
            uint256 idx = skillIndices[i];
            totalWeightedScore += scores[idx] * weights[idx];
            totalWeight += weights[idx];
        }

        if (totalWeight == 0) {
            return (0, 0);
        }

        averageScore = totalWeightedScore / totalWeight;
        count = skillIndices.length;
    }

    /**
     * @notice Calculate moving average score (last N feedbacks)
     * @param scores Array of scores
     * @param weights Array of weights
     * @param n Number of recent feedbacks to consider
     * @return movingAverage Moving average score
     */
    function calculateMovingAverage(
        uint8[] memory scores,
        uint256[] memory weights,
        uint256 n
    ) internal pure returns (uint256 movingAverage) {
        if (scores.length == 0) return 0;

        uint256 count = scores.length < n ? scores.length : n;
        uint256 totalWeightedScore = 0;
        uint256 totalWeight = 0;

        // Calculate from most recent feedbacks
        for (uint256 i = scores.length - count; i < scores.length; i++) {
            totalWeightedScore += scores[i] * weights[i];
            totalWeight += weights[i];
        }

        if (totalWeight == 0) return 0;

        return totalWeightedScore / totalWeight;
    }

    /**
     * @notice Calculate reputation trend (improving/declining)
     * @param scores Array of scores (chronological)
     * @param windowSize Window size for trend calculation
     * @return trend Positive = improving, negative = declining, 0 = stable
     */
    function calculateTrend(uint8[] memory scores, uint256 windowSize)
        internal
        pure
        returns (int256 trend)
    {
        if (scores.length < windowSize * 2) {
            return 0; // Not enough data
        }

        // Calculate average for first window (older)
        uint256 oldSum = 0;
        for (uint256 i = 0; i < windowSize; i++) {
            oldSum += scores[i];
        }
        uint256 oldAvg = oldSum / windowSize;

        // Calculate average for last window (recent)
        uint256 newSum = 0;
        for (uint256 i = scores.length - windowSize; i < scores.length; i++) {
            newSum += scores[i];
        }
        uint256 newAvg = newSum / windowSize;

        // Calculate trend
        return int256(newAvg) - int256(oldAvg);
    }

    /**
     * @notice Normalize score to 0-100 range
     * @param score Raw score
     * @param maxScore Maximum possible score
     * @return normalized Normalized score (0-100)
     */
    function normalizeScore(uint256 score, uint256 maxScore)
        internal
        pure
        returns (uint256 normalized)
    {
        if (maxScore == 0) return 0;
        if (score > maxScore) return 100;

        return (score * 100) / maxScore;
    }

    /**
     * @notice Calculate confidence score based on sample size
     * @param feedbackCount Number of feedbacks
     * @return confidence Confidence percentage (0-100)
     * @dev More feedbacks = higher confidence, plateaus at 50 feedbacks
     */
    function calculateConfidence(uint256 feedbackCount)
        internal
        pure
        returns (uint256 confidence)
    {
        if (feedbackCount == 0) return 0;
        if (feedbackCount >= 50) return 100;

        // Linear growth from 0 to 100 over 50 feedbacks
        return (feedbackCount * 100) / 50;
    }
}
