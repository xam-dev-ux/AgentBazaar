import { useState, useMemo } from 'react';
import { useTasks } from '../../hooks';
import { useAccount } from 'wagmi';
import { LoadingSpinner } from '../Common';
import { formatUnits } from 'viem';

interface CreateTaskFormProps {
  agentId: number;
  basePrice: bigint;
  onSuccess?: () => void;
}

export function CreateTaskForm({ agentId, basePrice, onSuccess }: CreateTaskFormProps) {
  const { isConnected } = useAccount();
  const { createTask, approveUSDC, usdcAllowance } = useTasks();
  const [step, setStep] = useState<'form' | 'approve' | 'create'>('form');
  const [formData, setFormData] = useState({
    skill: '',
    complexity: 5,
    description: '',
    filesUri: '',
    deadline: 7, // days
  });

  // Calculate price: basePrice * complexity
  const calculatedPrice = useMemo(() => {
    return basePrice * BigInt(formData.complexity);
  }, [basePrice, formData.complexity]);

  const needsApproval = usdcAllowance !== undefined &&
    usdcAllowance !== null &&
    calculatedPrice > usdcAllowance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      // Step 1: Approve USDC if needed
      if (needsApproval) {
        setStep('approve');
        // Approve the calculated price
        await approveUSDC.mutateAsync(formatUnits(calculatedPrice, 6));
      }

      // Step 2: Create task
      setStep('create');
      const deadlineTimestamp = Math.floor(Date.now() / 1000) + formData.deadline * 24 * 60 * 60;

      await createTask.mutateAsync({
        agentId,
        skill: formData.skill,
        complexity: formData.complexity,
        description: formData.description,
        filesUri: formData.filesUri,
        deadline: deadlineTimestamp,
      });

      // Reset form
      setFormData({
        skill: '',
        complexity: 5,
        description: '',
        filesUri: '',
        deadline: 7,
      });
      setStep('form');

      onSuccess?.();
    } catch (error) {
      console.error('Error creating task:', error);
      setStep('form');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' && e.target.name !== 'price'
      ? parseFloat(e.target.value)
      : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const isLoading = approveUSDC.isPending || createTask.isPending;

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 className="text-2xl font-bold mb-6 gradient-text">Create New Task</h2>

      <div className="space-y-6">
        {/* Skill */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Skill</label>
          <input
            type="text"
            name="skill"
            value={formData.skill}
            onChange={handleChange}
            placeholder="e.g., data-analysis, web-scraping"
            className="input"
            required
          />
        </div>

        {/* Calculated Price Display */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Price (USDC)
          </label>
          <div className="input bg-gray-800 text-gray-400 cursor-not-allowed">
            {formatUnits(calculatedPrice, 6)} USDC
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Calculated as: Base Price ({formatUnits(basePrice, 6)}) × Complexity ({formData.complexity})
          </p>
          {needsApproval && (
            <p className="mt-1 text-xs text-yellow-500">
              USDC approval required for this amount
            </p>
          )}
        </div>

        {/* Complexity */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Complexity: {formData.complexity}/10
          </label>
          <input
            type="range"
            name="complexity"
            value={formData.complexity}
            onChange={handleChange}
            min="1"
            max="10"
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Simple</span>
            <span>Complex</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe what you need the agent to do..."
            rows={4}
            className="textarea"
            required
          />
        </div>

        {/* Files URI */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Files URI (Optional)
          </label>
          <input
            type="text"
            name="filesUri"
            value={formData.filesUri}
            onChange={handleChange}
            placeholder="ipfs://Qm.../files.json"
            className="input"
          />
          <p className="mt-1 text-xs text-gray-500">
            IPFS link to task files or data
          </p>
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Deadline (Days)
          </label>
          <select
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="input"
          >
            <option value="1">1 day</option>
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isConnected || isLoading}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              {step === 'approve' ? 'Approving USDC...' : 'Creating Task...'}
            </>
          ) : (
            needsApproval ? 'Approve & Create Task' : 'Create Task'
          )}
        </button>

        {!isConnected && (
          <p className="text-center text-sm text-yellow-500">
            Please connect your wallet to create a task
          </p>
        )}
      </div>
    </form>
  );
}
