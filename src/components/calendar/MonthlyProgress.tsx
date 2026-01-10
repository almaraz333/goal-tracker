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
          <Target className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-100">
            {monthName} Goals
          </h3>
        </div>
        <span className="text-sm text-gray-400">
          {completedCount}/{totalCount} complete
        </span>
      </div>
      
      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              overallProgress === 100 
                ? 'bg-green-500' 
                : overallProgress >= 50 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
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
        ? 'bg-green-900/30 border border-green-700' 
        : isAtMinimum 
          ? 'bg-yellow-900/20 border border-yellow-700/50' 
          : 'bg-gray-800 border border-gray-700'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {isAtTarget ? (
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          ) : (
            <Circle className="h-5 w-5 text-gray-500" />
          )}
          <span className={`font-medium ${isAtTarget ? 'text-green-300' : 'text-gray-200'}`}>
            {task.goal.title}
          </span>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${
          task.goal.priority === 'high' 
            ? 'bg-red-900/50 text-red-300' 
            : task.goal.priority === 'medium'
              ? 'bg-yellow-900/50 text-yellow-300'
              : 'bg-gray-700 text-gray-400'
        }`}>
          {task.goal.priority}
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-3">
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden relative">
          {/* Minimum threshold marker */}
          {task.minimumCount !== task.targetCount && (
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-yellow-500 z-10"
              style={{ left: `${(task.minimumCount / task.targetCount) * 100}%` }}
            />
          )}
          {/* Progress fill */}
          <div 
            className={`h-full transition-all duration-300 ${
              isAtTarget 
                ? 'bg-green-500' 
                : isAtMinimum 
                  ? 'bg-yellow-500' 
                  : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
      
      {/* Counter Controls */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">
          {task.currentCount} / {task.targetCount}
          {task.minimumCount !== task.targetCount && (
            <span className="text-gray-500"> (min: {task.minimumCount})</span>
          )}
        </span>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onDecrement}
            disabled={task.currentCount <= 0}
            className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="h-4 w-4 text-gray-300" />
          </button>
          <span className="text-lg font-bold text-gray-200 min-w-[2rem] text-center">
            {task.currentCount}
          </span>
          <button
            onClick={onIncrement}
            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            <Plus className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
