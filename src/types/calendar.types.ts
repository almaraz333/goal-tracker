/**
 * Calendar-related type definitions
 */

import type { Goal, WeekInfo } from './goal.types';

export type DayStatus = 'complete' | 'incomplete' | 'partial' | 'none';

export type MonthStatus = 'green' | 'red' | 'orange' | 'none';

export type WeekStatus = 'complete' | 'incomplete' | 'partial' | 'none';

export interface CalendarDay {
  date: string; // ISO date string (YYYY-MM-DD)
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  status: DayStatus;
  tasks: DayTask[]; // Only DAILY tasks
  completedCount: number;
  totalCount: number;
  weekNumber: number;
}

export interface DayTask {
  goalId: string;
  goal: Goal;
  isCompleted: boolean;
  isSubtask: boolean;
  subtaskId?: string;
  subtaskTitle?: string;
}

export interface CalendarWeek {
  weekInfo: WeekInfo;
  weekIndex: number; // 0-based index within the month view (0, 1, 2, 3, 4)
  days: CalendarDay[];
  weeklyGoals: WeeklyGoalTask[];
  status: WeekStatus;
}

export interface WeeklyGoalTask {
  goalId: string;
  goal: Goal;
  isCompleted: boolean;
  weekKey: string; // ISO date of Monday (YYYY-MM-DD format, e.g., "2026-01-05")
}

export interface MonthlyGoalTask {
  goalId: string;
  goal: Goal;
  currentCount: number;
  targetCount: number;
  minimumCount: number;
  isCompleted: boolean; // true if >= minimumCount
  monthKey: string; // "YYYY-MM" format (e.g., "2026-01")
}

export interface CalendarMonth {
  year: number;
  month: number; // 0-indexed (0 = January)
  days: CalendarDay[];
  weeks: CalendarWeek[];
  monthlyGoals: MonthlyGoalTask[];
  status: MonthStatus;
  completedDays: number;
  totalDays: number;
}

export interface CalendarViewState {
  currentDate: Date;
  selectedDate: Date | null;
  selectedWeek: WeekInfo | null;
  viewMode: 'month' | 'day';
}
