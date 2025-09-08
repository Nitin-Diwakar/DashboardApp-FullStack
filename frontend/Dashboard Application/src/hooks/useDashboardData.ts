// src/hooks/useDashboardData.ts - Enhanced with Error Handling & Suspense Support
import { useState, useEffect, useRef, useCallback } from 'react';
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

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000;

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
  const dataInitialized = useRef(false);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  // Enhanced error handling with retry logic
  const handleError = useCallback((err: any, context: string) => {
    console.error(`Error in ${context}:`, err);
    
    let errorMessage = `Failed to ${context}`;
    if (err.message) {
      errorMessage += `: ${err.message}`;
    } else if (typeof err === 'string') {
      errorMessage += `: ${err}`;
    }
    
    setError(errorMessage);
  }, []);

  // Retry with exponential backoff
  const retryWithDelay = useCallback(async (
    operation: () => Promise<void>, 
    attempt: number = 0
  ): Promise<void> => {
    try {
      await operation();
    } catch (err) {
      if (attempt < MAX_RETRY_ATTEMPTS) {
        const delay = RETRY_DELAY * Math.pow(2, attempt);
        console.log(`Retrying in ${delay}ms... (attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS})`);
        
        setTimeout(() => {
          setRetryCount(attempt + 1);
          retryWithDelay(operation, attempt + 1);
        }, delay);
      } else {
        throw err;
      }
    }
  }, []);

  // Load initial data with enhanced error handling
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRetryCount(0);

    try {
      await retryWithDelay(async () => {
        // Fetch data with timeout handling
        const [sensors, weather] = await Promise.allSettled([
          Promise.race([
            fetchSensorData(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Sensor data timeout')), 15000)
            )
          ]),
          Promise.race([
            fetchWeatherData(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Weather data timeout')), 10000)
            )
          ])
        ]);

        // Handle sensor data
        if (sensors.status === 'fulfilled') {
          const sensorArray = sensors.value as any[];
          if (sensorArray.length === 0) {
            throw new Error('No sensor data available');
          }

          // Process historical data
          const formattedData = processHistoricalData(sensorArray);
          setHistoricalData(formattedData);
          
          const monthsList = processMonthOptions(formattedData);
          setAvailableMonths(monthsList);
          
          const dailyAvgData = processDailyAverageData(formattedData);
          setWeeklyData(dailyAvgData);

          const monthlyAvgData = processMonthlyAverageData(dailyAvgData);
          setMonthlyData(monthlyAvgData);

          // Set current sensor data
          const latest = sensorArray[sensorArray.length - 1];
          setSensorData({
            moisture1: latest.sensor1,
            moisture2: latest.sensor2,
            temperature: latest.temperature ?? 25, // Fallback value
            humidity: latest.humidity ?? 60, // Fallback value
          });
        } else {
          throw new Error('Failed to load sensor data');
        }

        // Handle weather data
        if (weather.status === 'fulfilled') {
          const weatherResult = weather.value as IWeatherData;
          setWeatherData(weatherResult);

          // Update sensor data with weather fallbacks if needed
          setSensorData(prev => prev ? {
            ...prev,
            temperature: prev.temperature ?? weatherResult.temperature,
            humidity: prev.humidity ?? weatherResult.humidity,
          } : null);
        } else {
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
        dataInitialized.current = true;
      });

      setError(null);
      setRetryCount(0);
    } catch (err) {
      handleError(err, 'load initial data');
    } finally {
      setIsLoading(false);
    }
  }, [retryWithDelay, handleError]);

  // Refresh live data only (faster updates)
  const refreshLiveData = useCallback(async () => {
    if (!dataInitialized.current) return;
    
    setIsRefreshing(true);
    try {
      const [weatherResult, sensorsResult] = await Promise.allSettled([
        fetchWeatherData(),
        fetchSensorData()
      ]);

      if (weatherResult.status === 'fulfilled') {
        setWeatherData(weatherResult.value);
      }

      if (sensorsResult.status === 'fulfilled') {
        const sensors = sensorsResult.value as any[];
        if (sensors.length > 0) {
          const latest = sensors[sensors.length - 1];
          setSensorData(prev => ({
            moisture1: latest.sensor1,
            moisture2: latest.sensor2,
            temperature: latest.temperature ?? prev?.temperature ?? (weatherResult.status === 'fulfilled' ? weatherResult.value.temperature : 25),
            humidity: latest.humidity ?? prev?.humidity ?? (weatherResult.status === 'fulfilled' ? weatherResult.value.humidity : 60),
          }));
        }
      }

      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.warn('Failed to refresh live data:', err);
      // Don't show error for live refresh failures
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Manual retry function
  const retryLoad = useCallback(async () => {
    setRetryCount(0);
    await loadInitialData();
  }, [loadInitialData]);

  // Get initial month selection with fallback
  const getInitialMonth = useCallback((): string => {
    const currentMonthKey = getCurrentMonthKey();
    const monthExists = availableMonths.some(m => m.id === currentMonthKey);
    
    if (monthExists) {
      return currentMonthKey;
    } else if (availableMonths.length > 0) {
      return availableMonths[availableMonths.length - 1].id;
    }
    
    return "";
  }, [availableMonths]);

  // Initial load effect
  useEffect(() => {
    loadInitialData();
    
    // Cleanup function
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [loadInitialData]);

  // Set up refresh cycle after initial load
  useEffect(() => {
    if (dataInitialized.current && !error) {
      // Clear existing interval
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
      
      // Set up new refresh cycle
      refreshInterval.current = setInterval(() => {
        refreshLiveData();
      }, 30000); // 30 seconds
      
      return () => {
        if (refreshInterval.current) {
          clearInterval(refreshInterval.current);
        }
      };
    }
  }, [refreshLiveData, error]);

  return {
    // Data
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
    dataInitialized: dataInitialized.current,
    
    // Methods
    loadInitialData,
    refreshLiveData,
    retryLoad,
    getInitialMonth,
  };
};