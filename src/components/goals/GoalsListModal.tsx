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
  Clock
} from 'lucide-react';
import { Modal, Badge } from '@/components/ui';
import { GoalEditModal } from './GoalEditModal';
import type { Goal, GoalType } from '@/types';
import { formatDateDisplay, parseISODate } from '@/utils';

interface GoalsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: Goal[];
  goalType: GoalType;
  onGoalUpdated?: (goal: Goal) => void;
  onGoalDeleted?: (goalId: string) => void;
  existingCategories?: string[];
}

export function GoalsListModal({ 
  isOpen, 
  onClose, 
  goals, 
  goalType,
  onGoalUpdated,
  onGoalDeleted,
  existingCategories = [],
}: GoalsListModalProps) {
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Filter goals by type and get all (including inactive for reference)
  const filteredGoals = useMemo(() => {
    return goals.filter(g => g.type === goalType);
  }, [goals, goalType]);

  const activeGoals = filteredGoals.filter(g => g.status === 'active');
  const inactiveGoals = filteredGoals.filter(g => g.status !== 'active');

  const getTypeIcon = () => {
    switch (goalType) {
      case 'daily':
        return <Target className="h-6 w-6 text-accent-primary" />;
      case 'weekly':
        return <Calendar className="h-6 w-6 text-accent-secondary" />;
      case 'monthly':
        return <Repeat className="h-6 w-6 text-status-success" />;
    }
  };

  const getTypeColor = () => {
    switch (goalType) {
      case 'daily': return 'text-accent-primary';
      case 'weekly': return 'text-accent-secondary';
      case 'monthly': return 'text-status-success';
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
    setEditingGoal(goal);
  };

  const handleClose = () => {
    setEditingGoal(null);
    onClose();
  };

  const handleGoalUpdated = (updatedGoal: Goal) => {
    onGoalUpdated?.(updatedGoal);
    setEditingGoal(null);
  };

  const handleGoalDeleted = (goalId: string) => {
    onGoalDeleted?.(goalId);
    setEditingGoal(null);
  };

  return (
    <>
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={getTitle()}
      size="lg"
    >
      <div className="max-h-[70vh] overflow-y-auto">
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center gap-3 p-3 bg-bg-secondary/50 rounded-lg">
            {getTypeIcon()}
            <div>
              <p className={`text-lg font-semibold ${getTypeColor()}`}>
                {activeGoals.length} Active
              </p>
              <p className="text-xs text-text-muted">
                {inactiveGoals.length} inactive ({filteredGoals.length} total)
              </p>
            </div>
          </div>

          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-2">
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
              <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-2">
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
              <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                {getTypeIcon()}
              </div>
              <p className="text-text-muted">No {goalType} goals found</p>
              <p className="text-xs text-text-muted mt-1">
                {`Create a new ${goalType} goal using the + button`}
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>

    {/* Edit Modal for in-app mode */}
    {editingGoal && (
      <GoalEditModal
        isOpen={!!editingGoal}
        onClose={() => setEditingGoal(null)}
        goal={editingGoal}
        onGoalUpdated={handleGoalUpdated}
        onGoalDeleted={handleGoalDeleted}
        existingCategories={existingCategories}
      />
    )}
    </>
  );
}

interface GoalListItemProps {
  goal: Goal;
  onClick: () => void;
}

function GoalListItem({ goal, onClick }: GoalListItemProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-status-danger';
      case 'medium': return 'bg-status-warning';
      case 'low': return 'bg-status-success';
      default: return 'bg-text-muted';
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
      className="w-full text-left p-3 bg-bg-secondary hover:bg-bg-hover rounded-lg transition-colors group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Title & Priority */}
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityColor(goal.priority)}`} />
            <h4 className="text-sm font-medium text-text-primary truncate">
              {goal.title}
            </h4>
            {getStatusBadge(goal.status)}
          </div>

          {/* Description */}
          {goal.description && (
            <p className="text-xs text-text-muted line-clamp-2 mb-2">
              {goal.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-3 text-xs text-text-muted">
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
          </div>
        </div>

        {/* Chevron */}
        <ChevronRight className="h-5 w-5 text-text-muted group-hover:text-text-secondary flex-shrink-0 mt-1" />
      </div>
    </button>
  );
}
