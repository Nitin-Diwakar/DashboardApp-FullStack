// src/utils/dateHelpers.ts - Missing utility functions
import { format } from 'date-fns';

export const getCurrentMonthKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}`;
};

export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const getMonthWeek = (date: Date): number => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfMonth = date.getDate();
  const firstDayOfWeek = firstDay.getDay();
  return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
};

export const formatDateIndia = (date: Date, options: Intl.DateTimeFormatOptions = {}): string => {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    ...options
  }).format(date);
};

export const createDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

// src/utils/dataProcessors.ts - Missing data processing functions
import { FormattedSensorData, MonthOption } from '@/types/dashboard';
import { getWeekNumber, getMonthWeek, formatDateIndia, createDateKey } from './dateHelpers';

export const processHistoricalData = (sensors: any[]): FormattedSensorData[] => {
  return sensors.map((entry) => {
    const entryDate = new Date(entry.timestamp);
    const monthWeek = getMonthWeek(entryDate);
    
    return {
      timestamp: entry.timestamp,
      time: formatDateIndia(entryDate, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        day: "numeric",
        month: "short"
      }),
      moisture1: entry.sensor1 || 0,
      moisture2: entry.sensor2 || 0,
      date: entryDate,
      month: entryDate.getMonth(),
      year: entryDate.getFullYear(),
      monthName: formatDateIndia(entryDate, { month: "long" }),
      weekNum: getWeekNumber(entryDate),
      monthWeek: monthWeek,
      dayOfMonth: entryDate.getDate(),
      formattedDate: formatDateIndia(entryDate, {
        day: "numeric",
        month: "short"
      })
    };
  });
};

export const processMonthOptions = (formattedData: FormattedSensorData[]): MonthOption[] => {
  const monthsMap = new Map<string, MonthOption>();
  
  formattedData.forEach(entry => {
    const key = `${entry.year}-${entry.month}`;
    if (!monthsMap.has(key)) {
      monthsMap.set(key, {
        id: key,
        name: `${entry.monthName} ${entry.year}`,
        month: entry.month,
        year: entry.year
      });
    }
  });

  return Array.from(monthsMap.values()).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
};

export const processDailyAverageData = (formattedData: FormattedSensorData[]): FormattedSensorData[] => {
  // For now, just return the formatted data as-is
  // In a real implementation, you'd calculate daily averages
  return formattedData;
};

export const processMonthlyAverageData = (dailyData: FormattedSensorData[]): any[] => {
  // For now, return empty array
  // In a real implementation, you'd calculate monthly averages
  return [];
};

export const processDayOptions = (filteredData: FormattedSensorData[]): any[] => {
  // For now, return empty array
  // In a real implementation, you'd process day options
  return [];
};