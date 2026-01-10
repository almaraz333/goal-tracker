/**
 * Custom hook for calendar navigation and state
 */

import { useMemo, useCallback } from 'react';
import { useAppStore } from '@/store';
import { buildCalendarMonth, buildCalendarDay } from '@/utils';
import type { Goal, CalendarMonth, CalendarDay } from '@/types';

interface UseCalendarReturn {
  currentDate: Date;
  selectedDate: Date | null;
  viewMode: 'month' | 'day';
  calendarMonth: CalendarMonth;
  selectedDayData: CalendarDay | null;
  navigateMonth: (direction: 'prev' | 'next') => void;
  selectDate: (date: Date | null) => void;
  goToToday: () => void;
  setViewMode: (mode: 'month' | 'day') => void;
}

export function useCalendar(goals: Goal[]): UseCalendarReturn {
  const {
    currentDate,
    selectedDate,
    viewMode,
    setCurrentDate,
    setSelectedDate,
    setViewMode,
    navigateMonth,
  } = useAppStore();
  
  // Build the calendar month data
  const calendarMonth = useMemo(() => {
    return buildCalendarMonth(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      goals
    );
  }, [currentDate, goals]);
  
  // Get selected day data
  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null;
    
    return buildCalendarDay(
      selectedDate,
      goals,
      selectedDate.getMonth()
    );
  }, [selectedDate, goals]);
  
  // Select a specific date
  const selectDate = useCallback((date: Date | null) => {
    setSelectedDate(date);
  }, [setSelectedDate]);
  
  // Navigate to today
  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }, [setCurrentDate, setSelectedDate]);
  
  return {
    currentDate,
    selectedDate,
    viewMode,
    calendarMonth,
    selectedDayData,
    navigateMonth,
    selectDate,
    goToToday,
    setViewMode,
  };
}
