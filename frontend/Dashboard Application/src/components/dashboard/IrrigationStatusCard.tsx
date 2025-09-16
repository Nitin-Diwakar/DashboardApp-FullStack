// src/components/dashboard/IrrigationStatusCard.tsx - Enhanced Irrigation Status
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Droplets, 
  Power, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Calendar,
  Timer,
  Gauge,
  Lightbulb
} from 'lucide-react';
import { ISensorData, IWeatherData } from '@/types/sensors';
import { useSettings } from '@/contexts/SettingsContext';

interface IrrigationStatusCardProps {
  sensorData: ISensorData;
  weatherData: IWeatherData;
  isIrrigationActive: boolean;
}

export const IrrigationStatusCard: React.FC<IrrigationStatusCardProps> = ({
  sensorData,
  weatherData,
  isIrrigationActive,
}) => {
  const { moistureSettings, irrigationSettings } = useSettings();
  
  const IRRIGATION_THRESHOLD_S1 = moistureSettings.sensor1.irrigationThreshold;
  const IRRIGATION_THRESHOLD_S2 = moistureSettings.sensor2.irrigationThreshold;

  // Calculate system efficiency
  const calculateSystemEfficiency = () => {
    const avgMoisture = (sensorData.moisture1 + sensorData.moisture2) / 2;
    const avgOptimal = (moistureSettings.sensor1.optimalMin + moistureSettings.sensor1.optimalMax + 
                       moistureSettings.sensor2.optimalMin + moistureSettings.sensor2.optimalMax) / 4;
    
    const efficiency = Math.max(0, Math.min(100, 100 - Math.abs(avgMoisture - avgOptimal) * 2));
    return Math.round(efficiency);
  };

  // Estimate water usage and savings
  const calculateWaterMetrics = () => {
    const baseDuration = irrigationSettings.duration;
    let adjustedDuration = baseDuration;
    
    // Weather adjustments
    if (weatherData.precipitation > 0.5) adjustedDuration = 0;
    else if (weatherData.temperature > 35) adjustedDuration *= 1.3;
    else if (weatherData.humidity > 80) adjustedDuration *= 0.8;
    
    const dailyWaterUsage = Math.round(adjustedDuration * 2.5); // Estimated liters per minute
    const weeklySavings = weatherData.precipitation > 0 ? dailyWaterUsage * 2 : 0;
    
    return {
      dailyUsage: dailyWaterUsage,
      weeklySavings,
      efficiency: calculateSystemEfficiency()
    };
  };

  // Next irrigation prediction
  const predictNextIrrigation = () => {
    if (isIrrigationActive) {
      return {
        time: `${irrigationSettings.duration} minutes remaining`,
        reason: 'Currently irrigating',
        confidence: 'High'
      };
    }
    
    const avgMoisture = (sensorData.moisture1 + sensorData.moisture2) / 2;
    const avgThreshold = (IRRIGATION_THRESHOLD_S1 + IRRIGATION_THRESHOLD_S2) / 2;
    
    if (weatherData.precipitation > 0.5) {
      return {
        time: '24-48 hours',
        reason: 'Delayed due to expected rain',
        confidence: 'Medium'
      };
    } else if (avgMoisture < avgThreshold) {
      return {
        time: 'Immediate',
        reason: 'Moisture below threshold',
        confidence: 'High'
      };
    } else if (avgMoisture < avgThreshold + 10) {
      return {
        time: '2-6 hours',
        reason: 'Approaching threshold',
        confidence: 'Medium'
      };
    } else {
      return {
        time: '12-24 hours',
        reason: 'Normal schedule',
        confidence: 'Medium'
      };
    }
  };

  const waterMetrics = calculateWaterMetrics();
  const nextIrrigation = predictNextIrrigation();
  const systemEfficiency = calculateSystemEfficiency();

  return (
    <Card className="md:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Droplets className="h-5 w-5 text-blue-600" />
            <span>Smart Irrigation System</span>
          </div>
          <Badge 
            variant={isIrrigationActive ? "default" : "outline"}
            className={`${isIrrigationActive ? "bg-green-600 text-white hover:bg-green-700" : ""} px-3 py-1`}
          >
            <Power className={`h-3 w-3 mr-1 ${isIrrigationActive ? "text-green-100" : ""}`} />
            {isIrrigationActive ? "ACTIVE" : "STANDBY"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Automated irrigation based on soil moisture and weather conditions
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border">
            <Gauge className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <div className="text-lg font-bold text-blue-900">{systemEfficiency}%</div>
            <div className="text-xs text-blue-700">System Efficiency</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg border">
            <Droplets className="h-6 w-6 mx-auto text-green-600 mb-2" />
            <div className="text-lg font-bold text-green-900">{waterMetrics.dailyUsage}L</div>
            <div className="text-xs text-green-700">Estimated Daily Usage</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg border">
            <Calendar className="h-6 w-6 mx-auto text-orange-600 mb-2" />
            <div className="text-lg font-bold text-orange-900">{waterMetrics.weeklySavings}L</div>
            <div className="text-xs text-orange-700">Weekly Water Saved</div>
          </div>
        </div>

        {/* Current Status Detailed */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Target className="h-4 w-4 mr-2" />
            Current Operation Status
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">System Mode:</span>
                <Badge variant="outline" className="text-xs">
                  {irrigationSettings.sensorPriority.toUpperCase()} Priority
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Duration Setting:</span>
                <span className="text-sm font-medium">{irrigationSettings.duration} minutes</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Re-irrigation Delay:</span>
                <span className="text-sm font-medium">{irrigationSettings.reIrrigationDelay} minutes</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Weather Integration:</span>
                <Badge variant={irrigationSettings.weatherIntegration ? "default" : "secondary"} className="text-xs">
                  {irrigationSettings.weatherIntegration ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sensor 1 Level:</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    sensorData.moisture1 < IRRIGATION_THRESHOLD_S1 ? "text-orange-600" : "text-green-600"
                  }`}>
                    {sensorData.moisture1.toFixed(1)}%
                  </span>
                  {sensorData.moisture1 < IRRIGATION_THRESHOLD_S1 ? (
                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                  ) : (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sensor 2 Level:</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    sensorData.moisture2 < IRRIGATION_THRESHOLD_S2 ? "text-orange-600" : "text-green-600"
                  }`}>
                    {sensorData.moisture2.toFixed(1)}%
                  </span>
                  {sensorData.moisture2 < IRRIGATION_THRESHOLD_S2 ? (
                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                  ) : (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Moisture:</span>
                <span className="text-sm font-medium">
                  {((sensorData.moisture1 + sensorData.moisture2) / 2).toFixed(1)}%
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Weather Impact:</span>
                <Badge variant={weatherData.precipitation > 0 ? "default" : "secondary"} className="text-xs">
                  {weatherData.precipitation > 0 ? "Rain Detected" : "Normal"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Next Irrigation Prediction */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Next Irrigation Prediction
          </h4>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Estimated Time:</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{nextIrrigation.time}</span>
                <Badge variant="outline" className="text-xs">
                  {nextIrrigation.confidence}
                </Badge>
              </div>
            </div>
            
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-600">Reason:</span>
              <span className="text-sm text-gray-800 max-w-48 text-right">{nextIrrigation.reason}</span>
            </div>
          </div>
        </div>

        {/* Current Active Status */}
        {isIrrigationActive && (
          <Alert className="border-green-200 bg-green-50">
            <Droplets className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <strong className="text-green-800">🌱 Irrigation Active</strong>
                  <Badge className="bg-green-600 text-white text-xs">
                    WATERING
                  </Badge>
                </div>
                <p className="text-sm text-green-700">
                  System is currently irrigating based on {irrigationSettings.sensorPriority} sensor priority.
                  {irrigationSettings.sensorPriority === 'sensor1' && ` Sensor 1: ${sensorData.moisture1.toFixed(1)}% < ${IRRIGATION_THRESHOLD_S1}%`}
                  {irrigationSettings.sensorPriority === 'sensor2' && ` Sensor 2: ${sensorData.moisture2.toFixed(1)}% < ${IRRIGATION_THRESHOLD_S2}%`}
                  {irrigationSettings.sensorPriority === 'both' && ` Multiple sensors triggered irrigation.`}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-green-600">Duration: {irrigationSettings.duration} minutes</span>
                  <div className="flex items-center space-x-1">
                    <Timer className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">Auto-stop when complete</span>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* System Recommendations */}
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
            <Lightbulb className="h-4 w-4 mr-2" />
            Smart Recommendations
          </h4>
          
          <div className="space-y-2 text-sm">
            {systemEfficiency < 70 && (
              <p className="text-yellow-800">
                ⚠️ Consider adjusting irrigation thresholds - current efficiency is {systemEfficiency}%
              </p>
            )}
            
            {weatherData.precipitation > 0.5 && !isIrrigationActive && (
              <p className="text-blue-800">
                🌧️ Rain expected ({weatherData.precipitation}mm) - irrigation automatically delayed
              </p>
            )}
            
            {weatherData.temperature > 35 && (
              <p className="text-red-800">
                🌡️ High temperature ({weatherData.temperature}°C) - consider increasing irrigation frequency
              </p>
            )}
            
            {systemEfficiency >= 85 && (
              <p className="text-green-800">
                ✅ Excellent irrigation efficiency! System is optimally configured.
              </p>
            )}
          </div>
        </div>

        {/* Quick Settings Reference */}
        <div className="p-3 bg-gray-50 rounded-lg border">
          <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <Settings className="h-3 w-3 mr-1" />
            Current Thresholds
          </h5>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-600">S1 Irrigation:</span>
              <span className="ml-1 font-medium text-orange-600">&lt; {IRRIGATION_THRESHOLD_S1}%</span>
            </div>
            <div>
              <span className="text-gray-600">S2 Irrigation:</span>
              <span className="ml-1 font-medium text-orange-600">&lt; {IRRIGATION_THRESHOLD_S2}%</span>
            </div>
            <div>
              <span className="text-gray-600">S1 Alert:</span>
              <span className="ml-1 font-medium text-red-600">&lt; {moistureSettings.sensor1.alertThreshold}%</span>
            </div>
            <div>
              <span className="text-gray-600">S2 Alert:</span>
              <span className="ml-1 font-medium text-red-600">&lt; {moistureSettings.sensor2.alertThreshold}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};