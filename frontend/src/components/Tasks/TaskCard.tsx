import { Link } from 'react-router-dom';
import { TaskStatus } from '@config/constants';
import { formatUnits } from 'viem';

interface TaskCardProps {
  task: {
    taskId: string;
    agentId: bigint;
    clientAddress: string;
    price: bigint;
    skill: string;
    complexity: number;
    description: string;
    status: number;
    createdAt: bigint;
  };
}

export function TaskCard({ task }: TaskCardProps) {
  const getStatusBadge = (status: number) => {
    switch (status) {
      case TaskStatus.OPEN:
        return <span className="badge badge-success">Open</span>;
      case TaskStatus.ACCEPTED:
        return <span className="badge badge-info">Accepted</span>;
      case TaskStatus.COMPLETED:
        return <span className="badge badge-warning">Completed</span>;
      case TaskStatus.VALIDATED:
        return <span className="badge badge-primary">Validated</span>;
      case TaskStatus.DISPUTED:
        return <span className="badge badge-error">Disputed</span>;
      case TaskStatus.CANCELLED:
        return <span className="badge">Cancelled</span>;
      default:
        return null;
    }
  };

  const getComplexityDots = (complexity: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${
              i < complexity ? 'bg-primary-500' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Link to={`/tasks/${task.taskId}`} className="block">
      <div className="card card-hover">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-white truncate">{task.skill}</h3>
              {getStatusBadge(task.status)}
            </div>
            <p className="text-sm text-gray-400 line-clamp-2">{task.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Complexity</div>
            {getComplexityDots(task.complexity)}
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-primary-500">
              {formatUnits(task.price, 6)} USDC
            </div>
            <div className="text-xs text-gray-500">
              Agent #{task.agentId.toString()}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
          <span>Client: {task.clientAddress.slice(0, 6)}...{task.clientAddress.slice(-4)}</span>
          <span>
            {new Date(Number(task.createdAt) * 1000).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
