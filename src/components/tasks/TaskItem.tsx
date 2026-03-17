/**
 * Task Item component - represents a single task in the list
 */

import type { DayTask } from '@/types';
import { Checkbox } from '@/components/ui';
import { Badge } from '@/components/ui';

interface TaskItemProps {
  task: DayTask;
  onToggle: () => void;
}

const priorityVariants = {
  high: 'danger',
  medium: 'warning',
  low: 'info',
} as const;

export function TaskItem({ task, onToggle }: TaskItemProps) {
  const { goal, isCompleted } = task;
  
  return (
    <div
      className={`
        flex items-start gap-3 p-3 rounded-lg
        transition-colors duration-150
        ${isCompleted ? 'bg-gray-800/30' : 'bg-gray-800'}
      `}
    >
      <Checkbox
        checked={isCompleted}
        onChange={onToggle}
        aria-label={`Mark "${goal.title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`
              font-medium text-sm
              ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-100'}
            `}
          >
            {goal.title}
          </span>

          <Badge variant={priorityVariants[goal.priority]} size="sm">
            {goal.priority}
          </Badge>
        </div>
        
        {goal.description && (
          <p className="text-xs text-gray-500 truncate">
            {goal.description}
          </p>
        )}
      </div>
      
      {/* Category indicator */}
      <div className="text-xs text-gray-500 whitespace-nowrap">
        {goal.category}
      </div>
    </div>
  );
}
