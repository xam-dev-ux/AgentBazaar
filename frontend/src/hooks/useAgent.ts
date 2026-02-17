import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount, useWriteContract } from 'wagmi';
import { useContracts } from './useContracts';
import toast from 'react-hot-toast';
import type { AgentInfo } from '../types';

import IdentityRegistryArtifact from '../abis-json/contracts/core/IdentityRegistry.json';

/**
 * Hook for agent-related operations
 */
export function useAgent(agentId?: number) {
  const { address } = useAccount();
  const { identityRegistry, addresses } = useContracts();
  const queryClient = useQueryClient();
  const { writeContractAsync } = useWriteContract();

  // Get agent by ID
  const { data: agent, isLoading: isLoadingAgent } = useQuery<AgentInfo | null>({
    queryKey: ['agent', agentId],
    queryFn: async () => {
      if (!identityRegistry || !agentId) return null;
      const result = await identityRegistry.read.getAgent([BigInt(agentId)]);
      return result as AgentInfo;
    },
    enabled: !!identityRegistry && !!agentId,
  });

  // Get agent by address
  const { data: agentByAddress, isLoading: isLoadingByAddress } = useQuery<AgentInfo | null>({
    queryKey: ['agent', 'byAddress', address],
    queryFn: async () => {
      if (!identityRegistry || !address) return null;
      const result = await identityRegistry.read.getAgentByAddress([address]);
      return result as AgentInfo;
    },
    enabled: !!identityRegistry && !!address,
  });

  // Get total agent count
  const { data: totalAgents } = useQuery({
    queryKey: ['agents', 'total'],
    queryFn: async () => {
      if (!identityRegistry) return 0n;
      return await identityRegistry.read.getTotalAgents();
    },
    enabled: !!identityRegistry,
  });

  // List agents with pagination
  const useListAgents = (offset: number = 0, limit: number = 10) => {
    return useQuery<AgentInfo[]>({
      queryKey: ['agents', 'list', offset, limit],
      queryFn: async () => {
        if (!identityRegistry) return [];
        const result = await identityRegistry.read.listAgents([BigInt(offset), BigInt(limit)]);
        return result as AgentInfo[];
      },
      enabled: !!identityRegistry,
    });
  };

  // Register agent mutation — uses wagmi's useWriteContract which properly
  // triggers the wallet popup and rejects cleanly on user cancel.
  const registerAgent = useMutation({
    mutationFn: async ({
      agentDomain,
      contentHash,
      tokenURI,
    }: {
      agentDomain: string;
      contentHash: `0x${string}`;
      tokenURI: string;
    }) => {
      console.log('[useAgent] registerAgent start', { agentDomain, contentHash, tokenURI });
      console.log('[useAgent] contract address:', addresses.identityRegistry);

      const hash = await writeContractAsync({
        address: addresses.identityRegistry as `0x${string}`,
        abi: IdentityRegistryArtifact.abi,
        functionName: 'registerAgent',
        args: [agentDomain, contentHash, tokenURI],
      });

      console.log('[useAgent] registerAgent tx hash:', hash);
      return hash;
    },
    onSuccess: (hash) => {
      console.log('[useAgent] registerAgent success, hash:', hash);
      toast.success('Agent registered successfully!');
      queryClient.invalidateQueries({ queryKey: ['agent'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
    onError: (error: Error) => {
      console.error('[useAgent] registerAgent error:', error);
      toast.error(`Failed to register agent: ${error.message}`);
    },
  });

  // Update agent card mutation
  const updateAgentCard = useMutation({
    mutationFn: async ({
      agentId,
      newAgentDomain,
      newContentHash,
    }: {
      agentId: number;
      newAgentDomain: string;
      newContentHash: `0x${string}`;
    }) => {
      const hash = await writeContractAsync({
        address: addresses.identityRegistry as `0x${string}`,
        abi: IdentityRegistryArtifact.abi,
        functionName: 'updateAgentCard',
        args: [BigInt(agentId), newAgentDomain, newContentHash],
      });
      return hash;
    },
    onSuccess: () => {
      toast.success('Agent card updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['agent'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update agent card: ${error.message}`);
    },
  });

  // Deactivate agent mutation
  const deactivateAgent = useMutation({
    mutationFn: async (agentId: number) => {
      const hash = await writeContractAsync({
        address: addresses.identityRegistry as `0x${string}`,
        abi: IdentityRegistryArtifact.abi,
        functionName: 'deactivateAgent',
        args: [BigInt(agentId)],
      });
      return hash;
    },
    onSuccess: () => {
      toast.success('Agent deactivated successfully!');
      queryClient.invalidateQueries({ queryKey: ['agent'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to deactivate agent: ${error.message}`);
    },
  });

  return {
    // Data
    agent,
    agentByAddress,
    totalAgents,
    isLoadingAgent,
    isLoadingByAddress,

    // Queries
    useListAgents,

    // Mutations
    registerAgent,
    updateAgentCard,
    deactivateAgent,
  };
}
