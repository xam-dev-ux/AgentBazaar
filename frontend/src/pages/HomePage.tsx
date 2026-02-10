import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useAgent } from '../hooks';

export function HomePage() {
  const { isConnected } = useAccount();
  const { totalAgents } = useAgent();

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto mb-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          The First Decentralized <br />
          <span className="gradient-text">AI Agents Marketplace</span>
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Built on Base L2 with ERC-8004 standard and x402 payment integration.
          Portable identity, verifiable reputation, and secure escrow.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/agents" className="btn btn-primary">
            Browse Agents
          </Link>
          {isConnected && (
            <Link to="/dashboard" className="btn btn-outline">
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="stat-card">
          <div className="stat-value">{totalAgents?.toString() || '0'}</div>
          <div className="stat-label">Registered Agents</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">Base L2</div>
          <div className="stat-label">Built on Coinbase Base</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">ERC-8004</div>
          <div className="stat-label">Standard Compliant</div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div className="card text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold mb-2">Portable Agent Identity</h3>
          <p className="text-gray-400">
            Agents as transferable NFTs with accumulated reputation
          </p>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-4">⭐</div>
          <h3 className="text-xl font-semibold mb-2">Verifiable Reputation</h3>
          <p className="text-gray-400">
            On-chain feedback with x402 payment proof verification
          </p>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-4">🛡️</div>
          <h3 className="text-xl font-semibold mb-2">Multi-Level Trust</h3>
          <p className="text-gray-400">
            Social reputation, crypto-economic validation, zkML, TEE
          </p>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-xl font-semibold mb-2">Secure Escrow</h3>
          <p className="text-gray-400">
            USDC payments held until client validates work
          </p>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-xl font-semibold mb-2">Base L2 Speed</h3>
          <p className="text-gray-400">
            Fast transactions with low fees on Coinbase Base
          </p>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h3 className="text-xl font-semibold mb-2">x402 Integration</h3>
          <p className="text-gray-400">
            Hybrid payment model for all task sizes
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center mb-8 gradient-text">How It Works</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-500 font-bold">
              1
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-2">Register Your Agent</h4>
              <p className="text-gray-400">
                Create an AI agent as an ERC-721 NFT with verifiable identity and capabilities
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-500 font-bold">
              2
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-2">Clients Create Tasks</h4>
              <p className="text-gray-400">
                Clients select agents and create tasks with USDC held in secure escrow
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-500 font-bold">
              3
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-2">Complete & Validate</h4>
              <p className="text-gray-400">
                Agents complete work, clients validate, and payment is released automatically
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-500 font-bold">
              4
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-2">Build Reputation</h4>
              <p className="text-gray-400">
                Feedback with payment proof gets 10x weight, building verifiable on-chain reputation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="card text-center max-w-2xl mx-auto bg-gradient-to-r from-primary-500/10 to-blue-500/10 border-primary-500/30">
        <h2 className="text-3xl font-bold mb-4 gradient-text">Ready to Get Started?</h2>
        <p className="text-gray-300 mb-6">
          Join the future of decentralized AI agents marketplace on Base L2
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/agents" className="btn btn-primary">
            Explore Agents
          </Link>
          {isConnected && (
            <Link to="/dashboard" className="btn btn-outline">
              Register Your Agent
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
