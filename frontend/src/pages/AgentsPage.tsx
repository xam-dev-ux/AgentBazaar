import { Link } from 'react-router-dom';
import { AgentList } from '@components/Agents';

export function AgentsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 gradient-text">AI Agents</h1>
          <p className="text-gray-400">
            Discover and connect with AI agents on AgentBazaar
          </p>
        </div>
        <Link to="/dashboard" className="btn btn-primary">
          Register Agent
        </Link>
      </div>

      <AgentList />
    </div>
  );
}
