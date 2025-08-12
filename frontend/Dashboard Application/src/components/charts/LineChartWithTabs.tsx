// src/components/charts/LineChartWithTabs.tsx
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import { FormattedSensorData, MonthlyData, DayOption, WeekOption } from '@/types/dashboard';
import { useSettings } from '@/contexts/SettingsContext';

interface LineChartWithTabsProps {
  // Data
  filteredDayData: FormattedSensorData[];
  filteredWeeklyData: FormattedSensorData[];
  monthlyData: MonthlyData[];
  
  // Selections
  selectedDay: string;
  selectedWeek: string;
  selectedMonth: string;
  
  // Options
  availableDays: DayOption[];
  availableWeeks: WeekOption[];
  
  // Handlers
  setSelectedDay: (value: string) => void;
  setSelectedWeek: (value: string) => void;
}

export const LineChartWithTabs: React.FC<LineChartWithTabsProps> = ({
  filteredDayData,
  filteredWeeklyData,
  monthlyData,
  selectedDay,
  selectedWeek,
  selectedMonth,
  availableDays,
  availableWeeks,
  setSelectedDay,
  setSelectedWeek,
}) => {
  const { moistureSettings, irrigationSettings } = useSettings();
  
  const IRRIGATION_THRESHOLD_S1 = moistureSettings.sensor1.irrigationThreshold;
  const IRRIGATION_THRESHOLD_S2 = moistureSettings.sensor2.irrigationThreshold;

  const renderReferenceLines = () => (
    <>
      <ReferenceLine 
        y={IRRIGATION_THRESHOLD_S1} 
        stroke="#ff6b6b" 
        strokeDasharray="5 5" 
        label="S1 Threshold" 
      />
      {irrigationSettings.sensorPriority !== 'sensor1' && (
        <ReferenceLine 
          y={IRRIGATION_THRESHOLD_S2} 
          stroke="#ff9999" 
          strokeDasharray="3 3" 
          label="S2 Threshold" 
        />
      )}
    </>
  );

  const renderLines = () => (
    <>
      <Line 
        type="monotone" 
        dataKey="moisture1" 
        name="Soil Moisture Sensor 1" 
        stroke="#00C49F" 
        strokeWidth={2} 
        dot={{ r: 3 }}
        activeDot={{ r: 5 }}
      />
      <Line 
        type="monotone" 
        dataKey="moisture2" 
        name="Soil Moisture Sensor 2" 
        stroke="#FFBB28" 
        strokeWidth={2}
        dot={{ r: 3 }}
        activeDot={{ r: 5 }}
      />
    </>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center h-[300px]">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );

  return (
    <Tabs defaultValue="day" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="day">Day</TabsTrigger>
        <TabsTrigger value="week">Week</TabsTrigger>
        <TabsTrigger value="month">Month</TabsTrigger>
      </TabsList>

      {/* Day Tab */}
      <TabsContent value="day">
        <div className="flex justify-end mb-2">
          <Select 
            value={selectedDay} 
            onValueChange={setSelectedDay}
            disabled={availableDays.length === 0}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">All Days</SelectItem>
              {availableDays.map((day) => (
                <SelectItem key={day.id} value={day.id}>
                  {day.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {filteredDayData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredDayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tickFormatter={(value) => {
                  if (value && value.includes(',')) {
                    return value.split(', ')[1];
                  }
                  return value;
                }}
              />
              <YAxis 
                domain={[0, 100]} 
                label={{ value: 'Moisture %', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip />
              <Legend />
              {renderReferenceLines()}
              {renderLines()}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message="No data available for this selection" />
        )}
      </TabsContent>

      {/* Week Tab */}
      <TabsContent value="week">
        <div className="flex justify-end mb-2">
          <Select 
            value={selectedWeek} 
            onValueChange={setSelectedWeek}
            disabled={availableWeeks.length === 0}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Week" />
            </SelectTrigger>
            <SelectContent>
              {availableWeeks.map((week) => (
                <SelectItem key={week.id} value={week.id}>
                  {week.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {filteredWeeklyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredWeeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedDate" />
              <YAxis 
                domain={[0, 100]} 
                label={{ value: 'Moisture %', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip />
              <Legend />
              {renderReferenceLines()}
              {renderLines()}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message="No data available for this week" />
        )}
      </TabsContent>

      {/* Month Tab */}
      <TabsContent value="month">
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData.filter(data => {
              if (selectedMonth) {
                const [yearStr, monthStr] = selectedMonth.split('-');
                const year = parseInt(yearStr);
                const month = parseInt(monthStr);
                return data.year === year && data.month === month;
              }
              return true;
            })}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis 
                domain={[0, 100]} 
                label={{ value: 'Avg Moisture %', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip />
              <Legend />
              {renderReferenceLines()}
              <Line 
                type="monotone" 
                dataKey="moisture1" 
                name="Avg Soil Moisture Sensor 1" 
                stroke="#00C49F" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="moisture2" 
                name="Avg Soil Moisture Sensor 2" 
                stroke="#FFBB28" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message="No data available for this month" />
        )}
      </TabsContent>
    </Tabs>
  );
};