/**
 * Goal-related type definitions
 * These types mirror the YAML frontmatter structure in Obsidian notes
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

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
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
  completions: string[]; // Array of ISO date strings (for weekly goals: "YYYY-WXX")
  subtasks?: Subtask[];
  tags: string[];
  category: string; // Folder name (e.g., "YouTube", "Work")
  filePath: string; // Full path in Obsidian vault
  monthlyProgress?: MonthlyProgress; // Track progress for monthly goals
  dailySubtaskCompletions?: DailySubtaskCompletions; // Track subtask completion per day for daily goals
  weeklySubtaskCompletions?: WeeklySubtaskCompletions; // Track subtask completion per week for weekly goals
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

/**
 * Tracks which subtasks are completed on which days for daily goals
 * Key is ISO date string, value is array of completed subtask IDs
 */
export interface DailySubtaskCompletions {
  [date: string]: string[]; // e.g., "2026-01-05": ["subtask1", "subtask2"]
}

/**
 * Tracks which subtasks are completed for which weeks for weekly goals
 * Key is week key string (YYYY-WXX), value is array of completed subtask IDs
 */
export interface WeeklySubtaskCompletions {
  [weekKey: string]: string[]; // e.g., "2026-W05": ["subtask1", "subtask2"]
}
