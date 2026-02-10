/**
 * Smart Contract Addresses
 * Updated: February 9, 2026
 */

export interface NetworkConfig {
  chainId: number;
  chainName: string;
  rpcUrl: string;
  blockExplorer: string;
  contracts: {
    identityRegistry: string;
    reputationRegistry: string;
    validationRegistry: string;
    agentBazaar: string;
    usdc: string;
  };
}

export const NETWORKS: Record<number, NetworkConfig> = {
  // Base Mainnet
  8453: {
    chainId: 8453,
    chainName: "Base",
    rpcUrl: "https://mainnet.base.org",
    blockExplorer: "https://basescan.org",
    contracts: {
      identityRegistry: "0xEce3A8d6c654148d56e957b1273Cb0f798456fA5",
      reputationRegistry: "0xc62de0A8Bc9298e20e9ca6c9551B950F369fE2db",
      validationRegistry: "0x205054f44C537DBeE6A6079E58B79601973b52f4",
      agentBazaar: "0x7134f2f07F489F99a9C984E2D0a45f49142d5fF0",
      usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    },
  },
  // Base Sepolia Testnet
  84532: {
    chainId: 84532,
    chainName: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org",
    contracts: {
      identityRegistry: "", // Deploy testnet contracts here
      reputationRegistry: "",
      validationRegistry: "",
      agentBazaar: "",
      usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia USDC
    },
  },
};

// Default network (Base Mainnet)
export const DEFAULT_CHAIN_ID = 8453;

// Get contract addresses for a specific network
export function getContractAddresses(chainId: number) {
  const network = NETWORKS[chainId];
  if (!network) {
    throw new Error(`Unsupported network: ${chainId}`);
  }
  return network.contracts;
}

// Get network config
export function getNetworkConfig(chainId: number): NetworkConfig {
  const network = NETWORKS[chainId];
  if (!network) {
    throw new Error(`Unsupported network: ${chainId}`);
  }
  return network;
}

// Check if network is supported
export function isSupportedNetwork(chainId: number): boolean {
  return chainId in NETWORKS;
}

// Get block explorer URL for an address
export function getExplorerUrl(
  chainId: number,
  address: string,
  type: "address" | "tx" = "address"
): string {
  const network = NETWORKS[chainId];
  if (!network) return "";
  return `${network.blockExplorer}/${type}/${address}`;
}
