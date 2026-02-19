import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { parseUnits } from 'viem';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../Common';
import { getContractAddresses } from '../../config/contracts';

import AgentBazaarArtifact from '../../abis-json/contracts/marketplace/AgentBazaar.json';

interface ListAgentFormProps {
  agentId: number;
  onSuccess?: () => void;
}

export function ListAgentForm({ agentId, onSuccess }: ListAgentFormProps) {
  const { isConnected, chainId } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const queryClient = useQueryClient();
  const addresses = getContractAddresses(chainId || 8453);

  const [formData, setFormData] = useState({
    category: '',
    basePrice: '',
    skills: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const basePriceWei = parseUnits(formData.basePrice, 6); // USDC has 6 decimals
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);

      // For now, using empty array for trust models (optional feature)
      const trustModels: number[] = [];

      const hash = await writeContractAsync({
        address: addresses.agentBazaar as `0x${string}`,
        abi: AgentBazaarArtifact.abi,
        functionName: 'listAgent',
        args: [BigInt(agentId), formData.category, basePriceWei, skillsArray, trustModels],
      });

      console.log('[ListAgent] tx hash:', hash);
      toast.success('Agent listed in marketplace successfully!');
      queryClient.invalidateQueries({ queryKey: ['agentListing'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });

      setFormData({ category: '', basePrice: '', skills: '' });
      onSuccess?.();
    } catch (error) {
      console.error('[ListAgent] error:', error);
      toast.error(`Failed to list agent: ${(error as Error).message}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 className="text-2xl font-bold mb-6 gradient-text">List Agent in Marketplace</h2>

      <p className="text-gray-400 mb-6">
        Create a marketplace listing to allow clients to assign tasks to your agent.
      </p>

      <div className="space-y-6">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g., data-analysis, web-development, ai-assistant"
            className="input"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            The category that best describes your agent's capabilities
          </p>
        </div>

        {/* Base Price */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Base Price (USDC)
          </label>
          <input
            type="number"
            name="basePrice"
            value={formData.basePrice}
            onChange={handleChange}
            placeholder="10.00"
            step="0.01"
            min="0.01"
            className="input"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Price per complexity point. Final task price = Base Price × Complexity (1-10)
          </p>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Skills (comma-separated)
          </label>
          <textarea
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="python, data-analysis, machine-learning, web-scraping"
            rows={3}
            className="textarea"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter skills separated by commas
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isConnected || isPending}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <LoadingSpinner size="sm" />
              Creating Listing...
            </>
          ) : (
            'Create Marketplace Listing'
          )}
        </button>

        {!isConnected && (
          <p className="text-center text-sm text-yellow-500">
            Please connect your wallet to create a listing
          </p>
        )}
      </div>
    </form>
  );
}
