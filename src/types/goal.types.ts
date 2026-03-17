/**
 * Goal-related type definitions
 * These types mirror the YAML frontmatter structure stored by the app
 */

export type GoalType = 'daily' | 'weekly' | 'monthly';

export type GoalStatus = 'active' | 'paused' | 'completed' | 'archived';

export type Priority = 'high' | 'medium' | 'low';

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

/**
 * Week tracking for weekly goals
 */
export interface WeekInfo {
  weekNumber: number;
  year: number;
  startDate: string; // ISO date of Monday
  endDate: string; // ISO date of Sunday
}

export interface Recurrence {
  frequency: 'daily' | 'weekly' | 'monthly';
  daysOfWeek?: DayOfWeek[];
  dayOfMonth?: number;
  targetCount?: number;
  minimumCount?: number;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  type: GoalType;
  status: GoalStatus;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  recurrence?: Recurrence;
  priority: Priority;
  completions: string[]; // ISO dates for daily goals, Monday ISO dates for weekly goals
  category: string; // Category name (e.g., "YouTube", "Work")
  filePath: string; // Stable storage key for the goal content
  monthlyProgress?: MonthlyProgress; // Track progress for monthly goals
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  order?: number;
  goals: Goal[];
}

export interface MonthlyProgress {
  [yearMonth: string]: number; // e.g., "2026-03": 2
}
