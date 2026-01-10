/**
 * Date utility functions
 */

import type { DayOfWeek, WeekInfo } from '@/types';

/**
 * Format a Date object to ISO date string (YYYY-MM-DD)
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a Date to month key (YYYY-MM)
 */
export function formatToMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Parse an ISO date string to a Date object
 */
export function parseISODate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Check if a date is in the future
 */
export function isFutureDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate > today;
}

/**
 * Check if a date is in the past
 */
export function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
}

/**
 * Get the day of week from a Date object
 */
export function getDayOfWeek(date: Date): DayOfWeek {
  const days: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return days[date.getDay()];
}

/**
 * Get ISO week number for a date (Monday = start of week)
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Get ISO Week Year
 */
export function getISOWeekYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  return d.getUTCFullYear();
}

/**
 * Get week key in format "YYYY-WXX"
 */
export function getWeekKey(date: Date): string {
  // Normalize to noon to avoid DST/midnight edge cases
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  
  const day = d.getDay();
  // Calculate difference to Monday
  // Sun (0) -> -6
  // Mon (1) -> 0
  // Tue (2) -> -1
  // ...
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  
  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, '0');
  const dayOfMonth = String(monday.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${dayOfMonth}`;
}

/**
 * Get week info for a given date
 */
export function getWeekInfo(date: Date): WeekInfo {
  const weekNumber = getWeekNumber(date);
  const year = date.getFullYear();
  
  // Find Monday of this week
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  
  // Find Sunday
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return {
    weekNumber,
    year,
    startDate: formatDateToISO(monday),
    endDate: formatDateToISO(sunday),
  };
}

/**
 * Check if a date falls within a week
 */
export function isDateInWeek(date: Date, weekInfo: WeekInfo): boolean {
  const dateStr = formatDateToISO(date);
  return dateStr >= weekInfo.startDate && dateStr <= weekInfo.endDate;
}

/**
 * Get all days in a month as an array of Date objects
 */
export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  
  return days;
}

/**
 * Get the number of days in a month
 */
export function getMonthDayCount(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Get the first day of the week for a month (0 = Monday, 6 = Sunday)
 * Returns Monday-based offset for calendar grid alignment
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  // Convert from Sunday-based (0=Sun) to Monday-based (0=Mon)
  // Sunday (0) -> 6, Monday (1) -> 0, Tuesday (2) -> 1, etc.
  return day === 0 ? 6 : day - 1;
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add months to a date
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Get month name
 */
export function getMonthName(month: number, format: 'long' | 'short' = 'long'): string {
  const date = new Date(2000, month, 1);
  return date.toLocaleDateString('en-US', { month: format });
}

/**
 * Get day name (Monday-based: 0=Mon, 1=Tue, ..., 6=Sun)
 */
export function getDayName(dayIndex: number, format: 'long' | 'short' | 'narrow' = 'short'): string {
  // Jan 3, 2000 was a Monday, so adding dayIndex gives Mon-Sun
  const date = new Date(2000, 0, 3 + dayIndex);
  return date.toLocaleDateString('en-US', { weekday: format });
}

/**
 * Check if a date falls within a range
 */
export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  const d = new Date(date).setHours(0, 0, 0, 0);
  const start = new Date(startDate).setHours(0, 0, 0, 0);
  const end = new Date(endDate).setHours(0, 0, 0, 0);
  return d >= start && d <= end;
}

/**
 * Format date for display
 */
export function formatDateDisplay(date: Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options ?? defaultOptions);
}
