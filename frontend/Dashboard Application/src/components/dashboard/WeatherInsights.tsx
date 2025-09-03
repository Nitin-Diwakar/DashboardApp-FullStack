import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Sun, CloudRain } from 'lucide-react';

interface WeatherInsightsProps {
  weatherData?: {
    temperature: number;
    humidity: number;
    condition: string;
    location: string;
    precipitation: number;
  } | null;
}

export const WeatherInsights: React.FC<WeatherInsightsProps> = ({
  weatherData
}) => {
  if (!weatherData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading weather data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-4 w-4" />
          Weather Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">Temperature</span>
          <span className="font-medium">{weatherData.temperature}°C</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Humidity</span>
          <span className="font-medium">{weatherData.humidity}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Condition</span>
          <span className="font-medium capitalize">{weatherData.condition}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Location</span>
          <span className="font-medium">{weatherData.location}</span>
        </div>
      </CardContent>
    </Card>
  );
};
