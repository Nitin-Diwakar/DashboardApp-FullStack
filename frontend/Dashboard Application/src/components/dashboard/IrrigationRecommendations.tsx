import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface IrrigationRecommendationsProps {
  sensorData?: any;
  weatherData?: any;
  userPreferences?: any;
}

export const IrrigationRecommendations: React.FC<IrrigationRecommendationsProps> = ({
  sensorData,
  weatherData,
  userPreferences
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Irrigation Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="p-2 bg-blue-50 rounded text-sm">
            💡 Smart recommendations based on your sensor data and weather conditions
          </div>
          <div className="text-sm text-muted-foreground">
            Personalized irrigation suggestions coming soon
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
