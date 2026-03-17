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
    date,
    dayOfMonth,
    isCurrentMonth,
    isToday,
    isFuture,
    status,
    totalCount,
    completedCount,
  } = day;

  const [year, month, dayNumber] = date.split('-').map(Number);
  const dayOfWeek = new Date(year, month - 1, dayNumber).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Build class names
  const baseClasses = `
    relative flex flex-col items-center justify-center
    w-full aspect-square rounded-lg
    transition-all duration-150 ease-out
    cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-border-focus
  `;
  
  const stateClasses = isSelected
    ? 'text-text-inverse ring-2 ring-accent-primary'
    : isToday
    ? 'text-text-inverse ring-1 ring-calendar-today'
    : isCurrentMonth
    ? `${isWeekend ? 'bg-calendar-weekend' : 'bg-bg-secondary'} hover:bg-bg-hover text-text-primary`
    : 'bg-bg-primary text-text-muted';
  
  const opacityClass = !isCurrentMonth ? 'opacity-40' : '';
  const taskCountClasses = isSelected || isToday ? 'text-text-inverse opacity-80' : 'text-text-muted';
  const backgroundStyle = isSelected
    ? { backgroundColor: 'var(--calendar-selected)' }
    : isToday
      ? { backgroundColor: 'var(--calendar-today)' }
      : undefined;
  const indicatorStatus = totalCount > 0 && completedCount === totalCount
    ? 'complete'
    : status;
  
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${stateClasses} ${opacityClass}`}
      style={backgroundStyle}
      aria-label={`${dayOfMonth}, ${indicatorStatus === 'complete' ? 'all tasks complete' : indicatorStatus === 'incomplete' ? 'tasks incomplete' : indicatorStatus === 'partial' ? 'some tasks complete' : 'no tasks'}`}
      aria-selected={isSelected}
    >
      {/* Day number */}
      <span className={`text-sm font-medium ${isToday || isSelected ? 'font-bold' : ''}`}>
        {dayOfMonth}
      </span>
      
      {/* Status indicator */}
      {totalCount > 0 && !isFuture && (
        <div className="absolute bottom-1">
          <DayStatusIndicator status={indicatorStatus} size="sm" />
        </div>
      )}
      
      {/* Task count badge for days with many tasks */}
      {totalCount > 0 && (
        <span className={`absolute top-0.5 right-0.5 text-[10px] ${taskCountClasses}`}>
          {completedCount}/{totalCount}
        </span>
      )}
    </button>
  );
}
