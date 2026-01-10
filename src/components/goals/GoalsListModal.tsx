/**
 * Goals List Modal Component
 * 
 * Displays a list of goals filtered by type (daily, weekly, monthly).
 * Allows drilling into individual goals to view/edit their full content.
 */

import { useState, useMemo } from 'react';
import { 
  Target, 
  Calendar, 
  Repeat,
  ChevronRight,
  Tag,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Modal, Badge } from '@/components/ui';
import { GoalDetailView } from './GoalDetailView';
import type { Goal, GoalType } from '@/types';
import { formatDateDisplay, parseISODate } from '@/utils';

interface GoalsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: Goal[];
  goalType: GoalType;
  onGoalUpdated?: () => void;
}

export function GoalsListModal({ 
  isOpen, 
  onClose, 
  goals, 
  goalType,
  onGoalUpdated 
}: GoalsListModalProps) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Filter goals by type and get all (including inactive for reference)
  const filteredGoals = useMemo(() => {
    return goals.filter(g => g.type === goalType);
  }, [goals, goalType]);

  const activeGoals = filteredGoals.filter(g => g.status === 'active');
  const inactiveGoals = filteredGoals.filter(g => g.status !== 'active');

  const getTypeIcon = () => {
    switch (goalType) {
      case 'daily':
        return <Target className="h-6 w-6 text-blue-400" />;
      case 'weekly':
        return <Calendar className="h-6 w-6 text-purple-400" />;
      case 'monthly':
        return <Repeat className="h-6 w-6 text-green-400" />;
    }
  };

  const getTypeColor = () => {
    switch (goalType) {
      case 'daily': return 'text-blue-400';
      case 'weekly': return 'text-purple-400';
      case 'monthly': return 'text-green-400';
    }
  };

  const getTitle = () => {
    switch (goalType) {
      case 'daily': return 'Daily Goals';
      case 'weekly': return 'Weekly Goals';
      case 'monthly': return 'Monthly Goals';
    }
  };

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
  };

  const handleBackToList = () => {
    setSelectedGoal(null);
  };

  const handleClose = () => {
    setSelectedGoal(null);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={selectedGoal ? undefined : getTitle()}
      size="lg"
    >
      <div className="max-h-[70vh] overflow-y-auto">
        {selectedGoal ? (
          <GoalDetailView 
            goal={selectedGoal} 
            onBack={handleBackToList}
            onGoalUpdated={onGoalUpdated}
          />
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
              {getTypeIcon()}
              <div>
                <p className={`text-lg font-semibold ${getTypeColor()}`}>
                  {activeGoals.length} Active
                </p>
                <p className="text-xs text-gray-500">
                  {inactiveGoals.length} inactive ({filteredGoals.length} total)
                </p>
              </div>
            </div>

            {/* Active Goals */}
            {activeGoals.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">
                  Active Goals
                </h3>
                <div className="space-y-2">
                  {activeGoals.map(goal => (
                    <GoalListItem 
                      key={goal.id} 
                      goal={goal} 
                      onClick={() => handleGoalClick(goal)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Goals */}
            {inactiveGoals.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Inactive Goals
                </h3>
                <div className="space-y-2 opacity-60">
                  {inactiveGoals.map(goal => (
                    <GoalListItem 
                      key={goal.id} 
                      goal={goal} 
                      onClick={() => handleGoalClick(goal)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredGoals.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  {getTypeIcon()}
                </div>
                <p className="text-gray-400">No {goalType} goals found</p>
                <p className="text-xs text-gray-500 mt-1">
                  Create a new {goalType} goal in your Obsidian vault
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

interface GoalListItemProps {
  goal: Goal;
  onClick: () => void;
}

function GoalListItem({ goal, onClick }: GoalListItemProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return null; // Don't show badge for active
      case 'paused':
        return <Badge variant="warning" size="sm">Paused</Badge>;
      case 'completed':
        return <Badge variant="success" size="sm">Completed</Badge>;
      case 'archived':
        return <Badge variant="default" size="sm">Archived</Badge>;
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 bg-gray-800 hover:bg-gray-750 rounded-lg transition-colors group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Title & Priority */}
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityColor(goal.priority)}`} />
            <h4 className="text-sm font-medium text-gray-100 truncate">
              {goal.title}
            </h4>
            {getStatusBadge(goal.status)}
          </div>

          {/* Description */}
          {goal.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">
              {goal.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {/* Category */}
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {goal.category}
            </span>

            {/* Date range */}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDateDisplay(parseISODate(goal.startDate), { month: 'short', day: 'numeric' })} - 
              {formatDateDisplay(parseISODate(goal.endDate), { month: 'short', day: 'numeric' })}
            </span>

            {/* Subtasks count */}
            {goal.subtasks && goal.subtasks.length > 0 && (
              <span className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {goal.subtasks.length} subtasks
              </span>
            )}
          </div>

          {/* Tags */}
          {goal.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {goal.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag} 
                  className="px-1.5 py-0.5 bg-gray-700 rounded text-xs text-gray-400"
                >
                  {tag}
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

        {/* Chevron */}
        <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-gray-400 flex-shrink-0 mt-1" />
      </div>
    </button>
  );
}
