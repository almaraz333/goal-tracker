/**
 * Calendar-related utility functions
 */

import type { 
  Goal, 
  CalendarDay, 
  CalendarMonth, 
  CalendarWeek,
  DayStatus, 
  MonthStatus, 
  WeekStatus,
  DayTask,
  WeeklyGoalTask,
  MonthlyGoalTask,
  WeekInfo
} from '@/types';
import { 
  formatDateToISO, 
  isToday, 
  isFutureDate, 
  getDaysInMonth, 
  getFirstDayOfMonth,
  getWeekNumber,
  getWeekInfo,
  parseISODate
} from './date.utils';
import { 
  isDailyGoalActiveOnDate, 
  sortGoalsByPriority,
  getWeeklyGoalsForWeek,
  isWeeklyGoalCompletedForWeek,
  getMonthlyGoalsForMonth,
  getMonthlyGoalProgress
} from './goal.utils';

/**
 * Calculate the status of a day based on DAILY task completion
 * - Future days: 'none' (no indicator)
 * - Today: 'none' (no indicator - can still complete tasks), 'partial' if some done, 'complete' if all done
 * - Past days: 'incomplete' (red) if not all done, 'complete' (green) if all done
 */
export function calculateDayStatus(tasks: DayTask[], isFuture: boolean, isCurrentDay: boolean = false): DayStatus {
  // No tasks = no status indicator
  if (tasks.length === 0) {
    return 'none';
  }
  
  // Future days show no status
  if (isFuture) {
    return 'none';
  }
  
  const completedCount = tasks.filter(t => t.isCompleted).length;
  
  // All tasks completed = green
  if (completedCount === tasks.length) {
    return 'complete';
  }
  
  // Today with partial progress shows partial, otherwise no indicator (can still work on it)
  if (isCurrentDay) {
    if (completedCount > 0) {
      return 'partial';
    }
    return 'none'; // Today with nothing done yet - no red dot
  }
  
  // Past day with some but not all = partial (orange)
  if (completedCount > 0) {
    return 'partial';
  }
  
  // Past day with nothing done = incomplete (red)
  return 'incomplete';
}

/**
 * Calculate week status based on weekly goals
 */
export function calculateWeekStatus(weeklyGoals: WeeklyGoalTask[], weekInfo: WeekInfo): WeekStatus {
  if (weeklyGoals.length === 0) {
    return 'none';
  }
  
  const completedCount = weeklyGoals.filter(g => g.isCompleted).length;
  
  if (completedCount === weeklyGoals.length) {
    return 'complete';
  }
  
  const weekEnd = parseISODate(weekInfo.endDate);
  const isFuture = isFutureDate(weekEnd);
  const isEndsToday = isToday(weekEnd);
  
  if (isFuture || isEndsToday) {
    if (completedCount === weeklyGoals.length) {
      return 'complete';
    }
    return completedCount > 0 ? 'partial' : 'none';
  }
  
  if (completedCount === 0) {
    return 'incomplete';
  }
  
  return 'partial';
}

/**
 * Get DAILY tasks for a specific day
 * For daily goals with subtasks, we track completion per-day using dailySubtaskCompletions
 */
export function getTasksForDay(goals: Goal[], date: Date): DayTask[] {
  const tasks: DayTask[] = [];
  const dailyGoals = goals.filter(g => g.type === 'daily');
  const sortedGoals = sortGoalsByPriority(dailyGoals);
  
  for (const goal of sortedGoals) {
    if (!isDailyGoalActiveOnDate(goal, date)) {
      continue;
    }
    
    // Daily goals require subtasks - if no subtasks, nothing to show
    if (goal.subtasks && goal.subtasks.length > 0) {
      const dateStr = formatDateToISO(date);
      const completedSubtasksToday = goal.dailySubtaskCompletions?.[dateStr] ?? [];
      
      for (const subtask of goal.subtasks) {
        tasks.push({
          goalId: goal.id,
          goal,
          isCompleted: completedSubtasksToday.includes(subtask.id),
          isSubtask: true,
          subtaskId: subtask.id,
          subtaskTitle: subtask.title,
        });
      }
    }
    // No subtasks = nothing to check off (per user requirement)
  }
  
  return tasks;
}

/**
 * Get weekly goal tasks for a week, filtered by the current month being viewed
 */
export function getWeeklyGoalTasks(goals: Goal[], weekInfo: WeekInfo, year: number, month: number): WeeklyGoalTask[] {
  const weeklyGoals = getWeeklyGoalsForWeek(goals, weekInfo);
  // weekInfo.startDate is already the ISO string of the Monday of the week (YYYY-MM-DD)
  const weekKey = weekInfo.startDate;
  
  // Filter to only show goals that overlap with the current month
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0); // Last day of month
  
  const filteredGoals = weeklyGoals.filter(goal => {
    const goalStart = parseISODate(goal.startDate);
    const goalEnd = parseISODate(goal.endDate);
    
    // Check if goal overlaps with the current month
    return goalEnd >= monthStart && goalStart <= monthEnd;
  });
  
  return sortGoalsByPriority(filteredGoals).map(goal => ({
    goalId: goal.id,
    goal,
    isCompleted: isWeeklyGoalCompletedForWeek(goal, weekInfo),
    weekKey,
  }));
}

/**
 * Get monthly goal tasks for a month
 */
export function getMonthlyGoalTasks(goals: Goal[], year: number, month: number): MonthlyGoalTask[] {
  const monthlyGoals = getMonthlyGoalsForMonth(goals, year, month);
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  
  return sortGoalsByPriority(monthlyGoals).map(goal => {
    const currentCount = getMonthlyGoalProgress(goal, year, month);
    const targetCount = goal.recurrence?.targetCount ?? 1;
    const minimumCount = goal.recurrence?.minimumCount ?? 1;
    
    return {
      goalId: goal.id,
      goal,
      currentCount,
      targetCount,
      minimumCount,
      isCompleted: currentCount >= minimumCount,
      monthKey,
    };
  });
}

