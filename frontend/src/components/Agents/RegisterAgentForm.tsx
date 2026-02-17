import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../Common';
import { getContractAddresses } from '../../config/contracts';

import IdentityRegistryArtifact from '../../abis-json/contracts/core/IdentityRegistry.json';

export function RegisterAgentForm() {
  const { isConnected, chainId } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const queryClient = useQueryClient();
  const addresses = getContractAddresses(chainId || 8453);

  const [formData, setFormData] = useState({
    agentDomain: '',
    contentHash: '',
    tokenURI: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[RegisterAgent] submit, formData:', formData);

    try {
      console.log('[RegisterAgent] calling writeContractAsync...');
      const hash = await writeContractAsync({
        address: addresses.identityRegistry as `0x${string}`,
        abi: IdentityRegistryArtifact.abi,
        functionName: 'registerAgent',
        args: [formData.agentDomain, formData.contentHash as `0x${string}`, formData.tokenURI],
      });
      console.log('[RegisterAgent] tx hash:', hash);
      toast.success('Agent registered successfully!');
      queryClient.invalidateQueries({ queryKey: ['agent'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setFormData({ agentDomain: '', contentHash: '', tokenURI: '' });
    } catch (error) {
      console.error('[RegisterAgent] error:', error);
      toast.error(`Failed to register agent: ${(error as Error).message}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="card max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 gradient-text">Register Your Agent</h2>

      <div className="space-y-6">
        {/* Agent Domain */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Agent Domain (IPFS URL)
          </label>
          <input
            type="text"
            name="agentDomain"
            value={formData.agentDomain}
            onChange={handleChange}
            placeholder="ipfs://Qm.../agentcard.json"
            className="input"
            required
          />
          <p className="mt-1 text-xs text-gray-500">IPFS link to your AgentCard JSON file</p>
        </div>

        {/* Content Hash */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Content Hash (keccak256)
          </label>
          <input
            type="text"
            name="contentHash"
            value={formData.contentHash}
            onChange={handleChange}
            placeholder="0x..."
            className="input font-mono text-sm"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Keccak256 hash of your AgentCard JSON for verification
          </p>
        </div>

        {/* Token URI */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Token URI (NFT Metadata)
          </label>
          <input
            type="text"
            name="tokenURI"
            value={formData.tokenURI}
            onChange={handleChange}
            placeholder="ipfs://Qm.../metadata.json"
            className="input"
            required
          />
          <p className="mt-1 text-xs text-gray-500">IPFS link to your agent's NFT metadata</p>
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
              Registering...
            </>
          ) : (
            'Register Agent'
          )}
        </button>

        {!isConnected && (
          <p className="text-center text-sm text-yellow-500">
            Please connect your wallet to register an agent
          </p>
        )}
      </div>
    </form>
  );
}
