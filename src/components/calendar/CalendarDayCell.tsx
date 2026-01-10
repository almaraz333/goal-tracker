/**
 * Calendar Day Cell component
 */

import type { CalendarDay as CalendarDayType } from '@/types';
import { DayStatusIndicator } from './DayStatusIndicator';

interface CalendarDayCellProps {
  day: CalendarDayType;
  isSelected: boolean;
  onClick: () => void;
}

export function CalendarDayCell({ day, isSelected, onClick }: CalendarDayCellProps) {
  const {
    dayOfMonth,
    isCurrentMonth,
    isToday,
    isFuture,
    status,
    totalCount,
    completedCount,
  } = day;
  
  // Build class names
  const baseClasses = `
    relative flex flex-col items-center justify-center
    w-full aspect-square rounded-lg
    transition-all duration-150 ease-out
    cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-blue-500
  `;
  
  const stateClasses = isSelected
    ? 'bg-blue-600 text-white ring-2 ring-blue-400'
    : isToday
    ? 'bg-gray-700 text-white ring-1 ring-blue-500'
    : isCurrentMonth
    ? 'bg-gray-800 hover:bg-gray-700 text-gray-100'
    : 'bg-gray-900 text-gray-600';
  
  const opacityClass = !isCurrentMonth ? 'opacity-40' : '';
  
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${stateClasses} ${opacityClass}`}
      aria-label={`${dayOfMonth}, ${status === 'complete' ? 'all tasks complete' : status === 'incomplete' ? 'tasks incomplete' : status === 'partial' ? 'some tasks complete' : 'no tasks'}`}
      aria-selected={isSelected}
    >
      {/* Day number */}
      <span className={`text-sm font-medium ${isToday ? 'font-bold' : ''}`}>
        {dayOfMonth}
      </span>
      
      {/* Status indicator */}
      {totalCount > 0 && !isFuture && (
        <div className="absolute bottom-1">
          <DayStatusIndicator status={status} size="sm" />
        </div>
      )}
      
      {/* Task count badge for days with many tasks */}
      {totalCount > 0 && (
        <span className="absolute top-0.5 right-0.5 text-[10px] text-gray-400">
          {completedCount}/{totalCount}
        </span>
      )}
    </button>
  );
}
