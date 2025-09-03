// src/hooks/useChartFilters.ts - Fixed to match Dashboard expectations
import { useState, useEffect, useMemo } from 'react';
import { FormattedSensorData } from '@/types/dashboard';

interface UseChartFiltersReturn {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedTimeframe: string;
  setSelectedTimeframe: (timeframe: string) => void;
  filteredData: FormattedSensorData[];
}

export const useChartFilters = (
  historicalData: FormattedSensorData[], 
  initialMonth: string
): UseChartFiltersReturn => {
  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth || '');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('daily');

  // Update selected month when initial month changes
  useEffect(() => {
    if (initialMonth && initialMonth !== selectedMonth) {
      setSelectedMonth(initialMonth);
    }
  }, [initialMonth]);

  // Filter data based on selected month and timeframe
  const filteredData = useMemo(() => {
    if (!selectedMonth || !historicalData.length) {
      return historicalData;
    }

    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    
    return historicalData.filter(
      entry => entry.year === year && entry.month === month
    );
  }, [historicalData, selectedMonth]);

  return {
    selectedMonth,
    setSelectedMonth,
    selectedTimeframe,
    setSelectedTimeframe,
    filteredData
  };
};