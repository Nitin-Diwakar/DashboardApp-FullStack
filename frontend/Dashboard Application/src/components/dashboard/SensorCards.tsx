import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Droplets, Thermometer, Cloud } from 'lucide-react';

interface SensorCardsProps {
  sensorData?: {
    moisture1: number;
    moisture2: number;
    temperature: number;
    humidity: number;
  } | null;
  showAdvancedMetrics?: boolean;
}

export const SensorCards: React.FC<SensorCardsProps> = ({
  sensorData,
  showAdvancedMetrics = false
}) => {
  if (!sensorData) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-20 bg-muted rounded"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-20 bg-muted rounded"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-20 bg-muted rounded"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-20 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Soil Moisture 1</CardTitle>
          <Droplets className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{sensorData.moisture1.toFixed(1)}%</div>
          <Badge variant={sensorData.moisture1 > 30 ? "default" : "destructive"}>
            {sensorData.moisture1 > 30 ? "Optimal" : "Low"}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Soil Moisture 2</CardTitle>
          <Droplets className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{sensorData.moisture2.toFixed(1)}%</div>
          <Badge variant={sensorData.moisture2 > 30 ? "default" : "destructive"}>
            {sensorData.moisture2 > 30 ? "Optimal" : "Low"}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Temperature</CardTitle>
          <Thermometer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{sensorData.temperature.toFixed(1)}°C</div>
          <p className="text-xs text-muted-foreground">Current temperature</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Humidity</CardTitle>
          <Cloud className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{sensorData.humidity.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Air humidity</p>
        </CardContent>
      </Card>
    </div>
  );
};