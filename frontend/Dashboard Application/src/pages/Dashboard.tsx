// src/pages/Dashboard.tsx - Enhanced Farmer-Focused Dashboard
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useSettings } from '@/contexts/SettingsContext';
import { useDashboardData, useChartFilters } from '@/hooks';
import {
  DashboardHeader,
  SensorCards,
  SensorHistoryChart,
  IrrigationStatusCard,
  WeatherInsights,
  SoilConditionAnalysis,
  IrrigationRecommendations,
  FieldHealthOverview
} from '@/components/dashboard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Loader2 } from 'lucide-react';

// Loading Components
const DashboardSkeleton = () => (
  <div className="w-full space-y-6">
    <Skeleton className="h-16 w-full" />
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map(i => (
        <Skeleton key={i} className="h-48 w-full" />
      ))}
    </div>
    <div className="grid gap-4 md:grid-cols-7">
      <Skeleton className="h-96 md:col-span-4" />
      <Skeleton className="h-96 md:col-span-3" />
    </div>
  </div>
);

const ComponentSkeleton = ({ className = "h-32" }: { className?: string }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
      </div>
    </CardContent>
  </Card>
);

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <Alert variant="destructive">
    <AlertTriangle className="h-4 w-4" />
    <AlertDescription>
      Something went wrong loading this section. Please try refreshing the page.
      <button 
        onClick={resetErrorBoundary}
        className="ml-2 underline hover:no-underline"
      >
        Try again
      </button>
    </AlertDescription>
  </Alert>
);

const Dashboard = () => {
  // Settings context
  const { moistureSettings, irrigationSettings } = useSettings();
  
  // Data hook with error handling
  const {
    sensorData,
    weatherData,
    historicalData,
    weeklyData,
    monthlyData,
    availableMonths,
    isLoading,
    error,
    getInitialMonth,
  } = useDashboardData();

  // Chart filters hook
  const {
    selectedMonth,
    selectedWeek,
    selectedDay,
    availableWeeks,
    availableDays,
    filteredDailyData,
    filteredWeeklyData,
    filteredDayData,
    setSelectedMonth,
    setSelectedWeek,
    setSelectedDay,
  } = useChartFilters({
    historicalData,
    weeklyData,
    initialMonth: getInitialMonth(),
  });

  // Calculate irrigation status
  const calculateIrrigationStatus = () => {
    if (!sensorData) return false;
    
    const threshold_s1 = moistureSettings.sensor1.irrigationThreshold;
    const threshold_s2 = moistureSettings.sensor2.irrigationThreshold;
    
    switch (irrigationSettings.sensorPriority) {
      case 'sensor1':
        return sensorData.moisture1 < threshold_s1;
      case 'sensor2':
        return sensorData.moisture2 < threshold_s2;
      case 'both':
        return sensorData.moisture1 < threshold_s1 || sensorData.moisture2 < threshold_s2;
      default:
        return false;
    }
  };

  const isIrrigationActive = calculateIrrigationStatus();

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please check your connection and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show initial loading state
  if (isLoading || !sensorData || !weatherData) {
    return <DashboardSkeleton />;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="w-full space-y-6 p-4">
        {/* Header with real-time status */}
        <Suspense fallback={<Skeleton className="h-16 w-full" />}>
          <DashboardHeader 
            sensorData={sensorData}
            weatherData={weatherData}
            isIrrigationActive={isIrrigationActive}
          />
        </Suspense>
        
        {/* Field Health Overview - New farmer-focused component */}
        <Suspense fallback={<ComponentSkeleton className="h-24" />}>
          <FieldHealthOverview 
            sensorData={sensorData}
            weatherData={weatherData}
            isIrrigationActive={isIrrigationActive}
          />
        </Suspense>
        
        {/* Main sensor and weather cards */}
        <Suspense fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <ComponentSkeleton key={i} />)}
          </div>
        }>
          <SensorCards 
            sensorData={sensorData}
            weatherData={weatherData}
            isIrrigationActive={isIrrigationActive}
          />
        </Suspense>

        {/* Irrigation Recommendations - New AI-driven insights */}
        <Suspense fallback={<ComponentSkeleton className="h-40" />}>
          <IrrigationRecommendations 
            sensorData={sensorData}
            weatherData={weatherData}
            isIrrigationActive={isIrrigationActive}
          />
        </Suspense>

        {/* Soil Analysis and Weather Insights */}
        <div className="grid gap-4 md:grid-cols-2">
          <Suspense fallback={<ComponentSkeleton className="h-64" />}>
            <SoilConditionAnalysis 
              sensorData={sensorData}
              historicalData={historicalData.slice(-24)} // Last 24 hours
            />
          </Suspense>
          
          <Suspense fallback={<ComponentSkeleton className="h-64" />}>
            <WeatherInsights 
              weatherData={weatherData}
              sensorData={sensorData}
            />
          </Suspense>
        </div>
        
        {/* Charts and detailed irrigation status */}
        <div className="grid gap-4 md:grid-cols-7">
          <Suspense fallback={<ComponentSkeleton className="h-96 md:col-span-4" />}>
            <SensorHistoryChart 
              filteredDayData={filteredDayData}
              filteredWeeklyData={filteredWeeklyData}
              monthlyData={monthlyData}
              selectedMonth={selectedMonth}
              selectedDay={selectedDay}
              selectedWeek={selectedWeek}
              availableMonths={availableMonths}
              availableDays={availableDays}
              availableWeeks={availableWeeks}
              setSelectedMonth={setSelectedMonth}
              setSelectedDay={setSelectedDay}
              setSelectedWeek={setSelectedWeek}
            />
          </Suspense>
          
          <Suspense fallback={<ComponentSkeleton className="h-96 md:col-span-3" />}>
            <IrrigationStatusCard 
              sensorData={sensorData}
              weatherData={weatherData}
              isIrrigationActive={isIrrigationActive}
            />
          </Suspense>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;