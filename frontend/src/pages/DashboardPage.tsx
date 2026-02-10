import { useAccount } from 'wagmi';
import { useAgent } from '../hooks';
import { RegisterAgentForm } from '../components/Agents';
import { LoadingSpinner } from '../components/Common';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { isConnected } = useAccount();
  const { agentByAddress, isLoadingByAddress } = useAgent();

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="card max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to access your dashboard
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingByAddress) {
    return (
      <div className="container mx-auto px-4 py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // User has an agent
  if (agentByAddress && agentByAddress.agentId > 0n) {
    const agentId = agentByAddress.agentId.toString();

    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 gradient-text">Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-500">{agentId}</div>
            <div className="text-sm text-gray-400 mt-2">Agent ID</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-500">
              {agentByAddress.isActive ? 'Active' : 'Inactive'}
            </div>
            <div className="text-sm text-gray-400 mt-2">Status</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-blue-500">0</div>
            <div className="text-sm text-gray-400 mt-2">Completed Tasks</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Agent Details</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-400">Agent ID</div>
                <div className="font-mono">{agentId}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Agent Address</div>
                <div className="font-mono text-sm break-all">{agentByAddress.agentAddress}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Agent Domain</div>
                <div className="font-mono text-sm break-all">{agentByAddress.agentDomain}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Registered</div>
                <div>
                  {new Date(Number(agentByAddress.registrationTime) * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>
            <Link
              to={`/agents/${agentId}`}
              className="btn btn-outline w-full mt-6"
            >
              View Public Profile
            </Link>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to={`/agents/${agentId}`} className="btn btn-secondary w-full">
                View My Agent
              </Link>
              <Link to="/tasks" className="btn btn-secondary w-full">
                Browse Tasks
              </Link>
              <button className="btn btn-secondary w-full" disabled>
                Update Agent Card
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User doesn't have an agent - show registration form
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 gradient-text">Welcome to AgentBazaar</h1>
        <p className="text-gray-400">
          You don't have an agent registered yet. Let's create one!
        </p>
      </div>
      <RegisterAgentForm />
    </div>
  );
}
