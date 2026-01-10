/**
 * Main Calendar component - combines header, grid, sidebar, and monthly progress
 */

import { useState, useCallback } from 'react';
import type { Goal, CalendarDay, CalendarWeek } from '@/types';
import { useCalendar } from '@/hooks';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { WeeklySidebar } from './WeeklySidebar';
import { MonthlyProgress } from './MonthlyProgress';
import { parseISODate, getMonthName } from '@/utils';

interface CalendarMonthViewProps {
  goals: Goal[];
  onDaySelect: (date: Date) => void;
  onToggleWeeklySubtask: (goalId: string, subtaskId: string, weekKey: string) => void;
  onIncrementMonthlyProgress: (goalId: string, monthKey: string) => void;
  onDecrementMonthlyProgress: (goalId: string, monthKey: string) => void;
}

export function CalendarMonthView({ 
  goals, 
  onDaySelect,
  onToggleWeeklySubtask,
  onIncrementMonthlyProgress,
  onDecrementMonthlyProgress,
}: CalendarMonthViewProps) {
  const {
    selectedDate,
    calendarMonth,
    navigateMonth,
    selectDate,
    goToToday,
  } = useCalendar(goals);
  
  // Track selected week by index (null means none selected initially)
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number | null>(null);
  
  const handleDayClick = useCallback((day: CalendarDay) => {
    const date = parseISODate(day.date);
    selectDate(date);
    // Find which week row this day is in
    const weekIndex = calendarMonth.weeks.findIndex(w => 
      w.days.some(d => d.date === day.date)
    );
    if (weekIndex !== -1) {
      setSelectedWeekIndex(weekIndex);
    }
    onDaySelect(date);
  }, [selectDate, onDaySelect, calendarMonth.weeks]);
  
  const handleWeekClick = useCallback((week: CalendarWeek) => {
    setSelectedWeekIndex(week.weekIndex);
  }, []);
  
  const handleWeekSelect = useCallback((weekIndex: number) => {
    setSelectedWeekIndex(weekIndex);
  }, []);
  
  const monthName = getMonthName(calendarMonth.month);
  
  // Check if there are any weekly goals this month
  const hasWeeklyGoals = calendarMonth.weeks.some(w => w.weeklyGoals.length > 0);
  
  return (
    <div className="w-full">
      {/* Main Layout: Calendar + Sidebar */}
      <div className={`flex flex-col ${hasWeeklyGoals ? 'lg:flex-row' : ''} gap-4`}>
        {/* Calendar Section */}
        <div className="flex-1 min-w-0">
          <CalendarHeader
            year={calendarMonth.year}
            month={calendarMonth.month}
            onPrevMonth={() => navigateMonth('prev')}
            onNextMonth={() => navigateMonth('next')}
            onToday={goToToday}
          />
          
          <CalendarGrid
            calendarMonth={calendarMonth}
            selectedDate={selectedDate}
            selectedWeekIndex={selectedWeekIndex}
            onDayClick={handleDayClick}
            onWeekClick={handleWeekClick}
          />
          
          {/* Monthly Progress under calendar */}
          <MonthlyProgress
            monthlyGoals={calendarMonth.monthlyGoals}
            monthName={monthName}
            onIncrementProgress={onIncrementMonthlyProgress}
            onDecrementProgress={onDecrementMonthlyProgress}
          />
        </div>
        
        {/* Weekly Sidebar */}
        {hasWeeklyGoals && (
          <WeeklySidebar
            weeks={calendarMonth.weeks}
            selectedWeekIndex={selectedWeekIndex}
            onWeekSelect={handleWeekSelect}
            onToggleWeeklySubtask={onToggleWeeklySubtask}
          />
        )}
      </div>
    </div>
  );
}
