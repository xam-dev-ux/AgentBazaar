import { useParams, Link } from 'react-router-dom';
import { useAgent, useTasks } from '../hooks';
import { LoadingSpinner, EmptyState } from '../components/Common';
import { CreateTaskForm } from '../components/Tasks';
import { useState } from 'react';
import { formatUnits } from 'viem';

export function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const agentId = id ? parseInt(id) : undefined;
  const { agent, isLoadingAgent } = useAgent(agentId);
  const { useAgentListing } = useTasks();
  const { data: agentListing } = useAgentListing(agentId);
  const [showCreateTask, setShowCreateTask] = useState(false);

  if (isLoadingAgent) {
    return (
      <div className="container mx-auto px-4 py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!agent || !agentId) {
    return (
      <div className="container mx-auto px-4 py-12">
        <EmptyState
          title="Agent not found"
          description="The agent you're looking for doesn't exist"
          action={
            <Link to="/agents" className="btn btn-primary">
              Browse Agents
            </Link>
          }
        />
      </div>
    );
  }

  // Check if agent has a marketplace listing
  const hasListing = agentListing && agentListing.agentId > 0n;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back button */}
      <Link to="/agents" className="text-primary-500 hover:text-primary-400 mb-6 inline-flex items-center gap-2">
        ← Back to Agents
      </Link>

      {/* Agent Header */}
      <div className="card mb-8">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-4xl font-bold text-white">
              {agentId.toString().slice(0, 1)}
            </span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold">Agent #{agentId}</h1>
              {agent.isActive && (
                <span className="badge badge-success">Active</span>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Agent Domain:</span>{' '}
                <span className="font-mono text-primary-400">{agent.agentDomain}</span>
              </div>
              <div>
                <span className="text-gray-400">Owner:</span>{' '}
                <span className="font-mono">{agent.agentAddress}</span>
              </div>
              {hasListing && (
                <>
                  <div>
                    <span className="text-gray-400">Base Price:</span>{' '}
                    <span className="font-semibold text-green-400">{formatUnits(agentListing.basePrice, 6)} USDC</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Category:</span>{' '}
                    <span>{agentListing.category || 'General'}</span>
                  </div>
                </>
              )}
              <div>
                <span className="text-gray-400">Registered:</span>{' '}
                {new Date(Number(agent.registrationTime) * 1000).toLocaleDateString()}
              </div>
            </div>
          </div>

          {hasListing ? (
            <button
              onClick={() => setShowCreateTask(!showCreateTask)}
              className="btn btn-primary"
            >
              Create Task
            </button>
          ) : (
            <div className="text-sm text-yellow-500 text-right">
              Not available for tasks
            </div>
          )}
        </div>
      </div>

      {/* Create Task Form */}
      {showCreateTask && hasListing && (
        <div className="mb-8">
          <CreateTaskForm
            agentId={agentId}
            basePrice={agentListing.basePrice}
            onSuccess={() => setShowCreateTask(false)}
          />
        </div>
      )}

      {/* No Listing Warning */}
      {!hasListing && (
        <div className="card mb-8 bg-yellow-500/10 border-yellow-500/20">
          <h3 className="text-lg font-semibold text-yellow-500 mb-2">Not Available for Tasks</h3>
          <p className="text-gray-400">
            This agent is registered but hasn't set up a marketplace listing yet.
            The agent owner needs to create a listing with pricing information before tasks can be assigned.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card">
          <div className="stat-value">{hasListing ? agentListing.totalTasksCompleted.toString() : '0'}</div>
          <div className="stat-label">Tasks Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{hasListing ? `${formatUnits(agentListing.totalEarnings, 6)} USDC` : '-'}</div>
          <div className="stat-label">Total Earnings</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{hasListing ? agentListing.skills.length : '0'}</div>
          <div className="stat-label">Skills</div>
        </div>
      </div>

      {/* About */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-4">About This Agent</h2>
        <p className="text-gray-400">
          This agent is registered on AgentBazaar with verifiable on-chain identity.
          All tasks and feedback are recorded on Base L2 blockchain.
        </p>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <EmptyState
          icon={<div className="text-4xl">📊</div>}
          title="No activity yet"
          description="This agent hasn't completed any tasks yet"
        />
      </div>
    </div>
  );
}
