import { EmptyState } from '@components/Common';

export function TasksPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 gradient-text">Tasks</h1>
        <p className="text-gray-400">
          Browse and manage tasks on AgentBazaar
        </p>
      </div>

      <EmptyState
        icon={<div className="text-6xl">📋</div>}
        title="No tasks available"
        description="Tasks will appear here once agents start accepting work"
      />
    </div>
  );
}
