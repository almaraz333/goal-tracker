/**
 * Calendar Grid component - displays the monthly calendar with week indicators
 */

import { CheckCircle2 } from 'lucide-react';
import type { CalendarMonth as CalendarMonthType, CalendarDay, CalendarWeek } from '@/types';
import { getDayName } from '@/utils';
import { CalendarDayCell } from './CalendarDayCell';

interface CalendarGridProps {
  calendarMonth: CalendarMonthType;
  selectedDate: Date | null;
  selectedWeekIndex: number | null;
  onDayClick: (day: CalendarDay) => void;
  onWeekClick: (week: CalendarWeek) => void;
}

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0]; // Monday to Sunday (ISO week standard)

export function CalendarGrid({
  calendarMonth,
  selectedDate,
  selectedWeekIndex,
  onDayClick,
  onWeekClick,
}: CalendarGridProps) {
  const selectedDateStr = selectedDate?.toISOString().split('T')[0] ?? '';
  

  return (
    <div className="bg-bg-secondary/50 rounded-xl p-3">
      {/* Weekday headers */}
      <div className="grid grid-cols-8 gap-1 mb-2">
        {/* Week indicator column header */}
        <div className="text-center text-xs font-medium text-text-muted py-2">
          Wk
        </div>
        {WEEKDAYS.map((_, index) => (
          <div
            key={index}
            className="text-center text-xs font-medium text-text-muted py-2"
          >
            {getDayName(index, 'narrow')}
          </div>
        ))}
      </div>
      
      {/* Calendar days grid with week indicators */}
      <div className="space-y-1">
        {calendarMonth.weeks.map((week, index) => {
          const rowWeekNum = index + 1; // Display 1, 2, 3, 4, 5
          const isSelectedWeek = week.weekIndex === selectedWeekIndex;
          const weekDays = week.days;
          const hasWeeklyGoals = week && week.weeklyGoals.length > 0;
          const weekComplete = week?.status === 'complete';
          
          return (
            <div 
              key={week.weekIndex} 
              className={`grid grid-cols-8 gap-1 ${
                isSelectedWeek ? 'bg-accent-primary/20 rounded-lg' : ''
              }`}
            >
              {/* Week indicator */}
              <button
                onClick={() => week && onWeekClick(week)}
                className={`
                  flex items-center justify-center py-2 rounded-lg text-xs font-medium
                  transition-colors
                  ${hasWeeklyGoals 
                    ? 'hover:bg-bg-hover cursor-pointer' 
                    : 'cursor-default'
                  }
                  ${isSelectedWeek ? 'bg-accent-primary text-text-inverse' : 'text-text-muted'}
                  ${weekComplete && !isSelectedWeek ? 'text-status-success' : ''}
                `}
                disabled={!hasWeeklyGoals}
              >
                {weekComplete ? (
                  <CheckCircle2 className={`h-4 w-4 ${isSelectedWeek ? 'text-text-inverse' : 'text-status-success'}`} />
                ) : (
                  rowWeekNum
                )}
              </button>
              
              {/* Days */}
              {weekDays.map((day, dayIndex) => (
                <CalendarDayCell
                  key={`${day.date}-${dayIndex}`}
                  day={day}
                  isSelected={day.date === selectedDateStr}
                  onClick={() => onDayClick(day)}
                />
              ))}
            </div>
          );
        })}
      </div>
      
      {/* Month summary */}
      <div className="mt-4 pt-3 border-t border-border-primary flex items-center justify-between text-sm">
        <span className="text-text-muted">
          {calendarMonth.completedDays} of {calendarMonth.totalDays} days completed
        </span>
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          calendarMonth.status === 'green' 
            ? 'bg-status-success-bg text-status-success' 
            : calendarMonth.status === 'orange'
              ? 'bg-status-warning-bg text-status-warning'
              : calendarMonth.status === 'red'
                ? 'bg-status-danger-bg text-status-danger'
                : 'bg-bg-tertiary text-text-muted'
        }`}>
          {calendarMonth.status === 'none' ? 'No tasks' : calendarMonth.status.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
