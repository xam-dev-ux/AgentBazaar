import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { getContract } from 'viem';
import { getContractAddresses } from '@config/contracts';

// Import ABIs
import IdentityRegistryABI from '@abis/contracts/core/IdentityRegistry.sol/IdentityRegistry.json';
import ReputationRegistryABI from '@abis/contracts/core/ReputationRegistry.sol/ReputationRegistry.json';
import ValidationRegistryABI from '@abis/contracts/core/ValidationRegistry.sol/ValidationRegistry.json';
import AgentBazaarABI from '@abis/contracts/marketplace/AgentBazaar.sol/AgentBazaar.json';
import USDCABI from '@abis/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json';

/**
 * Hook to get contract instances
 */
export function useContracts() {
  const { chainId } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const addresses = getContractAddresses(chainId || 8453);

  // Identity Registry (Read)
  const identityRegistry = publicClient
    ? getContract({
        address: addresses.identityRegistry as `0x${string}`,
        abi: IdentityRegistryABI.abi,
        client: publicClient,
      })
    : null;

  // Identity Registry (Write)
  const identityRegistryWrite = walletClient
    ? getContract({
        address: addresses.identityRegistry as `0x${string}`,
        abi: IdentityRegistryABI.abi,
        client: walletClient,
      })
    : null;

  // Reputation Registry (Read)
  const reputationRegistry = publicClient
    ? getContract({
        address: addresses.reputationRegistry as `0x${string}`,
        abi: ReputationRegistryABI.abi,
        client: publicClient,
      })
    : null;

  // Reputation Registry (Write)
  const reputationRegistryWrite = walletClient
    ? getContract({
        address: addresses.reputationRegistry as `0x${string}`,
        abi: ReputationRegistryABI.abi,
        client: walletClient,
      })
    : null;

  // Validation Registry (Read)
  const validationRegistry = publicClient
    ? getContract({
        address: addresses.validationRegistry as `0x${string}`,
        abi: ValidationRegistryABI.abi,
        client: publicClient,
      })
    : null;

  // Validation Registry (Write)
  const validationRegistryWrite = walletClient
    ? getContract({
        address: addresses.validationRegistry as `0x${string}`,
        abi: ValidationRegistryABI.abi,
        client: walletClient,
      })
    : null;

  // Agent Bazaar (Read)
  const agentBazaar = publicClient
    ? getContract({
        address: addresses.agentBazaar as `0x${string}`,
        abi: AgentBazaarABI.abi,
        client: publicClient,
      })
    : null;

  // Agent Bazaar (Write)
  const agentBazaarWrite = walletClient
    ? getContract({
        address: addresses.agentBazaar as `0x${string}`,
        abi: AgentBazaarABI.abi,
        client: walletClient,
      })
    : null;

  // USDC (Read)
  const usdc = publicClient
    ? getContract({
        address: addresses.usdc as `0x${string}`,
        abi: USDCABI.abi,
        client: publicClient,
      })
    : null;

  // USDC (Write)
  const usdcWrite = walletClient
    ? getContract({
        address: addresses.usdc as `0x${string}`,
        abi: USDCABI.abi,
        client: walletClient,
      })
    : null;

  return {
    addresses,
    // Read contracts
    identityRegistry,
    reputationRegistry,
    validationRegistry,
    agentBazaar,
    usdc,
    // Write contracts
    identityRegistryWrite,
    reputationRegistryWrite,
    validationRegistryWrite,
    agentBazaarWrite,
    usdcWrite,
  };
}
