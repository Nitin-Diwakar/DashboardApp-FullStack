// src/hooks/useDashboardData.ts
import { useState, useEffect, useRef } from 'react';
import { ISensorData, IWeatherData } from '@/types/sensors';
import { FormattedSensorData, MonthlyData, MonthOption } from '@/types/dashboard';
import { fetchSensorData, fetchWeatherData } from '@/lib/api';
import { 
  processHistoricalData, 
  processMonthOptions, 
  processDailyAverageData, 
  processMonthlyAverageData 
} from '@/utils/dataProcessors';
import { getCurrentMonthKey } from '@/utils/dateHelpers';

export const useDashboardData = () => {
  // Core data states
  const [sensorData, setSensorData] = useState<ISensorData | null>(null);
  const [weatherData, setWeatherData] = useState<IWeatherData | null>(null);
  const [historicalData, setHistoricalData] = useState<FormattedSensorData[]>([]);
  const [weeklyData, setWeeklyData] = useState<FormattedSensorData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [availableMonths, setAvailableMonths] = useState<MonthOption[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const dataInitialized = useRef(false);

  // Load initial data
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch data
      const sensors = await fetchSensorData();
      const weather = await fetchWeatherData();
  
      // Set current weather and sensor data
      setWeatherData(weather);
      const latest = sensors[sensors.length - 1];
      
      const currentSensorData = {
        moisture1: latest.sensor1,
        moisture2: latest.sensor2,
        // Use sensor data if available, fallback to weather API
        temperature: latest.temperature !== null ? latest.temperature : weather.temperature,
        humidity: latest.humidity !== null ? latest.humidity : weather.humidity,
      };
      
      setSensorData(currentSensorData);
  
      // Process historical data
      const formattedData = processHistoricalData(sensors);
      setHistoricalData(formattedData);
      
      const monthsList = processMonthOptions(formattedData);
      setAvailableMonths(monthsList);
      
      const dailyAvgData = processDailyAverageData(formattedData);
      setWeeklyData(dailyAvgData);
  
      const monthlyAvgData = processMonthlyAverageData(dailyAvgData);
      setMonthlyData(monthlyAvgData);
      
      dataInitialized.current = true;
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setIsLoading(false);
    }
  };

  // Refresh live data only
  const refreshLiveData = async () => {
    try {
      const weather = await fetchWeatherData();
      const sensors = await fetchSensorData();
      const latest = sensors[sensors.length - 1];
      
      setWeatherData({ ...weather });
      
      const updatedSensorData = {
        moisture1: latest.sensor1,
        moisture2: latest.sensor2, 
        temperature: latest.temperature !== null ? latest.temperature : weather.temperature,
        humidity: latest.humidity !== null ? latest.humidity : weather.humidity
      };
      
      setSensorData(updatedSensorData);
    } catch (error) {
      console.error("Error updating sensor data:", error);
    }
  };

  // Initial load effect
  useEffect(() => {
    loadInitialData();
    
    // Set up refresh cycle for live data
    const refreshInterval = setInterval(refreshLiveData, 30000);
    return () => clearInterval(refreshInterval);
  }, []);

  // Get initial month selection
  const getInitialMonth = (): string => {
    const currentMonthKey = getCurrentMonthKey();
    const monthExists = availableMonths.some(m => m.id === currentMonthKey);
    
    if (monthExists) {
      return currentMonthKey;
    } else if (availableMonths.length > 0) {
      return availableMonths[availableMonths.length - 1].id;
    }
    
    return "";
  };

  return {
    // Data
    sensorData,
    weatherData,
    historicalData,
    weeklyData,
    monthlyData,
    availableMonths,
    
    // States
    isLoading,
    dataInitialized: dataInitialized.current,
    
    // Methods
    loadInitialData,
    refreshLiveData,
    getInitialMonth,
  };
};