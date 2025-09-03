import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface FieldHealthOverviewProps {
  sensorData?: any;
  historicalData?: any[];
  weatherData?: any;
  showAnalytics?: boolean;
}

export const FieldHealthOverview: React.FC<FieldHealthOverviewProps> = ({
  sensorData,
  historicalData = [],
  weatherData,
  showAnalytics = true
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Field Health Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Comprehensive field analytics based on {historicalData.length} data points
          </div>
          {showAnalytics && (
            <div className="p-2 bg-green-50 rounded text-sm">
              📊 Advanced field health analytics coming soon
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};