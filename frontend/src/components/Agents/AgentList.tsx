import { useAgent } from '../../hooks';
import { AgentCard } from './AgentCard';
import { LoadingSpinner, EmptyState } from '../Common';
import { useState } from 'react';

export function AgentList() {
  const [offset, setOffset] = useState(0);
  const limit = 12;
  const { useListAgents, totalAgents } = useAgent();
  const { data: agents, isLoading } = useListAgents(offset, limit);

  const totalPages = totalAgents ? Math.ceil(Number(totalAgents) / limit) : 0;
  const currentPage = Math.floor(offset / limit) + 1;

  const handlePrevPage = () => {
    if (offset >= limit) {
      setOffset(offset - limit);
    }
  };

  const handleNextPage = () => {
    if (totalAgents && offset + limit < Number(totalAgents)) {
      setOffset(offset + limit);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <EmptyState
        title="No agents found"
        description="Be the first to register an agent on AgentBazaar!"
      />
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent: any) => (
          <AgentCard key={agent.agentId.toString()} agent={agent} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={handlePrevPage}
            disabled={offset === 0}
            className="btn btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={!totalAgents || offset + limit >= Number(totalAgents)}
            className="btn btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