/**
 * Build a CalendarDay object for a specific date
 */
export function buildCalendarDay(date: Date, goals: Goal[], currentMonth: number): CalendarDay {
  const tasks = getTasksForDay(goals, date);
  const future = isFutureDate(date);
  const today = isToday(date);
  
  return {
    date: formatDateToISO(date),
    dayOfMonth: date.getDate(),
    isCurrentMonth: date.getMonth() === currentMonth,
    isToday: today,
    isFuture: future,
    status: calculateDayStatus(tasks, future, today),
    tasks,
    completedCount: tasks.filter(t => t.isCompleted).length,
    totalCount: tasks.length,
    weekNumber: getWeekNumber(date),
  };
}

/**
 * Build calendar weeks from days
 */
export function buildCalendarWeeks(days: CalendarDay[], goals: Goal[], currentMonth: number, currentYear: number): CalendarWeek[] {
  // Group days into week rows (7 days per row)
  const weekRows: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weekRows.push(days.slice(i, i + 7));
  }
  
  // Build week objects
  const weeks: CalendarWeek[] = [];
  
  weekRows.forEach((weekDays, weekIndex) => {
    if (weekDays.length === 0) return;
    
    // Check if this week has any days in the current month
    const hasCurrentMonthDays = weekDays.some(d => d.isCurrentMonth);
    if (!hasCurrentMonthDays) return;
    
    // Determine the week info based on the Monday of this row
    // This ensures that Sunday (which might belong to previous ISO week) doesn't drag the whole row back
    const mondayDay = weekDays.find(d => {
      const date = parseISODate(d.date);
      return date.getDay() === 1;
    });
    
    // Fallback to first current month day if Monday not found (should be rare/impossible in 7-day grid)
    const referenceDay = mondayDay || weekDays.find(d => d.isCurrentMonth) || weekDays[0];
    const firstDay = parseISODate(referenceDay.date);
    const weekInfo = getWeekInfo(firstDay);
    
    const weeklyGoals = getWeeklyGoalTasks(goals, weekInfo, currentYear, currentMonth);
    
    weeks.push({
      weekInfo,
      weekIndex,
      days: weekDays,
      weeklyGoals,
      status: calculateWeekStatus(weeklyGoals, weekInfo),
    });
  });
  
  return weeks;
}

/**
 * Calculate month status based on day statuses
 */
export function calculateMonthStatus(days: CalendarDay[]): MonthStatus {
  const relevantDays = days.filter(d => d.isCurrentMonth && !d.isFuture && d.totalCount > 0);
  
  if (relevantDays.length === 0) {
    return 'none';
  }
  
  const completeDays = relevantDays.filter(d => d.status === 'complete').length;
  const ratio = completeDays / relevantDays.length;
  
  if (ratio === 1) {
    return 'green';
  }
  
  if (ratio >= 0.5) {
    return 'orange';
  }
  
  return 'red';
}

/**
 * Build a full calendar month with all days, weeks, and monthly goals
 */
export function buildCalendarMonth(year: number, month: number, goals: Goal[]): CalendarMonth {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfMonth(year, month);
  
  // Add padding days from previous month
  const paddingDays: CalendarDay[] = [];
  if (firstDayOfWeek > 0) {
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthDays = getDaysInMonth(prevYear, prevMonth);
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = prevMonthDays[prevMonthDays.length - 1 - i];
      paddingDays.push(buildCalendarDay(date, goals, month));
    }
  }
  
  // Build current month days
  const currentMonthDays = daysInMonth.map(date => buildCalendarDay(date, goals, month));
  
  // Add padding days from next month to complete the grid
  const totalDaysSoFar = paddingDays.length + currentMonthDays.length;
  const remainingDays = totalDaysSoFar % 7 === 0 ? 0 : 7 - (totalDaysSoFar % 7);
  
  const nextPaddingDays: CalendarDay[] = [];
  if (remainingDays > 0) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const nextMonthDays = getDaysInMonth(nextYear, nextMonth);
    
    for (let i = 0; i < remainingDays; i++) {
      nextPaddingDays.push(buildCalendarDay(nextMonthDays[i], goals, month));
    }
  }
  
  const allDays = [...paddingDays, ...currentMonthDays, ...nextPaddingDays];
  const weeks = buildCalendarWeeks(allDays, goals, month, year);
  const monthlyGoals = getMonthlyGoalTasks(goals, year, month);
  const status = calculateMonthStatus(allDays);
  
  const completedDays = currentMonthDays.filter(d => d.status === 'complete' && !d.isFuture).length;
  const totalDaysWithTasks = currentMonthDays.filter(d => d.totalCount > 0 && !d.isFuture).length;
  
  return {
    year,
    month,
    days: allDays,
    weeks,
    monthlyGoals,
    status,
    completedDays,
    totalDays: totalDaysWithTasks,
  };
}

/**
 * Get status color class for a day
 */
export function getDayStatusColor(status: DayStatus): string {
  switch (status) {
    case 'complete':
      return 'bg-progress-complete';
    case 'incomplete':
      return 'bg-status-danger';
    case 'partial':
      return 'bg-status-warning';
    case 'none':
    default:
      return 'bg-progress-empty';
  }
}

/**
 * Get status color class for a month
 */
export function getMonthStatusColor(status: MonthStatus): string {
  switch (status) {
    case 'green':
      return 'text-status-success';
    case 'orange':
      return 'text-status-warning';
    case 'red':
      return 'text-status-danger';
    case 'none':
    default:
      return 'text-text-muted';
  }
}
