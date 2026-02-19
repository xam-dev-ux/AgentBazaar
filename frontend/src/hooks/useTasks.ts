import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { useContracts } from './useContracts';
import { parseUnits } from 'viem';
import toast from 'react-hot-toast';
import type { Task, AgentListing } from '../types';

/**
 * Hook for task-related operations
 */
export function useTasks() {
  const { address } = useAccount();
  const { agentBazaar, agentBazaarWrite, usdc, usdcWrite } = useContracts();
  const queryClient = useQueryClient();

  // Get agent listing
  const useAgentListing = (agentId?: number) => {
    return useQuery<AgentListing | null>({
      queryKey: ['agentListing', agentId],
      queryFn: async () => {
        if (!agentBazaar || !agentId) return null;
        const result = await agentBazaar.read.getAgentListing([BigInt(agentId)]);
        return result as AgentListing;
      },
      enabled: !!agentBazaar && !!agentId,
    });
  };

  // Get task by ID
  const useTask = (taskId?: `0x${string}`) => {
    return useQuery<Task | null>({
      queryKey: ['task', taskId],
      queryFn: async () => {
        if (!agentBazaar || !taskId) return null;
        const result = await agentBazaar.read.getTask([taskId]);
        return result as Task;
      },
      enabled: !!agentBazaar && !!taskId,
    });
  };

  // Get tasks by agent
  const useTasksByAgent = (agentId?: number) => {
    return useQuery<Task[]>({
      queryKey: ['tasks', 'agent', agentId],
      queryFn: async () => {
        if (!agentBazaar || !agentId) return [];
        const result = await agentBazaar.read.getTasksByAgent([BigInt(agentId)]);
        return result as Task[];
      },
      enabled: !!agentBazaar && !!agentId,
    });
  };

  // Get tasks by client
  const useTasksByClient = (clientAddress?: `0x${string}`) => {
    return useQuery<Task[]>({
      queryKey: ['tasks', 'client', clientAddress],
      queryFn: async () => {
        if (!agentBazaar || !clientAddress) return [];
        const result = await agentBazaar.read.getTasksByClient([clientAddress]);
        return result as Task[];
      },
      enabled: !!agentBazaar && !!clientAddress,
    });
  };

  // Get USDC allowance
  const { data: usdcAllowance } = useQuery<bigint>({
    queryKey: ['usdc', 'allowance', address],
    queryFn: async () => {
      if (!usdc || !address || !agentBazaar) return 0n;
      const result = await usdc.read.allowance([address, agentBazaar.address as `0x${string}`]);
      return result as bigint;
    },
    enabled: !!usdc && !!address && !!agentBazaar,
  });

  // Approve USDC mutation
  const approveUSDC = useMutation({
    mutationFn: async (amount: string) => {
      if (!usdcWrite) throw new Error('Wallet not connected');

      const amountWei = parseUnits(amount, 6); // USDC has 6 decimals
      const hash = await usdcWrite.write.approve([
        agentBazaarWrite?.address as `0x${string}`,
        amountWei,
      ]);

      return hash;
    },
    onSuccess: () => {
      toast.success('USDC approved successfully!');
      queryClient.invalidateQueries({ queryKey: ['usdc', 'allowance'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve USDC: ${error.message}`);
    },
  });

  // Create task mutation
  const createTask = useMutation({
    mutationFn: async ({
      agentId,
      skill,
      complexity,
      description,
      filesUri,
      deadline,
    }: {
      agentId: number;
      skill: string;
      complexity: number;
      description: string;
      filesUri: string;
      deadline: number;
    }) => {
      if (!agentBazaarWrite) throw new Error('Wallet not connected');

      const hash = await agentBazaarWrite.write.createTask([
        BigInt(agentId),
        skill,
        BigInt(complexity),
        description,
        filesUri,
        BigInt(deadline),
      ]);

      return hash;
    },
    onSuccess: () => {
      toast.success('Task created successfully!');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create task: ${error.message}`);
    },
  });

  // Accept task mutation
  const acceptTask = useMutation({
    mutationFn: async (taskId: `0x${string}`) => {
      if (!agentBazaarWrite) throw new Error('Wallet not connected');

      const hash = await agentBazaarWrite.write.acceptTask([taskId]);
      return hash;
    },
    onSuccess: () => {
      toast.success('Task accepted successfully!');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to accept task: ${error.message}`);
    },
  });

  // Complete task mutation
  const completeTask = useMutation({
    mutationFn: async ({ taskId, resultUri }: { taskId: `0x${string}`; resultUri: string }) => {
      if (!agentBazaarWrite) throw new Error('Wallet not connected');

      const hash = await agentBazaarWrite.write.completeTask([taskId, resultUri]);
      return hash;
    },
    onSuccess: () => {
      toast.success('Task completed successfully!');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to complete task: ${error.message}`);
    },
  });

  // Validate and release payment mutation
  const validateAndRelease = useMutation({
    mutationFn: async ({ taskId, approved }: { taskId: `0x${string}`; approved: boolean }) => {
      if (!agentBazaarWrite) throw new Error('Wallet not connected');

      const hash = await agentBazaarWrite.write.validateAndRelease([taskId, approved]);
      return hash;
    },
    onSuccess: (_, { approved }) => {
      toast.success(approved ? 'Payment released!' : 'Task disputed');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to validate task: ${error.message}`);
    },
  });

  // Cancel task mutation
  const cancelTask = useMutation({
    mutationFn: async (taskId: `0x${string}`) => {
      if (!agentBazaarWrite) throw new Error('Wallet not connected');

      const hash = await agentBazaarWrite.write.cancelTask([taskId]);
      return hash;
    },
    onSuccess: () => {
      toast.success('Task cancelled successfully!');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel task: ${error.message}`);
    },
  });

  return {
    // Queries
    useAgentListing,
    useTask,
    useTasksByAgent,
    useTasksByClient,

    // Data
    usdcAllowance,

    // Mutations
    approveUSDC,
    createTask,
    acceptTask,
    completeTask,
    validateAndRelease,
    cancelTask,
  };
}
