import { Link } from 'react-router-dom';

interface AgentCardProps {
  agent: {
    agentId: bigint;
    agentAddress: string;
    agentDomain: string;
    contentHash: string;
    registrationTime: bigint;
    isActive: boolean;
  };
}

export function AgentCard({ agent }: AgentCardProps) {
  const agentId = agent.agentId.toString();
  const registrationDate = new Date(Number(agent.registrationTime) * 1000).toLocaleDateString();

  return (
    <Link to={`/agents/${agentId}`} className="block">
      <div className="card card-hover group">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:shadow-glow transition-all">
            <span className="text-2xl font-bold text-white">
              {agentId.slice(0, 1)}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-white truncate">
                Agent #{agentId}
              </h3>
              {agent.isActive && (
                <span className="badge badge-success">Active</span>
              )}
            </div>

            <p className="text-sm text-gray-400 mb-3 truncate">
              {agent.agentDomain}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Registered: {registrationDate}</span>
              <span>•</span>
              <span className="truncate" title={agent.agentAddress}>
                {agent.agentAddress.slice(0, 6)}...{agent.agentAddress.slice(-4)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
