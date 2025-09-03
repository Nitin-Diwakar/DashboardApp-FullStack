// src/hooks/useDashboardData.ts - Fixed to match Dashboard expectations
import { useState, useEffect, useCallback } from 'react';
import { ISensorData, IWeatherData, FormattedSensorData } from '@/types/sensors';
import { MonthlyData, MonthOption } from '@/types/dashboard';
import { fetchSensorData, fetchWeatherData } from '@/lib/api';
import { processHistoricalData, processMonthOptions } from '@/utils/dataProcessors';
import { getCurrentMonthKey } from '@/utils/dateHelpers';

interface UseDashboardDataReturn {
  // Core data
  sensorData: ISensorData | null;
  weatherData: IWeatherData | null;
  historicalData: FormattedSensorData[];
  weeklyData: FormattedSensorData[];
  monthlyData: MonthlyData[];
  availableMonths: MonthOption[];
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  
  // Error handling
  error: string | null;
  retryCount: number;
  
  // Status
  lastUpdated: Date | null;
  dataInitialized: boolean;
  
  // Methods
  loadInitialData: () => Promise<void>;
  refreshLiveData: () => Promise<void>;
  retryLoad: () => Promise<void>;
  getInitialMonth: () => string;
}

export const useDashboardData = (): UseDashboardDataReturn => {
  // Core data states
  const [sensorData, setSensorData] = useState<ISensorData | null>(null);
  const [weatherData, setWeatherData] = useState<IWeatherData | null>(null);
  const [historicalData, setHistoricalData] = useState<FormattedSensorData[]>([]);
  const [weeklyData, setWeeklyData] = useState<FormattedSensorData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [availableMonths, setAvailableMonths] = useState<MonthOption[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Error handling
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Status
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataInitialized, setDataInitialized] = useState(false);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRetryCount(0);

    try {
      // Fetch sensor data
      const sensors = await fetchSensorData();
      
      if (sensors.length === 0) {
        throw new Error('No sensor data available');
      }

      // Process historical data
      const formattedData = processHistoricalData(sensors);
      setHistoricalData(formattedData);
      
      const monthsList = processMonthOptions(formattedData);
      setAvailableMonths(monthsList);
      
      // For now, use the same data for weekly and monthly
      setWeeklyData(formattedData);
      setMonthlyData([]); // Empty for now

      // Set current sensor data from latest reading
      const latest = sensors[sensors.length - 1];
      setSensorData({
        moisture1: latest.sensor1 || 0,
        moisture2: latest.sensor2 || 0,
        temperature: latest.temperature ?? 25,
        humidity: latest.humidity ?? 60,
      });

      // Fetch weather data
      try {
        const weather = await fetchWeatherData();
        setWeatherData(weather);
      } catch (weatherError) {
        console.warn('Weather data failed, using defaults');
        setWeatherData({
          temperature: 25,
          feelsLike: 27,
          humidity: 60,
          condition: 'Unknown',
          location: 'Unknown',
          windSpeed: 0,
          precipitation: 0
        });
      }

      setLastUpdated(new Date());
      setDataInitialized(true);
      setError(null);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh live data
  const refreshLiveData = useCallback(async () => {
    if (!dataInitialized) return;
    
    setIsRefreshing(true);
    try {
      // Refresh weather data
      const weather = await fetchWeatherData();
      setWeatherData(weather);

      // Refresh sensor data
      const sensors = await fetchSensorData();
      if (sensors.length > 0) {
        const latest = sensors[sensors.length - 1];
        setSensorData(prev => ({
          moisture1: latest.sensor1 || prev?.moisture1 || 0,
          moisture2: latest.sensor2 || prev?.moisture2 || 0,
          temperature: latest.temperature ?? weather.temperature,
          humidity: latest.humidity ?? weather.humidity,
        }));
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [dataInitialized]);

  // Retry load with backoff
  const retryLoad = useCallback(async () => {
    setRetryCount(prev => prev + 1);
    await loadInitialData();
  }, [loadInitialData]);

  // Get initial month
  const getInitialMonth = useCallback(() => {
    return getCurrentMonthKey();
  }, []);

  // Load data on mount
  useEffect(() => {
    loadInitialData();
    
    // Set up refresh interval
    const interval = setInterval(refreshLiveData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [loadInitialData, refreshLiveData]);

  return {
    // Core data
    sensorData,
    weatherData,
    historicalData,
    weeklyData,
    monthlyData,
    availableMonths,
    
    // Loading states
    isLoading,
    isRefreshing,
    
    // Error handling
    error,
    retryCount,
    
    // Status
    lastUpdated,
    dataInitialized,
    
    // Methods
    loadInitialData,
    refreshLiveData,
    retryLoad,
    getInitialMonth,
  };
};