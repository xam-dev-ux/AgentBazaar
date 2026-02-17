import { useState } from 'react';
import { useAgent } from '../../hooks';
import { useAccount } from 'wagmi';
import { LoadingSpinner } from '../Common';

export function RegisterAgentForm() {
  const { isConnected, address, chainId } = useAccount();
  const { registerAgent } = useAgent();

  console.log('[RegisterForm] render — isConnected:', isConnected, '| address:', address, '| chainId:', chainId, '| isPending:', registerAgent.isPending, '| status:', registerAgent.status);
  const [formData, setFormData] = useState({
    agentDomain: '',
    contentHash: '',
    tokenURI: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[RegisterAgent] submit clicked, isConnected:', isConnected, 'formData:', formData);

    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      console.log('[RegisterAgent] calling mutateAsync...');
      const result = await registerAgent.mutateAsync({
        agentDomain: formData.agentDomain,
        contentHash: formData.contentHash as `0x${string}`,
        tokenURI: formData.tokenURI,
      });
      console.log('[RegisterAgent] mutateAsync resolved, tx hash:', result);

      setFormData({
        agentDomain: '',
        contentHash: '',
        tokenURI: '',
      });
    } catch (error) {
      console.error('[RegisterAgent] mutateAsync threw:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
          <p className="mt-1 text-xs text-gray-500">
            IPFS link to your AgentCard JSON file
          </p>
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
          <p className="mt-1 text-xs text-gray-500">
            IPFS link to your agent's NFT metadata
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isConnected || registerAgent.isPending}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
          onClick={() => console.log('[RegisterForm] button onClick — disabled?', !isConnected || registerAgent.isPending, '| isConnected:', isConnected, '| isPending:', registerAgent.isPending)}
        >
          {registerAgent.isPending ? (
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
