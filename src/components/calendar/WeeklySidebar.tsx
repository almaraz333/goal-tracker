/**
 * Weekly Sidebar - displays weekly goals for the current/selected week
 */

import { Calendar } from 'lucide-react';
import type { CalendarWeek, WeeklyGoalTask } from '@/types';
import { Card } from '@/components/ui';

interface WeeklySidebarProps {
  weeks: CalendarWeek[];
  selectedWeekIndex: number | null;
  onWeekSelect: (weekIndex: number) => void;
  onToggleWeeklySubtask: (goalId: string, subtaskId: string, weekKey: string) => void;
}

export function WeeklySidebar({ 
  weeks, 
  selectedWeekIndex, 
  onWeekSelect,
  onToggleWeeklySubtask
}: WeeklySidebarProps) {
  // Find the week to display (selected or first with goals)
  const displayWeekIndex = selectedWeekIndex !== null && selectedWeekIndex < weeks.length
    ? selectedWeekIndex 
    : weeks.findIndex(w => w.weeklyGoals.length > 0);
  const displayWeek = weeks[displayWeekIndex !== -1 ? displayWeekIndex : 0];
  
  if (!displayWeek) {
    return null;
  }
  
  const hasWeeklyGoals = displayWeek.weeklyGoals.length > 0;
  
  return (
    <div className="w-full lg:w-72 space-y-4">
      {/* Week Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {weeks.map((week, index) => {
          const rowWeekNum = index + 1; // Display 1, 2, 3, 4, 5
          const hasGoals = week.weeklyGoals.length > 0;
          const isSelected = week.weekIndex === selectedWeekIndex;
          return (
            <button
              key={week.weekIndex}
              onClick={() => onWeekSelect(week.weekIndex)}
              className={`
                flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors border-2
                ${isSelected ? 'border-blue-500' : 'border-transparent'}
                ${week.status === 'complete' 
                  ? 'bg-green-900/30 text-green-400' 
                  : week.status === 'incomplete'
                    ? 'bg-red-900/30 text-red-400'
                    : week.status === 'partial'
                      ? 'bg-orange-900/30 text-orange-400'
                      : hasGoals
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-800/50 text-gray-600'
                }
              `}
            >
              W{rowWeekNum}
            </button>
          );
        })}
      </div>
      
      {/* Week Info */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-100">
            Week {displayWeekIndex + 1}
          </h3>
          {displayWeek.status === 'complete' && (
            <span className="ml-auto text-green-400 text-sm">✓ Complete</span>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          {formatWeekDatesFromDays(displayWeek)}
        </p>
        
        {/* Weekly Goals List */}
        {hasWeeklyGoals ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
              Weekly Goals
            </h4>
            {displayWeek.weeklyGoals.map((task) => (
              <WeeklyGoalItem 
                key={task.goalId} 
                task={task}
                weekKey={task.weekKey}
                onToggleSubtask={(subtaskId: string) => onToggleWeeklySubtask(task.goalId, subtaskId, task.weekKey)}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic">
            No weekly goals for this week
          </p>
        )}
      </Card>
    </div>
  );
}

interface WeeklyGoalItemProps {
  task: WeeklyGoalTask;
  weekKey: string;
  onToggleSubtask: (subtaskId: string) => void;
}

import { useState } from 'react';

function WeeklyGoalItem({ task, weekKey, onToggleSubtask }: WeeklyGoalItemProps) {
  const [open, setOpen] = useState(false);
  const subtasks = task.goal.subtasks || [];
  
  // Get completed subtasks for this specific week
  const weekCompletedSubtasks = task.goal.weeklySubtaskCompletions?.[weekKey] || [];
  
  // Map subtasks with completion status for this week
  const subtasksWithWeeklyStatus = subtasks.map(st => ({
    ...st,
    completed: weekCompletedSubtasks.includes(st.id)
  }));
  
  const completedCount = subtasksWithWeeklyStatus.filter(st => st.completed).length;
  const totalCount = subtasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="w-full p-3 rounded-lg bg-gray-800">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setOpen(v => !v)}>
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${task.isCompleted ? 'text-green-300 line-through' : 'text-gray-200'}`}>{task.goal.title}</p>
          {task.goal.description && (
            <p className="text-xs text-gray-500 mt-1 truncate">{task.goal.description}</p>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${
          task.goal.priority === 'high' 
            ? 'bg-red-900/50 text-red-300' 
            : task.goal.priority === 'medium'
              ? 'bg-yellow-900/50 text-yellow-300'
              : 'bg-gray-700 text-gray-400'
        }`}>
          {task.goal.priority}
        </span>
        <button
          className="ml-2 text-gray-400 hover:text-gray-200 focus:outline-none"
          aria-label={open ? 'Collapse subtasks' : 'Expand subtasks'}
          tabIndex={-1}
        >
          <span>{open ? '▾' : '▸'}</span>
        </button>
      </div>
      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="mt-2 mb-1">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                progress === 100
                  ? 'bg-green-500'
                  : progress >= 50
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1 text-right">
            {completedCount}/{totalCount} subtasks complete
          </div>
        </div>
      )}
      {/* Subtasks dropdown */}
      {open && totalCount > 0 && (
        <div className="mt-2 space-y-1 pl-2">
          {subtasksWithWeeklyStatus.map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() => onToggleSubtask(subtask.id)}
                className="form-checkbox h-4 w-4 text-blue-500 rounded"
                tabIndex={0}
              />
              <span className={`text-sm ${subtask.completed ? 'line-through text-green-300' : 'text-gray-200'}`}>{subtask.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatWeekDatesFromDays(week: CalendarWeek): string {
  // Get only the days that belong to the current month
  const currentMonthDays = week.days.filter(day => day.isCurrentMonth);
  
  if (currentMonthDays.length === 0) {
    return 'No dates';
  }
  
  // Parse dates as local time to avoid timezone issues
  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  
  const firstDay = parseLocalDate(currentMonthDays[0].date);
  const lastDay = parseLocalDate(currentMonthDays[currentMonthDays.length - 1].date);
  
  const startMonth = firstDay.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = lastDay.toLocaleDateString('en-US', { month: 'short' });
  
  if (startMonth === endMonth) {
    return `${startMonth} ${firstDay.getDate()} – ${lastDay.getDate()}`;
  }
  
  return `${startMonth} ${firstDay.getDate()} – ${endMonth} ${lastDay.getDate()}`;
}
