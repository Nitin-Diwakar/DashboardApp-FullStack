// src/components/dashboard/SensorHistoryChart.tsx - Enhanced with Suspense Support
import React, { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LineChartWithTabs } from '@/components/charts/LineChartWithTabs';
import { 
  FormattedSensorData, 
  MonthlyData, 
  MonthOption, 
  DayOption, 
  WeekOption 
} from '@/types/dashboard';
import { BarChart3, TrendingUp } from 'lucide-react';

interface SensorHistoryChartProps {
  // Data
  filteredDayData: FormattedSensorData[];
  filteredWeeklyData: FormattedSensorData[];
  monthlyData: MonthlyData[];
  
  // Selections
  selectedMonth: string;
  selectedDay: string;
  selectedWeek: string;
  
  // Options
  availableMonths: MonthOption[];
  availableDays: DayOption[];
  availableWeeks: WeekOption[];
  
  // Handlers
  setSelectedMonth: (value: string) => void;
  setSelectedDay: (value: string) => void;
  setSelectedWeek: (value: string) => void;
}

// Chart Loading Skeleton
const ChartSkeleton = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-10 w-40" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);

// Error Boundary for Charts
const ChartErrorFallback = () => (
  <Card className="md:col-span-4">
    <CardContent className="p-6">
      <div className="flex items-center justify-center h-64 text-center">
        <div className="space-y-2">
          <BarChart3 className="h-8 w-8 mx-auto text-gray-400" />
          <p className="text-sm text-gray-500">Unable to load chart data</p>
          <p className="text-xs text-gray-400">Please check your connection and try again</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const SensorHistoryChart: React.FC<SensorHistoryChartProps> = ({
  filteredDayData,
  filteredWeeklyData,
  monthlyData,
  selectedMonth,
  selectedDay,
  selectedWeek,
  availableMonths,
  availableDays,
  availableWeeks,
  setSelectedMonth,
  setSelectedDay,
  setSelectedWeek,
}) => {
  // Calculate data insights
  const getDataInsights = () => {
    const totalDataPoints = filteredDayData.length + filteredWeeklyData.length + monthlyData.length;
    const hasData = totalDataPoints > 0;
    
    if (!hasData) {
      return {
        status: 'No Data',
        message: 'No historical data available',
        color: 'text-gray-500'
      };
    }
    
    const recentData = filteredDayData.slice(-24); // Last 24 hours
    if (recentData.length > 0) {
      const avgMoisture = recentData.reduce((sum, d) => sum + (d.moisture1 + d.moisture2) / 2, 0) / recentData.length;
      
      if (avgMoisture > 60) {
        return {
          status: 'Good Trends',
          message: `Healthy moisture levels (${avgMoisture.toFixed(1)}% avg)`,
          color: 'text-green-600'
        };
      } else if (avgMoisture > 40) {
        return {
          status: 'Moderate Levels',
          message: `Adequate moisture (${avgMoisture.toFixed(1)}% avg)`,
          color: 'text-blue-600'
        };
      } else {
        return {
          status: 'Low Moisture',
          message: `Below optimal (${avgMoisture.toFixed(1)}% avg)`,
          color: 'text-orange-600'
        };
      }
    }
    
    return {
      status: 'Data Available',
      message: `${totalDataPoints} data points`,
      color: 'text-blue-600'
    };
  };

  const dataInsights = getDataInsights();

  try {
    return (
      <Card className="md:col-span-4 border-l-4 border-l-green-500">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span>Moisture History & Trends</span>
            </CardTitle>
            
            <div className="flex items-center space-x-3">
              {/* Data Insights Badge */}
              <div className="flex items-center space-x-1 text-sm">
                <TrendingUp className={`h-4 w-4 ${dataInsights.color}`} />
                <span className={`font-medium ${dataInsights.color}`}>
                  {dataInsights.status}
                </span>
              </div>
              
              {/* Month Selector */}
              <Select 
                value={selectedMonth} 
                onValueChange={setSelectedMonth}
                disabled={availableMonths.length === 0}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map((month) => (
                    <SelectItem key={month.id} value={month.id}>
                      {month.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data Insights */}
          <div className="text-sm text-gray-600 mb-4">
            <p>{dataInsights.message}</p>
            {filteredDayData.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Last update: {new Date(filteredDayData[filteredDayData.length - 1]?.timestamp).toLocaleTimeString()}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Suspense fallback={<ChartSkeleton />}>
            <LineChartWithTabs
              filteredDayData={filteredDayData}
              filteredWeeklyData={filteredWeeklyData}
              monthlyData={monthlyData}
              selectedDay={selectedDay}
              selectedWeek={selectedWeek}
              selectedMonth={selectedMonth}
              availableDays={availableDays}
              availableWeeks={availableWeeks}
              setSelectedDay={setSelectedDay}
              setSelectedWeek={setSelectedWeek}
            />
          </Suspense>
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('Error rendering SensorHistoryChart:', error);
    return <ChartErrorFallback />;
  }
};