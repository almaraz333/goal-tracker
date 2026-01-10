/**
 * Task List component - displays all tasks for a day
 */

import type { DayTask } from '@/types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: DayTask[];
  onToggleTask: (goalId: string, subtaskId?: string) => void;
  emptyMessage?: string;
}

export function TaskList({
  tasks,
  onToggleTask,
  emptyMessage = 'No tasks for this day',
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    );
  }
  
  // Group tasks by completion status
  const incompleteTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);
  
  return (
    <div className="space-y-4">
      {/* Progress summary */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          {completedTasks.length} of {tasks.length} completed
        </span>
        <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{
              width: `${(completedTasks.length / tasks.length) * 100}%`,
            }}
          />
        </div>
      </div>
      
      {/* Incomplete tasks */}
      {incompleteTasks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            To Do ({incompleteTasks.length})
          </h3>
          <div className="space-y-2">
            {incompleteTasks.map((task) => (
              <TaskItem
                key={`${task.goalId}-${task.subtaskId ?? 'main'}`}
                task={task}
                onToggle={() => onToggleTask(task.goalId, task.subtaskId)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Completed ({completedTasks.length})
          </h3>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <TaskItem
                key={`${task.goalId}-${task.subtaskId ?? 'main'}`}
                task={task}
                onToggle={() => onToggleTask(task.goalId, task.subtaskId)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
