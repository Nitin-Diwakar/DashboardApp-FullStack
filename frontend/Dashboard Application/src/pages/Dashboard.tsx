// src/pages/Dashboard.tsx - Clean Final Version
import React, { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { useDashboardData, useChartFilters } from '@/hooks';
import {
  DashboardHeader,
  SensorCards,
  SensorHistoryChart,
  IrrigationStatusCard,
} from '@/components/dashboard';

const Dashboard = () => {
  // Irrigation state
  const [isIrrigationActive, setIsIrrigationActive] = useState<boolean>(false);
  
  // Settings context
  const { moistureSettings, irrigationSettings } = useSettings();
  
  // Data hook
  const {
    sensorData,
    weatherData,
    historicalData,
    weeklyData,
    monthlyData,
    availableMonths,
    isLoading,
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

  // Irrigation logic based on sensor priority
  useEffect(() => {
    if (sensorData && sensorData.moisture1 !== undefined && sensorData.moisture2 !== undefined) {
      let shouldIrrigate = false;
      
      const threshold_s1 = moistureSettings.sensor1.irrigationThreshold;
      const threshold_s2 = moistureSettings.sensor2.irrigationThreshold;
      
      switch (irrigationSettings.sensorPriority) {
        case 'sensor1':
          shouldIrrigate = sensorData.moisture1 < threshold_s1;
          break;
        case 'sensor2':
          shouldIrrigate = sensorData.moisture2 < threshold_s2;
          break;
        case 'both':
          shouldIrrigate = sensorData.moisture1 < threshold_s1 || 
                          sensorData.moisture2 < threshold_s2;
          break;
      }
      
      setIsIrrigationActive(shouldIrrigate);
    }
  }, [
    sensorData?.moisture1, 
    sensorData?.moisture2, 
    moistureSettings.sensor1.irrigationThreshold,
    moistureSettings.sensor2.irrigationThreshold,
    irrigationSettings.sensorPriority
  ]);

  // Loading state
  if (isLoading || !sensorData || !weatherData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="w-screen-fit space-y-6">
      {/* Header with status badges */}
      <DashboardHeader 
        sensorData={sensorData}
        isIrrigationActive={isIrrigationActive}
      />
      
      {/* Sensor cards */}
      <SensorCards 
        sensorData={sensorData}
        weatherData={weatherData}
        isIrrigationActive={isIrrigationActive}
      />
      
      {/* Charts and irrigation status */}
      <div className="grid gap-4 md:grid-cols-7">
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
        
        <IrrigationStatusCard 
          sensorData={sensorData}
          isIrrigationActive={isIrrigationActive}
        />
      </div>
    </div>
  );
};

export default Dashboard;