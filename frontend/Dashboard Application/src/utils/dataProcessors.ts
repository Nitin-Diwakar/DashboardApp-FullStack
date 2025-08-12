// src/utils/dataProcessors.ts
import { 
    FormattedSensorData, 
    MonthOption, 
    MonthlyData, 
    DayOption 
  } from '@/types/dashboard';
  import { 
    getWeekNumber, 
    getMonthWeek, 
    formatDateIndia, 
    createDateKey 
  } from './dateHelpers';
  
  /**
   * Transform raw sensor data into formatted data structure
   * @param sensors - Raw sensor data from API
   * @returns Formatted sensor data array
   */
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
        moisture1: entry.sensor1,
        moisture2: entry.sensor2,
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
  
  /**
   * Extract unique months from formatted data
   * @param formattedData - Formatted sensor data
   * @returns Array of month options
   */
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
    
    const monthsList = Array.from(monthsMap.values());
    monthsList.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
    
    return monthsList;
  };
  
  /**
   * Process daily average data from formatted data
   * @param formattedData - Formatted sensor data
   * @returns Daily averaged data
   */
  export const processDailyAverageData = (formattedData: FormattedSensorData[]): FormattedSensorData[] => {
    const weekMap = new Map<string, FormattedSensorData[]>();
    
    formattedData.forEach((d) => {
      const day = new Date(d.timestamp).toDateString();
      if (!weekMap.has(day)) weekMap.set(day, []);
      weekMap.get(day)?.push(d);
    });
    
    return Array.from(weekMap.entries()).map(([day, entries]) => {
      const m1 = entries.reduce((sum, e) => sum + e.moisture1, 0) / entries.length;
      const m2 = entries.reduce((sum, e) => sum + e.moisture2, 0) / entries.length;
      const entryDate = new Date(entries[0].timestamp);
      
      return { 
        timestamp: entries[0].timestamp,
        time: day.slice(4, 10), 
        moisture1: m1, 
        moisture2: m2,
        date: entryDate,
        month: entryDate.getMonth(),
        year: entryDate.getFullYear(),
        monthName: entries[0].monthName,
        weekNum: getWeekNumber(entryDate),
        monthWeek: entries[0].monthWeek,
        dayOfMonth: entryDate.getDate(),
        formattedDate: entries[0].formattedDate
      };
    });
  };
  
  /**
   * Process monthly average data from daily data
   * @param dailyAvgData - Daily averaged data
   * @returns Monthly averaged data
   */
  export const processMonthlyAverageData = (dailyAvgData: FormattedSensorData[]): MonthlyData[] => {
    const monthlyMap = new Map<string, FormattedSensorData[]>();
    
    dailyAvgData.forEach((d) => {
      const key = `${d.year}-${d.month}-Week${d.monthWeek}`;
      if (!monthlyMap.has(key)) monthlyMap.set(key, []);
      monthlyMap.get(key)?.push(d);
    });
    
    return Array.from(monthlyMap.entries()).map(([weekKey, entries]) => {
      const m1 = entries.reduce((sum, e) => sum + e.moisture1, 0) / entries.length;
      const m2 = entries.reduce((sum, e) => sum + e.moisture2, 0) / entries.length;
      
      return { 
        time: `Week ${entries[0].monthWeek}`, 
        moisture1: m1, 
        moisture2: m2,
        weekNum: entries[0].weekNum,
        monthWeek: entries[0].monthWeek,
        year: entries[0].year,
        month: entries[0].month
      };
    });
  };
  
  /**
   * Process unique days for a filtered dataset
   * @param filteredDaily - Filtered daily data
   * @returns Array of day options
   */
  export const processDayOptions = (filteredDaily: FormattedSensorData[]): DayOption[] => {
    const daysInMonth = new Map<string, DayOption>();
    
    filteredDaily.forEach(entry => {
      const dateKey = createDateKey(entry.date);
      if (!daysInMonth.has(dateKey)) {
        daysInMonth.set(dateKey, {
          id: dateKey,
          name: formatDateIndia(new Date(dateKey), {
            day: "numeric",
            month: "short"
          }),
          timestamp: entry.timestamp,
          date: new Date(dateKey)
        });
      }
    });
    
    const daysList = Array.from(daysInMonth.values());
    daysList.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return daysList;
  };