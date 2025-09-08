// src/hooks/useChartFilters.ts
import { useState, useEffect } from 'react';
import { 
  FormattedSensorData, 
  DashboardState, 
  WeekOption, 
  DayOption 
} from '@/types/dashboard';
import { processDayOptions } from '@/utils/dataProcessors';

interface UseChartFiltersProps {
  historicalData: FormattedSensorData[];
  weeklyData: FormattedSensorData[];
  initialMonth: string;
}

export const useChartFilters = ({ 
  historicalData, 
  weeklyData, 
  initialMonth 
}: UseChartFiltersProps) => {
  // Filter states
  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth);
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  
  // Options states
  const [availableWeeks, setAvailableWeeks] = useState<WeekOption[]>([]);
  const [availableDays, setAvailableDays] = useState<DayOption[]>([]);
  
  // Filtered data states
  const [filteredDailyData, setFilteredDailyData] = useState<FormattedSensorData[]>([]);
  const [filteredWeeklyData, setFilteredWeeklyData] = useState<FormattedSensorData[]>([]);
  const [filteredDayData, setFilteredDayData] = useState<FormattedSensorData[]>([]);

  // Update initial month when it changes
  useEffect(() => {
    if (initialMonth && initialMonth !== selectedMonth) {
      setSelectedMonth(initialMonth);
    }
  }, [initialMonth]);

  // Handle month selection change
  useEffect(() => {
    if (selectedMonth && historicalData.length > 0) {
      const [yearStr, monthStr] = selectedMonth.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      
      // Filter daily data for the selected month
      const filteredDaily = historicalData.filter(
        entry => entry.year === year && entry.month === month
      );
      setFilteredDailyData(filteredDaily);
      
      // Update available days for the selected month
      const daysList = processDayOptions(filteredDaily);
      setAvailableDays(daysList);
      
      // Set the first day as default if none selected and days are available
      if (selectedDay === "" && daysList.length > 0) {
        setSelectedDay("current");
      }
      
      // Filter weekly data for the selected month
      const filteredWeekly = weeklyData.filter(
        entry => entry.year === year && entry.month === month
      );
      setFilteredWeeklyData(filteredWeekly);
      
      // Update available weeks for the selected month based on monthWeek
      const weeksInMonth = new Map<string, WeekOption>();
      filteredWeekly.forEach(entry => {
        const weekKey = `${entry.year}-${entry.month}-Week${entry.monthWeek}`;
        if (!weeksInMonth.has(weekKey)) {
          weeksInMonth.set(weekKey, {
            id: weekKey,
            name: `Week ${entry.monthWeek}`,
            weekNum: entry.monthWeek,
            year: entry.year
          });
        }
      });
      
      const weeksList = Array.from(weeksInMonth.values());
      weeksList.sort((a, b) => a.weekNum - b.weekNum);
      setAvailableWeeks(weeksList);
      
      // Set the first week as default if none selected and weeks are available
      if (selectedWeek === "" && weeksList.length > 0) {
        setSelectedWeek(weeksList[0].id);
      }
    }
  }, [selectedMonth, historicalData, weeklyData]);

  // Filter daily data when day changes
  useEffect(() => {
    if (selectedDay === "current") {
      setFilteredDayData(filteredDailyData);
    } else if (selectedDay && filteredDailyData.length > 0) {
      const dayDate = new Date(selectedDay);
      
      const dayData = filteredDailyData.filter(entry => 
        entry.date.getDate() === dayDate.getDate() &&
        entry.date.getMonth() === dayDate.getMonth() &&
        entry.date.getFullYear() === dayDate.getFullYear()
      );
      
      setFilteredDayData(dayData);
    } else {
      setFilteredDayData(filteredDailyData);
    }
  }, [selectedDay, filteredDailyData]);

  // Filter weekly data when week changes
  useEffect(() => {
    if (selectedWeek && selectedWeek !== "current" && weeklyData.length > 0) {
      const weekParts = selectedWeek.split('-Week');
      if (weekParts.length === 2) {
        const [yearMonth, weekNum] = weekParts;
        const [year, month] = yearMonth.split('-').map(Number);
        const weekNumber = parseInt(weekNum);
        
        const filteredByWeek = weeklyData.filter(
          entry => entry.year === year && 
                  entry.month === month && 
                  entry.monthWeek === weekNumber
        );
        
        setFilteredWeeklyData(filteredByWeek);
      }
    }
  }, [selectedWeek, weeklyData]);

  return {
    // Current selections
    selectedMonth,
    selectedWeek,
    selectedDay,
    
    // Available options
    availableWeeks,
    availableDays,
    
    // Filtered data
    filteredDailyData,
    filteredWeeklyData,
    filteredDayData,
    
    // Setters
    setSelectedMonth,
    setSelectedWeek,
    setSelectedDay,
  };
};