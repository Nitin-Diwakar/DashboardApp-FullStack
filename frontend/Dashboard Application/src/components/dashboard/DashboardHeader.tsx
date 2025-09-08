// src/components/dashboard/DashboardHeader.tsx - Enhanced Farmer-Focused Header
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  PowerIcon, 
  AlertTriangleIcon, 
  CloudRainIcon, 
  SunIcon,
  DropletIcon,
  ThermometerIcon,
  Clock,
  TrendingUpIcon,
  TrendingDownIcon
} from 'lucide-react';
import { ISensorData, IWeatherData } from '@/types/sensors';
import { useSettings } from '@/contexts/SettingsContext';
import { formatDateIndia } from '@/utils/dateHelpers';

interface DashboardHeaderProps {
  sensorData: ISensorData;
  weatherData: IWeatherData;
  isIrrigationActive: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  sensorData,
  weatherData,
  isIrrigationActive,
}) => {
  const { moistureSettings, irrigationSettings } = useSettings();
  
  const IRRIGATION_THRESHOLD_S1 = moistureSettings.sensor1.irrigationThreshold;
  const IRRIGATION_THRESHOLD_S2 = moistureSettings.sensor2.irrigationThreshold;
  const LOW_MOISTURE_THRESHOLD_S1 = moistureSettings.sensor1.alertThreshold;
  const LOW_MOISTURE_THRESHOLD_S2 = moistureSettings.sensor2.alertThreshold;

  // Calculate field status
  const getFieldStatus = () => {
    const avgMoisture = (sensorData.moisture1 + sensorData.moisture2) / 2;
    const avgThreshold = (IRRIGATION_THRESHOLD_S1 + IRRIGATION_THRESHOLD_S2) / 2;
    
    if (avgMoisture >= avgThreshold + 10) {
      return { status: 'Excellent', color: 'bg-green-600', icon: TrendingUpIcon };
    } else if (avgMoisture >= avgThreshold) {
      return { status: 'Good', color: 'bg-blue-600', icon: SunIcon };
    } else if (avgMoisture >= avgThreshold - 10) {
      return { status: 'Needs Attention', color: 'bg-yellow-600', icon: AlertTriangleIcon };
    } else {
      return { status: 'Critical', color: 'bg-red-600', icon: TrendingDownIcon };
    }
  };

  // Weather condition assessment
  const getWeatherImpact = () => {
    if (weatherData.precipitation > 0.5) {
      return { message: 'Rain expected - Irrigation may not be needed', color: 'text-blue-600' };
    } else if (weatherData.humidity > 80) {
      return { message: 'High humidity - Monitor soil moisture', color: 'text-green-600' };
    } else if (weatherData.temperature > 35) {
      return { message: 'High temperature - Increase irrigation frequency', color: 'text-orange-600' };
    } else {
      return { message: 'Normal conditions - Continue regular monitoring', color: 'text-gray-600' };
    }
  };

  const fieldStatus = getFieldStatus();
  const weatherImpact = getWeatherImpact();
  const StatusIcon = fieldStatus.icon;
  const currentTime = formatDateIndia(new Date(), {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="space-y-4">
      {/* Main Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Field Dashboard
          </h1>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <Clock className="h-4 w-4 mr-1" />
            <span>Last updated: {currentTime}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Field Status Badge */}
          <Badge className={`${fieldStatus.color} hover:${fieldStatus.color}/90 text-white py-2 px-4`}>
            <StatusIcon className="h-4 w-4 mr-2" />
            Field Status: {fieldStatus.status}
          </Badge>
          
          {/* Irrigation Status Badge */}
          <Badge 
            variant={isIrrigationActive ? "default" : "outline"} 
            className={`py-2 px-4 ${isIrrigationActive ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
          >
            <PowerIcon className={`h-4 w-4 mr-2 ${isIrrigationActive ? "text-green-100" : ""}`} />
            Irrigation {isIrrigationActive ? "Active" : "Standby"}
          </Badge>
        </div>
      </div>

      {/* Quick Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Soil Moisture Summary */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Soil Moisture</p>
                <p className="text-2xl font-bold text-gray-900">
                  {((sensorData.moisture1 + sensorData.moisture2) / 2).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">
                  Target: {((IRRIGATION_THRESHOLD_S1 + IRRIGATION_THRESHOLD_S2) / 2).toFixed(0)}%+
                </p>
              </div>
              <DropletIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Temperature Impact */}
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Temperature</p>
                <p className="text-2xl font-bold text-gray-900">{weatherData.temperature}°C</p>
                <p className="text-xs text-gray-500">
                  Feels like {weatherData.feelsLike}°C
                </p>
              </div>
              <ThermometerIcon className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        {/* Weather Condition */}
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Weather</p>
                <p className="text-lg font-bold text-gray-900">{weatherData.condition}</p>
                <p className="text-xs text-gray-500">
                  Humidity: {weatherData.humidity}%
                </p>
              </div>
              {weatherData.precipitation > 0 ? (
                <CloudRainIcon className="h-8 w-8 text-blue-500" />
              ) : (
                <SunIcon className="h-8 w-8 text-yellow-500" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Next Action */}
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Next Action</p>
              <p className="text-sm font-bold text-gray-900 mt-1">
                {isIrrigationActive ? (
                  <>🌱 Irrigating for {irrigationSettings.duration}min</>
                ) : (
                  <>⏰ Monitor in 30 min</>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {weatherImpact.message}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Banners */}
      <div className="flex flex-wrap gap-2">
        {/* Critical Alerts */}
        {sensorData.moisture1 < LOW_MOISTURE_THRESHOLD_S1 && (
          <Badge variant="destructive" className="py-2 px-4">
            <AlertTriangleIcon className="h-4 w-4 mr-2" />
            🚨 Sensor 1 Critical: {sensorData.moisture1.toFixed(1)}% (Below {LOW_MOISTURE_THRESHOLD_S1}%)
          </Badge>
        )}
        
        {sensorData.moisture2 < LOW_MOISTURE_THRESHOLD_S2 && (
          <Badge variant="destructive" className="py-2 px-4">
            <AlertTriangleIcon className="h-4 w-4 mr-2" />
            🚨 Sensor 2 Critical: {sensorData.moisture2.toFixed(1)}% (Below {LOW_MOISTURE_THRESHOLD_S2}%)
          </Badge>
        )}

        {/* Weather Alerts */}
        {weatherData.temperature > 40 && (
          <Badge variant="secondary" className="py-2 px-4 bg-red-100 text-red-800">
            🌡️ Extreme Heat Warning: {weatherData.temperature}°C
          </Badge>
        )}

        {weatherData.precipitation > 0.5 && (
          <Badge variant="secondary" className="py-2 px-4 bg-blue-100 text-blue-800">
            🌧️ Rain Expected: Skip irrigation today
          </Badge>
        )}

        {/* Active Irrigation Details */}
        {isIrrigationActive && (
          <Badge className="py-2 px-4 bg-green-100 text-green-800">
            💧 Active Irrigation: 
            {irrigationSettings.sensorPriority === 'sensor1' && ` S1=${sensorData.moisture1.toFixed(1)}% < ${IRRIGATION_THRESHOLD_S1}%`}
            {irrigationSettings.sensorPriority === 'sensor2' && ` S2=${sensorData.moisture2.toFixed(1)}% < ${IRRIGATION_THRESHOLD_S2}%`}
            {irrigationSettings.sensorPriority === 'both' && ` Multi-sensor trigger`}
          </Badge>
        )}
      </div>
    </div>
  );
};