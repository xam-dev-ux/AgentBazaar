// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "../interfaces/IERC8004Reputation.sol";

/**
 * @title X402ProofVerifier
 * @notice Library for verifying x402 payment proofs
 * @dev Provides signature verification and on-chain tx verification
 */
library X402ProofVerifier {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Custom errors
    error InvalidSignature();
    error SignatureMismatch(address expected, address recovered);
    error InvalidChainId(uint256 expected, uint256 provided);
    error ZeroAmount();
    error FutureTimestamp();

    /**
     * @notice Verify x402 payment proof signature
     * @param proof Payment proof structure
     * @return bool True if signature is valid
     */
    function verifySignature(IERC8004Reputation.ProofOfPayment memory proof)
        internal
        view
        returns (bool)
    {
        // Skip verification if no signature provided (on-chain payment)
        if (proof.signature.length == 0) {
            return true;
        }

        // Basic validations
        if (proof.amount == 0) revert ZeroAmount();
        if (proof.timestamp > block.timestamp) revert FutureTimestamp();
        if (proof.chainId != block.chainid) {
            revert InvalidChainId(block.chainid, proof.chainId);
        }

        // Construct message hash
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                proof.fromAddress,
                proof.toAddress,
                proof.chainId,
                proof.txHash,
                proof.amount,
                proof.timestamp
            )
        );

        // Convert to Ethereum signed message hash
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();

        // Recover signer
        address recovered = ethSignedMessageHash.recover(proof.signature);

        // Verify signer matches fromAddress
        if (recovered != proof.fromAddress) {
            revert SignatureMismatch(proof.fromAddress, recovered);
        }

        return true;
    }

    /**
     * @notice Check if signature is valid without reverting
     * @param proof Payment proof structure
     * @return bool True if signature is valid, false otherwise
     */
    function isValidSignature(IERC8004Reputation.ProofOfPayment memory proof)
        internal
        view
        returns (bool)
    {
        // Skip verification if no signature provided (on-chain payment)
        if (proof.signature.length == 0) {
            return true;
        }

        // Basic validations
        if (proof.amount == 0) return false;
        if (proof.timestamp > block.timestamp) return false;
        if (proof.chainId != block.chainid) return false;

        // Construct message hash
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                proof.fromAddress,
                proof.toAddress,
                proof.chainId,
                proof.txHash,
                proof.amount,
                proof.timestamp
            )
        );

        // Convert to Ethereum signed message hash
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();

        // Recover signer
        address recovered = ethSignedMessageHash.recover(proof.signature);

        // Verify signer matches fromAddress
        return recovered == proof.fromAddress;
    }

    /**
     * @notice Recover signer from payment proof
     * @param proof Payment proof structure
     * @return address Recovered signer address
     */
    function recoverSigner(IERC8004Reputation.ProofOfPayment memory proof)
        internal
        pure
        returns (address)
    {
        if (proof.signature.length == 0) {
            return address(0);
        }

        bytes32 messageHash = keccak256(
            abi.encodePacked(
                proof.fromAddress,
                proof.toAddress,
                proof.chainId,
                proof.txHash,
                proof.amount,
                proof.timestamp
            )
        );

        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        return ethSignedMessageHash.recover(proof.signature);
    }

    /**
     * @notice Calculate feedback weight based on payment proof
     * @param proof Payment proof structure
     * @return weight Reputation weight (1x or 10x)
     * @dev Feedback WITH valid proof = 10x weight, WITHOUT = 1x weight
     */
    function calculateFeedbackWeight(IERC8004Reputation.ProofOfPayment memory proof)
        internal
        view
        returns (uint256 weight)
    {
        // No signature = no proof = 1x weight
        if (proof.signature.length == 0) {
            return 1;
        }

        // Check if signature is valid (non-reverting check)
        if (!isValidSignature(proof)) {
            return 1;
        }

        // Valid payment proof = 10x weight
        return 10;
    }

    /**
     * @notice Verify basic proof validity (amount, timestamp, chainId)
     * @param proof Payment proof structure
     * @return bool True if basic checks pass
     */
    function verifyBasicProof(IERC8004Reputation.ProofOfPayment memory proof)
        internal
        view
        returns (bool)
    {
        if (proof.amount == 0) return false;
        if (proof.timestamp > block.timestamp) return false;
        if (proof.chainId != block.chainid) return false;
        if (proof.fromAddress == address(0)) return false;
        if (proof.toAddress == address(0)) return false;

        return true;
    }

    /**
     * @notice Create message hash for signing
     * @param fromAddress Payer address
     * @param toAddress Recipient address
     * @param chainId Chain ID
     * @param txHash Transaction hash
     * @param amount Payment amount
     * @param timestamp Payment timestamp
     * @return bytes32 Message hash
     */
    function createMessageHash(
        address fromAddress,
        address toAddress,
        uint256 chainId,
        bytes32 txHash,
        uint256 amount,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    fromAddress,
                    toAddress,
                    chainId,
                    txHash,
                    amount,
                    timestamp
                )
            );
    }

    /**
     * @notice Verify proof matches expected parameters
     * @param proof Payment proof
     * @param expectedFrom Expected payer
     * @param expectedTo Expected recipient
     * @param minAmount Minimum expected amount
     * @return bool True if proof matches expectations
     */
    function verifyProofParameters(
        IERC8004Reputation.ProofOfPayment memory proof,
        address expectedFrom,
        address expectedTo,
        uint256 minAmount
    ) internal pure returns (bool) {
        if (proof.fromAddress != expectedFrom) return false;
        if (proof.toAddress != expectedTo) return false;
        if (proof.amount < minAmount) return false;

        return true;
    }
}
