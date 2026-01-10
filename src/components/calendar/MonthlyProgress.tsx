/**
 * Monthly Progress - displays monthly goals with progress bars
 */

import { Target, CheckCircle2, Circle, Plus, Minus } from 'lucide-react';
import type { MonthlyGoalTask } from '@/types';
import { Card } from '@/components/ui';

interface MonthlyProgressProps {
  monthlyGoals: MonthlyGoalTask[];
  monthName: string;
  onIncrementProgress: (goalId: string, monthKey: string) => void;
  onDecrementProgress: (goalId: string, monthKey: string) => void;
}

export function MonthlyProgress({ 
  monthlyGoals, 
  monthName,
  onIncrementProgress,
  onDecrementProgress
}: MonthlyProgressProps) {
  if (monthlyGoals.length === 0) {
    return null;
  }
  
  const completedCount = monthlyGoals.filter(g => g.isCompleted).length;
  const totalCount = monthlyGoals.length;
  const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  
  return (
    <Card className="p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-accent-secondary" />
          <h3 className="text-lg font-semibold text-text-primary">
            {monthName} Goals
          </h3>
        </div>
        <span className="text-sm text-text-muted">
          {completedCount}/{totalCount} complete
        </span>
      </div>
      
      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-progress-empty rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              overallProgress === 100 
                ? 'bg-progress-complete' 
                : overallProgress >= 50 
                  ? 'bg-progress-partial' 
                  : 'bg-status-danger'
            }`}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>
      
      {/* Individual Monthly Goals */}
      <div className="space-y-4">
        {monthlyGoals.map((task) => (
          <MonthlyGoalItem 
            key={task.goalId} 
            task={task}
            onIncrement={() => onIncrementProgress(task.goalId, task.monthKey)}
            onDecrement={() => onDecrementProgress(task.goalId, task.monthKey)}
          />
        ))}
      </div>
    </Card>
  );
}

interface MonthlyGoalItemProps {
  task: MonthlyGoalTask;
  onIncrement: () => void;
  onDecrement: () => void;
}

function MonthlyGoalItem({ task, onIncrement, onDecrement }: MonthlyGoalItemProps) {
  const progress = task.targetCount > 0 
    ? (task.currentCount / task.targetCount) * 100 
    : 0;
  
  const isAtMinimum = task.currentCount >= task.minimumCount;
  const isAtTarget = task.currentCount >= task.targetCount;
  
  return (
    <div className={`p-4 rounded-lg ${
      isAtTarget 
        ? 'bg-status-success-bg border border-status-success-border' 
        : isAtMinimum 
          ? 'bg-status-warning-bg border border-status-warning-border' 
          : 'bg-bg-secondary border border-border-primary'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {isAtTarget ? (
            <CheckCircle2 className="h-5 w-5 text-status-success" />
          ) : (
            <Circle className="h-5 w-5 text-text-muted" />
          )}
          <span className={`font-medium ${isAtTarget ? 'text-status-success' : 'text-text-primary'}`}>
            {task.goal.title}
          </span>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${
          task.goal.priority === 'high' 
            ? 'bg-status-danger-bg text-status-danger' 
            : task.goal.priority === 'medium'
              ? 'bg-status-warning-bg text-status-warning'
              : 'bg-bg-tertiary text-text-muted'
        }`}>
          {task.goal.priority}
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-3">
        <div className="h-3 bg-progress-empty rounded-full overflow-hidden relative">
          {/* Minimum threshold marker */}
          {task.minimumCount !== task.targetCount && (
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-status-warning z-10"
              style={{ left: `${(task.minimumCount / task.targetCount) * 100}%` }}
            />
          )}
          {/* Progress fill */}
          <div 
            className={`h-full transition-all duration-300 ${
              isAtTarget 
                ? 'bg-progress-complete' 
                : isAtMinimum 
                  ? 'bg-progress-partial' 
                  : 'bg-accent-primary'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
      
      {/* Counter Controls */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-muted">
          {task.currentCount} / {task.targetCount}
          {task.minimumCount !== task.targetCount && (
            <span className="text-text-muted"> (min: {task.minimumCount})</span>
          )}
        </span>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onDecrement}
            disabled={task.currentCount <= 0}
            className="p-1.5 rounded-lg bg-bg-tertiary hover:bg-bg-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="h-4 w-4 text-text-secondary" />
          </button>
          <span className="text-lg font-bold text-text-primary min-w-[2rem] text-center">
            {task.currentCount}
          </span>
          <button
            onClick={onIncrement}
            className="p-1.5 rounded-lg bg-accent-primary hover:bg-accent-primary-hover transition-colors"
          >
            <Plus className="h-4 w-4 text-text-inverse" />
          </button>
        </div>
      </div>
    </div>
  );
}
