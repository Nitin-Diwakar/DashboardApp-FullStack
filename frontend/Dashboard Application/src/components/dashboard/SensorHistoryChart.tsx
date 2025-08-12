// src/components/dashboard/SensorHistoryChart.tsx
import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
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
  return (
    <Card className="md:col-span-4">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>Sensor History</CardTitle>
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
      </CardHeader>
    </Card>
  );
};