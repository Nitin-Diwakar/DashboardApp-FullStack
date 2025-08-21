// src/components/dashboard/SensorCards.tsx - Enhanced Farmer-Focused Sensor Cards
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DropletIcon, 
  ThermometerIcon, 
  CloudIcon, 
  TrendingUpIcon,
  TrendingDownIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  WindIcon,
  SunIcon,
  CloudRainIcon
} from 'lucide-react';
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
    
    if (value < settings.alertThreshold) {
      return {
        status: 'Critical',
        color: 'text-red-600',
        icon: AlertTriangleIcon,
        bgColor: 'bg-red-50',
        message: 'Immediate irrigation needed',
        actionable: 'Start irrigation now'
      };
    } else if (value < threshold) {
      return {
        status: 'Low',
        color: 'text-orange-600', 
        icon: TrendingDownIcon,
        bgColor: 'bg-orange-50',
        message: 'Below irrigation threshold',
        actionable: 'Schedule irrigation soon'
      };
    } else if (value >= settings.optimalMin && value <= settings.optimalMax) {
      return {
        status: 'Optimal',
        color: 'text-green-600',
        icon: CheckCircleIcon,
        bgColor: 'bg-green-50',
        message: `Perfect range (${settings.optimalMin}%-${settings.optimalMax}%)`,
        actionable: 'Continue monitoring'
      };
    } else {
      return {
        status: 'Good',
        color: 'text-blue-600',
        icon: TrendingUpIcon,
        bgColor: 'bg-blue-50',
        message: 'Above irrigation threshold',
        actionable: 'Monitor regularly'
      };
    }
  };

  const getWeatherRecommendation = () => {
    if (weatherData.precipitation > 0.5) {
      return {
        message: 'Rain expected - Skip irrigation',
        color: 'text-blue-600',
        icon: CloudRainIcon,
        actionable: 'Wait for natural watering'
      };
    } else if (weatherData.temperature > 35) {
      return {
        message: 'Extreme heat - Increase watering',
        color: 'text-red-600',
        icon: ThermometerIcon,
        actionable: 'Water early morning/evening'
      };
    } else if (weatherData.humidity > 80) {
      return {
        message: 'High humidity - Reduce watering',
        color: 'text-green-600',
        icon: DropletIcon,
        actionable: 'Monitor soil moisture closely'
      };
    } else {
      return {
        message: 'Favorable conditions',
        color: 'text-blue-600',
        icon: SunIcon,
        actionable: 'Continue normal schedule'
      };
    }
  };

  const sensor1Status = getSensorStatus(sensorData.moisture1, 'sensor1');
  const sensor2Status = getSensorStatus(sensorData.moisture2, 'sensor2');
  const weatherRec = getWeatherRecommendation();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Enhanced Soil Moisture Sensor 1 */}
      <Card className={`${isIrrigationActive && irrigationSettings.sensorPriority !== 'sensor2' ? "ring-2 ring-green-500 ring-opacity-50" : ""} ${sensor1Status.bgColor} border-l-4 border-l-blue-500`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center justify-between">
            <span>Deep Soil Sensor</span>
            {isIrrigationActive && irrigationSettings.sensorPriority !== 'sensor2' && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                {irrigationSettings.sensorPriority === 'sensor1' ? 'PRIMARY' : 'ACTIVE'}
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-xs">
            Depth: 15cm • Threshold: {IRRIGATION_THRESHOLD_S1}% • Alert: {moistureSettings.sensor1.alertThreshold}%
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SensorGauge 
            value={sensorData.moisture1} 
            min={0} 
            max={100} 
            label="%" 
            threshold={IRRIGATION_THRESHOLD_S1}
          />
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge className={`${sensor1Status.color} bg-white border`} variant="outline">
                <sensor1Status.icon className="h-3 w-3 mr-1" />
                {sensor1Status.status}
              </Badge>
              <span className="text-sm font-medium">{sensorData.moisture1.toFixed(1)}%</span>
            </div>
            
            <div className="text-xs text-gray-600">
              <p className="font-medium">{sensor1Status.message}</p>
              <p className="text-blue-600 mt-1">💡 {sensor1Status.actionable}</p>
            </div>
            
            <Progress 
              value={(sensorData.moisture1 / 100) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Soil Moisture Sensor 2 */}
      <Card className={`${isIrrigationActive && irrigationSettings.sensorPriority !== 'sensor1' ? "ring-2 ring-green-500 ring-opacity-50" : ""} ${sensor2Status.bgColor} border-l-4 border-l-green-500`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center justify-between">
            <span>Root Zone Sensor</span>
            {isIrrigationActive && irrigationSettings.sensorPriority !== 'sensor1' && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                {irrigationSettings.sensorPriority === 'sensor2' ? 'PRIMARY' : 'ACTIVE'}
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-xs">
            Depth: 5cm • Threshold: {IRRIGATION_THRESHOLD_S2}% • Alert: {moistureSettings.sensor2.alertThreshold}%
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SensorGauge 
            value={sensorData.moisture2} 
            min={0} 
            max={100} 
            label="%" 
            threshold={IRRIGATION_THRESHOLD_S2}
          />
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge className={`${sensor2Status.color} bg-white border`} variant="outline">
                <sensor2Status.icon className="h-3 w-3 mr-1" />
                {sensor2Status.status}
              </Badge>
              <span className="text-sm font-medium">{sensorData.moisture2.toFixed(1)}%</span>
            </div>
            
            <div className="text-xs text-gray-600">
              <p className="font-medium">{sensor2Status.message}</p>
              <p className="text-blue-600 mt-1">💡 {sensor2Status.actionable}</p>
            </div>
            
            <Progress 
              value={(sensorData.moisture2 / 100) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Weather Card */}
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center justify-between">
            <span>Weather Conditions</span>
            <Badge variant="outline" className="text-xs">
              {weatherData.location}
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            Current conditions and irrigation impact
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main weather display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {weatherData.precipitation > 0 ? (
                <CloudRainIcon className="h-8 w-8 text-blue-500" />
              ) : weatherData.temperature > 30 ? (
                <SunIcon className="h-8 w-8 text-yellow-500" />
              ) : (
                <CloudIcon className="h-8 w-8 text-gray-500" />
              )}
              <div>
                <p className="text-2xl font-bold">{weatherData.temperature}°C</p>
                <p className="text-sm text-muted-foreground">{weatherData.condition}</p>
              </div>
            </div>
            <Badge className={`${weatherRec.color} bg-white border`} variant="outline">
              <weatherRec.icon className="h-3 w-3 mr-1" />
              Impact
            </Badge>
          </div>

          {/* Weather metrics */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center">
                <DropletIcon className="h-3 w-3 mr-1" />
                Humidity
              </span>
              <span className="font-medium">{weatherData.humidity}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center">
                <ThermometerIcon className="h-3 w-3 mr-1" />
                Feels Like
              </span>
              <span className="font-medium">{weatherData.feelsLike}°C</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center">
                <WindIcon className="h-3 w-3 mr-1" />
                Wind
              </span>
              <span className="font-medium">{weatherData.windSpeed} km/h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center">
                <CloudRainIcon className="h-3 w-3 mr-1" />
                Rain
              </span>
              <span className="font-medium">{weatherData.precipitation || 0}mm</span>
            </div>
          </div>

          {/* Weather recommendation */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xs">
              <p className="font-medium text-blue-900">{weatherRec.message}</p>
              <p className="text-blue-700 mt-1">💡 {weatherRec.actionable}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};