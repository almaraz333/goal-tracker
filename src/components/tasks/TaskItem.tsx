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
  const { goal, isCompleted, isSubtask, subtaskTitle } = task;
  
  const title = isSubtask ? subtaskTitle : goal.title;
  const description = isSubtask ? `Part of: ${goal.title}` : goal.description;
  
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
        aria-label={`Mark "${title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`
              font-medium text-sm
              ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-100'}
            `}
          >
            {title}
          </span>
          
          {!isSubtask && (
            <Badge variant={priorityVariants[goal.priority]} size="sm">
              {goal.priority}
            </Badge>
          )}
        </div>
        
        {description && (
          <p className="text-xs text-gray-500 truncate">
            {description}
          </p>
        )}
        
        {/* Tags */}
        {!isSubtask && goal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {goal.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-400"
              >
                #{tag}
              </span>
            ))}
            {goal.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{goal.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Category indicator */}
      <div className="text-xs text-gray-500 whitespace-nowrap">
        {goal.category}
      </div>
    </div>
  );
}
