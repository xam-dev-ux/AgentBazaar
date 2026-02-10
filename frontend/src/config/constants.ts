/**
 * Application Constants
 */

// IPFS Configuration
export const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";
export const PINATA_API_URL = "https://api.pinata.cloud";

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Task Configuration
export const MIN_TASK_PRICE = "1000000"; // 1 USDC (6 decimals)
export const MAX_TASK_PRICE = "1000000000000"; // 1M USDC
export const TASK_COMPLETION_TIMEOUT = 7 * 24 * 60 * 60; // 7 days in seconds
export const AUTO_RELEASE_DELAY = 3 * 24 * 60 * 60; // 3 days in seconds

// Reputation Configuration
export const MIN_SCORE = 0;
export const MAX_SCORE = 100;
export const PAYMENT_PROOF_WEIGHT = 10; // 10x weight for verified payments
export const NO_PROOF_WEIGHT = 1; // 1x weight for unverified feedback

// Validation Configuration
export const VALIDATOR_MIN_STAKE = "10000000"; // 10 USDC minimum stake
export const DISPUTE_TIMEOUT = 7 * 24 * 60 * 60; // 7 days

// Trust Levels
export enum TrustLevel {
  REPUTATION = 0,
  CRYPTO_ECONOMIC = 1,
  ZKML = 2,
  TEE = 3,
}

export const TRUST_LEVEL_NAMES = {
  [TrustLevel.REPUTATION]: "Reputation-based",
  [TrustLevel.CRYPTO_ECONOMIC]: "Crypto-Economic",
  [TrustLevel.ZKML]: "Zero-Knowledge ML",
  [TrustLevel.TEE]: "Trusted Execution",
};

export const TRUST_LEVEL_DESCRIPTIONS = {
  [TrustLevel.REPUTATION]: "Free validation based on feedback history (for tasks <$10)",
  [TrustLevel.CRYPTO_ECONOMIC]: "Validator stakes and re-executes work ($10-$100)",
  [TrustLevel.ZKML]: "Zero-knowledge proof of correct execution (>$50, sensitive ML)",
  [TrustLevel.TEE]: "Trusted execution environment attestation (>$50, confidential)",
};

// Task Status
export enum TaskStatus {
  OPEN = 0,
  ACCEPTED = 1,
  COMPLETED = 2,
  VALIDATED = 3,
  DISPUTED = 4,
  CANCELLED = 5,
}

export const TASK_STATUS_NAMES = {
  [TaskStatus.OPEN]: "Open",
  [TaskStatus.ACCEPTED]: "Accepted",
  [TaskStatus.COMPLETED]: "Completed",
  [TaskStatus.VALIDATED]: "Validated",
  [TaskStatus.DISPUTED]: "Disputed",
  [TaskStatus.CANCELLED]: "Cancelled",
};

// Listing Status
export enum ListingStatus {
  INACTIVE = 0,
  ACTIVE = 1,
  SUSPENDED = 2,
}

export const LISTING_STATUS_NAMES = {
  [ListingStatus.INACTIVE]: "Inactive",
  [ListingStatus.ACTIVE]: "Active",
  [ListingStatus.SUSPENDED]: "Suspended",
};

// Time Constants
export const TIME_DECAY_WINDOW = 90 * 24 * 60 * 60; // 90 days in seconds
export const ONE_DAY = 24 * 60 * 60;
export const ONE_HOUR = 60 * 60;

// URL Patterns
export const IPFS_HASH_REGEX = /^Qm[a-zA-Z0-9]{44}$/;
export const ETHEREUM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

// UI Constants
export const TOAST_DURATION = 5000; // 5 seconds
export const DEBOUNCE_DELAY = 500; // 500ms
export const REFRESH_INTERVAL = 30000; // 30 seconds

// Error Messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: "Please connect your wallet",
  WRONG_NETWORK: "Please switch to Base network",
  INSUFFICIENT_BALANCE: "Insufficient balance",
  TRANSACTION_REJECTED: "Transaction rejected by user",
  TRANSACTION_FAILED: "Transaction failed",
  INVALID_INPUT: "Invalid input",
  NOT_AUTHORIZED: "You are not authorized for this action",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  AGENT_REGISTERED: "Agent registered successfully!",
  TASK_CREATED: "Task created successfully!",
  TASK_ACCEPTED: "Task accepted successfully!",
  TASK_COMPLETED: "Task completed successfully!",
  PAYMENT_RELEASED: "Payment released successfully!",
  FEEDBACK_SUBMITTED: "Feedback submitted successfully!",
};
