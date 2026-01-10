/**
 * Goal-related utility functions
 */

import type { Goal, WeekInfo } from '@/types';
import { 
  formatDateToISO, 
  parseISODate, 
  getDayOfWeek, 
  isDateInRange
} from './date.utils';

/**
 * Check if a DAILY goal is active on a specific date
 */
export function isDailyGoalActiveOnDate(goal: Goal, date: Date): boolean {
  if (goal.type !== 'daily') return false;
  
  const startDate = parseISODate(goal.startDate);
  const endDate = parseISODate(goal.endDate);
  
  // Check if date is within goal's active range
  if (!isDateInRange(date, startDate, endDate)) {
    return false;
  }
  
  // Check if goal is paused or archived
  if (goal.status === 'paused' || goal.status === 'archived') {
    return false;
  }
  
  // Check recurrence rules for specific days
  if (goal.recurrence?.daysOfWeek && goal.recurrence.daysOfWeek.length > 0) {
    const currentDayOfWeek = getDayOfWeek(date);
    return goal.recurrence.daysOfWeek.includes(currentDayOfWeek);
  }
  
  // Default: show every day
  return true;
}

/**
 * Check if a WEEKLY goal is active for a specific week
 */
export function isWeeklyGoalActiveForWeek(goal: Goal, weekInfo: WeekInfo): boolean {
  if (goal.type !== 'weekly') return false;
  
  const startDate = parseISODate(goal.startDate);
  const endDate = parseISODate(goal.endDate);
  const weekStart = parseISODate(weekInfo.startDate);
  const weekEnd = parseISODate(weekInfo.endDate);
  
  // Check if week overlaps with goal's active range
  if (weekEnd < startDate || weekStart > endDate) {
    return false;
  }
  
  // Check if goal is paused or archived
  if (goal.status === 'paused' || goal.status === 'archived') {
    return false;
  }
  
  return true;
}

/**
 * Check if a MONTHLY goal is active for a specific month
 */
export function isMonthlyGoalActiveForMonth(goal: Goal, year: number, month: number): boolean {
  if (goal.type !== 'monthly') return false;
  
  const startDate = parseISODate(goal.startDate);
  const endDate = parseISODate(goal.endDate);
  
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0); // Last day of month
  
  // Check if month overlaps with goal's active range
  if (monthEnd < startDate || monthStart > endDate) {
    return false;
  }
  
  // Check if goal is paused or archived
  if (goal.status === 'paused' || goal.status === 'archived') {
    return false;
  }
  
  return true;
}

/**
 * Check if a daily goal is completed on a specific date
 */
export function isGoalCompletedOnDate(goal: Goal, date: Date): boolean {
  const dateString = formatDateToISO(date);
  return goal.completions.includes(dateString);
}

/**
 * Check if a weekly goal is completed for a specific week
 */
export function isWeeklyGoalCompletedForWeek(goal: Goal, weekInfo: WeekInfo): boolean {
  // Use startDate (Monday) directly as the key
  const weekKey = weekInfo.startDate;
  
  if (goal.completions.includes(weekKey)) {
    return true;
  }
  
  // If goal has subtasks, check if all are completed for this week
  if (goal.subtasks && goal.subtasks.length > 0) {
    const completedSubtasks = goal.weeklySubtaskCompletions?.[weekKey] || [];
    if (completedSubtasks.length < goal.subtasks.length) return false;
    return goal.subtasks.every(st => completedSubtasks.includes(st.id));
  }
  
  return false;
}

/**
 * Get the completion count for a monthly goal in a specific month
 */
export function getMonthlyGoalProgress(goal: Goal, year: number, month: number): number {
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  return goal.monthlyProgress?.[monthKey] ?? 0;
}

/**
 * Get daily goals for a specific date
 */
export function getDailyGoalsForDate(goals: Goal[], date: Date): Goal[] {
  return goals.filter(goal => isDailyGoalActiveOnDate(goal, date));
}

/**
 * Get weekly goals for a specific week
 */
export function getWeeklyGoalsForWeek(goals: Goal[], weekInfo: WeekInfo): Goal[] {
  return goals.filter(goal => isWeeklyGoalActiveForWeek(goal, weekInfo));
}

/**
 * Get monthly goals for a specific month
 */
export function getMonthlyGoalsForMonth(goals: Goal[], year: number, month: number): Goal[] {
  return goals.filter(goal => isMonthlyGoalActiveForMonth(goal, year, month));
}

/**
 * Check if a subtask is completed on a specific date for a daily goal
 */
export function isSubtaskCompletedOnDate(goal: Goal, subtaskId: string, date: Date): boolean {
  if (goal.type !== 'daily') return false;
  const dateStr = formatDateToISO(date);
  const completedSubtasks = goal.dailySubtaskCompletions?.[dateStr] ?? [];
  return completedSubtasks.includes(subtaskId);
}

/**
 * Get all completed subtask IDs for a specific date
 */
export function getCompletedSubtasksForDate(goal: Goal, date: Date): string[] {
  if (goal.type !== 'daily') return [];
  const dateStr = formatDateToISO(date);
  return goal.dailySubtaskCompletions?.[dateStr] ?? [];
}

/**
 * Check if all subtasks are completed on a specific date for a daily goal
 */
export function areAllSubtasksCompletedOnDate(goal: Goal, date: Date): boolean {
  if (goal.type !== 'daily') return false;
  if (!goal.subtasks || goal.subtasks.length === 0) return false;
  
  const completedSubtasks = getCompletedSubtasksForDate(goal, date);
  return goal.subtasks.every(subtask => completedSubtasks.includes(subtask.id));
}

/**
 * Group goals by category
 */
export function groupGoalsByCategory(goals: Goal[]): Record<string, Goal[]> {
  return goals.reduce((acc, goal) => {
    if (!acc[goal.category]) {
      acc[goal.category] = [];
    }
    acc[goal.category].push(goal);
    return acc;
  }, {} as Record<string, Goal[]>);
}

/**
 * Group goals by type
 */
export function groupGoalsByType(goals: Goal[]): { daily: Goal[]; weekly: Goal[]; monthly: Goal[] } {
  return {
    daily: goals.filter(g => g.type === 'daily'),
    weekly: goals.filter(g => g.type === 'weekly'),
    monthly: goals.filter(g => g.type === 'monthly'),
  };
}

/**
 * Sort goals by priority
 */
export function sortGoalsByPriority(goals: Goal[]): Goal[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return [...goals].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}
