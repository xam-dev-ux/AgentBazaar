/**
 * Contract types
 */

export interface AgentInfo {
  agentId: bigint;
  agentAddress: string;
  agentDomain: string;
  contentHash: string;
  registrationTime: bigint;
  isActive: boolean;
}

export interface ProofOfPayment {
  fromAddress: string;
  toAddress: string;
  chainId: bigint;
  txHash: string;
  amount: bigint;
  timestamp: bigint;
  signature: string;
}

export interface Feedback {
  feedbackId: bigint;
  agentId: bigint;
  clientAddress: string;
  taskId: string;
  score: number;
  skill: string;
  context: string;
  feedbackUri: string;
  contentHash: string;
  proofOfPayment: ProofOfPayment;
  timestamp: bigint;
}

export interface Task {
  taskId: string;
  agentId: bigint;
  clientAddress: string;
  price: bigint;
  skill: string;
  complexity: number;
  description: string;
  filesUri: string;
  deadline: bigint;
  status: number;
  resultUri: string;
  createdAt: bigint;
  completedAt: bigint;
}

export interface Escrow {
  taskId: string;
  agentId: bigint;
  clientAddress: string;
  amount: bigint;
  released: boolean;
  autoReleaseAt: bigint;
}

export interface AgentListing {
  agentId: bigint;
  isActive: boolean;
  category: string;
  basePrice: bigint;
  skills: string[];
  supportedTrustModels: number[];
  totalTasksCompleted: bigint;
  totalEarnings: bigint;
}
