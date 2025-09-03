import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SensorHistoryChartProps {
  data?: any[];
  selectedMonth?: string;
  onMonthChange?: (month: string) => void;
  availableMonths?: any[];
  selectedTimeframe?: string;
  onTimeframeChange?: (timeframe: string) => void;
  weeklyData?: any[];
  monthlyData?: any[];
  className?: string;
  chartType?: 'detailed' | 'overview';
}

export const SensorHistoryChart: React.FC<SensorHistoryChartProps> = ({
  data = [],
  className = ""
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Sensor Data History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p>Chart visualization coming soon</p>
            <p className="text-sm">Data points: {data.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};