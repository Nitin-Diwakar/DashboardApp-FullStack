// src/utils/dateHelpers.ts

/**
 * Get week number of the year
 * @param date - Date to get week number for
 * @returns Week number (1-53)
 */
export const getWeekNumber = (date: Date): number => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

/**
 * Get week number relative to the month (1-indexed)
 * @param date - Date to get month week for
 * @returns Week number within month (1-6)
 */
export const getMonthWeek = (date: Date): number => {
  const d = new Date(date);
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
  const offsetDay = firstDay.getDay() || 7; // Make Sunday 7 instead of 0
  const dayOfMonth = d.getDate();
  return Math.ceil((dayOfMonth + offsetDay - 1) / 7);
};

/**
 * Format date for display in Indian locale
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDateIndia = (
  date: Date, 
  options: Intl.DateTimeFormatOptions
): string => {
  return date.toLocaleString("en-IN", options);
};

/**
 * Get current month key for filtering
 * @returns String in format "YYYY-MM"
 */
export const getCurrentMonthKey = (): string => {
  const currentDate = new Date();
  return `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
};

/**
 * Create unique date key for grouping
 * @param date - Date to create key for
 * @returns ISO date string (YYYY-MM-DD)
 */
export const createDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};