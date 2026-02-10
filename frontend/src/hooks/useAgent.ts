import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { useContracts } from './useContracts';
import toast from 'react-hot-toast';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../config/constants';

/**
 * Hook for agent-related operations
 */
export function useAgent(agentId?: number) {
  const { address } = useAccount();
  const { identityRegistry, identityRegistryWrite } = useContracts();
  const queryClient = useQueryClient();

  // Get agent by ID
  const { data: agent, isLoading: isLoadingAgent } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: async () => {
      if (!identityRegistry || !agentId) return null;
      return await identityRegistry.read.getAgent([BigInt(agentId)]);
    },
    enabled: !!identityRegistry && !!agentId,
  });

  // Get agent by address
  const { data: agentByAddress, isLoading: isLoadingByAddress } = useQuery({
    queryKey: ['agent', 'byAddress', address],
    queryFn: async () => {
      if (!identityRegistry || !address) return null;
      return await identityRegistry.read.getAgentByAddress([address]);
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
    return useQuery({
      queryKey: ['agents', 'list', offset, limit],
      queryFn: async () => {
        if (!identityRegistry) return [];
        return await identityRegistry.read.listAgents([BigInt(offset), BigInt(limit)]);
      },
      enabled: !!identityRegistry,
    });
  };

  // Register agent mutation
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
      if (!identityRegistryWrite) throw new Error('Wallet not connected');

      const hash = await identityRegistryWrite.write.registerAgent([
        agentDomain,
        contentHash,
        tokenURI,
      ]);

      return hash;
    },
    onSuccess: () => {
      toast.success('Agent registered successfully!');
      queryClient.invalidateQueries({ queryKey: ['agent'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
    onError: (error: Error) => {
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
      if (!identityRegistryWrite) throw new Error('Wallet not connected');

      const hash = await identityRegistryWrite.write.updateAgentCard([
        BigInt(agentId),
        newAgentDomain,
        newContentHash,
      ]);

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
      if (!identityRegistryWrite) throw new Error('Wallet not connected');

      const hash = await identityRegistryWrite.write.deactivateAgent([BigInt(agentId)]);

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
