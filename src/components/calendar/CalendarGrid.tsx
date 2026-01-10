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

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday

export function CalendarGrid({
  calendarMonth,
  selectedDate,
  selectedWeekIndex,
  onDayClick,
  onWeekClick,
}: CalendarGridProps) {
  const selectedDateStr = selectedDate?.toISOString().split('T')[0] ?? '';
  

  return (
    <div className="bg-gray-800/50 rounded-xl p-3">
      {/* Weekday headers */}
      <div className="grid grid-cols-8 gap-1 mb-2">
        {/* Week indicator column header */}
        <div className="text-center text-xs font-medium text-gray-600 py-2">
          Wk
        </div>
        {WEEKDAYS.map((dayIndex) => (
          <div
            key={dayIndex}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {getDayName(dayIndex, 'narrow')}
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
                isSelectedWeek ? 'bg-blue-900/20 rounded-lg' : ''
              }`}
            >
              {/* Week indicator */}
              <button
                onClick={() => week && onWeekClick(week)}
                className={`
                  flex items-center justify-center py-2 rounded-lg text-xs font-medium
                  transition-colors
                  ${hasWeeklyGoals 
                    ? 'hover:bg-gray-700 cursor-pointer' 
                    : 'cursor-default'
                  }
                  ${isSelectedWeek ? 'bg-blue-600 text-white' : 'text-gray-500'}
                  ${weekComplete && !isSelectedWeek ? 'text-green-400' : ''}
                `}
                disabled={!hasWeeklyGoals}
              >
                {weekComplete ? (
                  <CheckCircle2 className="h-4 w-4" />
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
      <div className="mt-4 pt-3 border-t border-gray-700 flex items-center justify-between text-sm">
        <span className="text-gray-400">
          {calendarMonth.completedDays} of {calendarMonth.totalDays} days completed
        </span>
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          calendarMonth.status === 'green' 
            ? 'bg-green-900/50 text-green-300' 
            : calendarMonth.status === 'orange'
              ? 'bg-yellow-900/50 text-yellow-300'
              : calendarMonth.status === 'red'
                ? 'bg-red-900/50 text-red-300'
                : 'bg-gray-700 text-gray-400'
        }`}>
          {calendarMonth.status === 'none' ? 'No tasks' : calendarMonth.status.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
