// src/components/dashboard/SensorCards.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropletIcon, ThermometerIcon, CloudIcon } from 'lucide-react';
import { SensorGauge } from '@/components/SensorGauge';
import { ISensorData, IWeatherData } from '@/types/sensors';
import { useSettings } from '@/contexts/SettingsContext';

interface SensorCardsProps {
  sensorData: ISensorData;
  weatherData: IWeatherData;
  isIrrigationActive: boolean;
}

export const SensorCards: React.FC<SensorCardsProps> = ({
  sensorData,
  weatherData,
  isIrrigationActive,
}) => {
  const { moistureSettings, irrigationSettings } = useSettings();
  
  const IRRIGATION_THRESHOLD_S1 = moistureSettings.sensor1.irrigationThreshold;
  const IRRIGATION_THRESHOLD_S2 = moistureSettings.sensor2.irrigationThreshold;

  const getSensorStatus = (value: number, sensorType: 'sensor1' | 'sensor2') => {
    const settings = moistureSettings[sensorType];
    const threshold = sensorType === 'sensor1' ? IRRIGATION_THRESHOLD_S1 : IRRIGATION_THRESHOLD_S2;
    
    if (value < threshold) {
      return (
        <span className="text-orange-600 font-medium">
          ⚠️ Below irrigation threshold
        </span>
      );
    } else if (value >= settings.optimalMin && value <= settings.optimalMax) {
      return (
        <span className="text-green-600">
          ✓ Within optimal range ({settings.optimalMin}%-{settings.optimalMax}%)
        </span>
      );
    } else {
      return (
        <span className="text-blue-600">
          ℹ️ Above irrigation threshold
        </span>
      );
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Soil Moisture Sensor 1 */}
      <Card className={`${isIrrigationActive && irrigationSettings.sensorPriority !== 'sensor2' ? "ring-2 ring-green-500 ring-opacity-50" : ""}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Soil Moisture Sensor 1
            {isIrrigationActive && irrigationSettings.sensorPriority !== 'sensor2' && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {irrigationSettings.sensorPriority === 'sensor1' ? 'Primary Trigger' : 'Active Trigger'}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Depth Embedded • Threshold: {IRRIGATION_THRESHOLD_S1}% • Alert: {moistureSettings.sensor1.alertThreshold}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SensorGauge 
            value={sensorData.moisture1} 
            min={0} 
            max={100} 
            label="%" 
            threshold={IRRIGATION_THRESHOLD_S1}
          />
          <div className="mt-2 text-sm text-gray-600">
            {getSensorStatus(sensorData.moisture1, 'sensor1')}
          </div>
        </CardContent>
      </Card>

      {/* Soil Moisture Sensor 2 */}
      <Card className={`${isIrrigationActive && irrigationSettings.sensorPriority !== 'sensor1' ? "ring-2 ring-green-500 ring-opacity-50" : ""}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Soil Moisture Sensor 2
            {isIrrigationActive && irrigationSettings.sensorPriority !== 'sensor1' && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {irrigationSettings.sensorPriority === 'sensor2' ? 'Primary Trigger' : 'Active Trigger'}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Root Zone • Threshold: {IRRIGATION_THRESHOLD_S2}% • Alert: {moistureSettings.sensor2.alertThreshold}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SensorGauge 
            value={sensorData.moisture2} 
            min={0} 
            max={100} 
            label="%" 
            threshold={IRRIGATION_THRESHOLD_S2}
          />
          <div className="mt-2 text-sm text-gray-600">
            {getSensorStatus(sensorData.moisture2, 'sensor2')}
          </div>
        </CardContent>
      </Card>

      {/* Weather Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Current Weather</CardTitle>
          <CardDescription>{weatherData.location}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CloudIcon className="h-10 w-10 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{weatherData.temperature}°C</p>
                <p className="text-muted-foreground">{weatherData.condition}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end text-muted-foreground">
                <DropletIcon className="mr-1 h-4 w-4" />
                <span>{weatherData.humidity}%</span>
              </div>
              <div className="flex items-center justify-end text-muted-foreground mt-1">
                <ThermometerIcon className="mr-1 h-4 w-4" />
                <span>{weatherData.feelsLike}°C feels like</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};