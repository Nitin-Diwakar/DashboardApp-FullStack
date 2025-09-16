// src/components/dashboard/FieldHealthOverview.tsx - Field Health Analysis
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Leaf, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  CheckCircle,
  Droplets,
  Sun,
  Cloud
} from 'lucide-react';
import { ISensorData, IWeatherData } from '@/types/sensors';
import { useSettings } from '@/contexts/SettingsContext';

interface FieldHealthOverviewProps {
  sensorData: ISensorData;
  weatherData: IWeatherData;
  isIrrigationActive: boolean;
}

export const FieldHealthOverview: React.FC<FieldHealthOverviewProps> = ({
  sensorData,
  weatherData,
  isIrrigationActive,
}) => {
  const { moistureSettings } = useSettings();

  // Calculate overall field health score
  const calculateHealthScore = () => {
    const avgMoisture = (sensorData.moisture1 + sensorData.moisture2) / 2;
    // Calculate optimal ranges for future use
    // const optimalRange1 = moistureSettings.sensor1.optimalMax - moistureSettings.sensor1.optimalMin;
    // const optimalRange2 = moistureSettings.sensor2.optimalMax - moistureSettings.sensor2.optimalMin;
    const avgOptimalMin = (moistureSettings.sensor1.optimalMin + moistureSettings.sensor2.optimalMin) / 2;
    const avgOptimalMax = (moistureSettings.sensor1.optimalMax + moistureSettings.sensor2.optimalMax) / 2;
    
    let moistureScore = 0;
    if (avgMoisture >= avgOptimalMin && avgMoisture <= avgOptimalMax) {
      moistureScore = 100; // Perfect moisture
    } else if (avgMoisture < avgOptimalMin) {
      moistureScore = Math.max(0, (avgMoisture / avgOptimalMin) * 100);
    } else {
      moistureScore = Math.max(60, 100 - ((avgMoisture - avgOptimalMax) / 20) * 40);
    }
    
    // Temperature factor (optimal 20-30°C)
    let tempScore = 100;
    if (weatherData.temperature < 15 || weatherData.temperature > 35) {
      tempScore = Math.max(60, 100 - Math.abs(weatherData.temperature - 25) * 4);
    }
    
    // Humidity factor (optimal 50-70%)
    let humidityScore = 100;
    if (weatherData.humidity < 40 || weatherData.humidity > 80) {
      humidityScore = Math.max(70, 100 - Math.abs(weatherData.humidity - 60) * 2);
    }
    
    return Math.round((moistureScore * 0.6 + tempScore * 0.25 + humidityScore * 0.15));
  };

  // Field condition analysis
  const getFieldCondition = () => {
    const healthScore = calculateHealthScore();
    // const avgMoisture = (sensorData.moisture1 + sensorData.moisture2) / 2;
    
    if (healthScore >= 90) {
      return {
        status: 'Excellent',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: CheckCircle,
        description: 'Your field is in excellent condition! Continue current care routine.',
        actionable: 'Maintain current irrigation schedule and monitor for any changes.'
      };
    } else if (healthScore >= 75) {
      return {
        status: 'Good',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: TrendingUp,
        description: 'Field condition is good with minor optimization opportunities.',
        actionable: 'Consider adjusting irrigation timing for optimal growth.'
      };
    } else if (healthScore >= 60) {
      return {
        status: 'Attention Needed',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: AlertCircle,
        description: 'Field needs attention. Monitor closely and adjust care.',
        actionable: isIrrigationActive ? 'Irrigation is active. Monitor soil response.' : 'Consider irrigation if moisture continues to drop.'
      };
    } else {
      return {
        status: 'Critical',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: TrendingDown,
        description: 'Immediate action required to protect your crops!',
        actionable: 'Start irrigation immediately and check irrigation system.'
      };
    }
  };

  // Growth predictions based on current conditions
  const getGrowthPrediction = () => {
    const healthScore = calculateHealthScore();
    const isOptimalConditions = healthScore >= 85;
    
    if (isOptimalConditions) {
      return {
        trend: 'Optimal Growth',
        icon: TrendingUp,
        color: 'text-green-600',
        prediction: '7-10 days to next growth stage'
      };
    } else if (healthScore >= 70) {
      return {
        trend: 'Steady Growth',
        icon: Activity,
        color: 'text-blue-600',
        prediction: '10-14 days to next growth stage'
      };
    } else {
      return {
        trend: 'Slow Growth',
        icon: TrendingDown,
        color: 'text-orange-600',
        prediction: '14+ days to next growth stage'
      };
    }
  };

  const healthScore = calculateHealthScore();
  const fieldCondition = getFieldCondition();
  const growthPrediction = getGrowthPrediction();
  const ConditionIcon = fieldCondition.icon;
  const GrowthIcon = growthPrediction.icon;

  return (
    <Card className={`${fieldCondition.bgColor} ${fieldCondition.borderColor} border-2`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Leaf className="h-6 w-6 text-green-600" />
            <span>Field Health Overview</span>
          </div>
          <Badge className={`${fieldCondition.color} bg-white`}>
            <ConditionIcon className="h-4 w-4 mr-1" />
            {fieldCondition.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Health Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Health Score</span>
            <span className={`text-lg font-bold ${fieldCondition.color}`}>
              {healthScore}/100
            </span>
          </div>
          <Progress value={healthScore} className="h-3" />
          <p className="text-sm text-gray-600">{fieldCondition.description}</p>
        </div>

        {/* Current Conditions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Soil Moisture */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Soil Moisture</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Sensor 1</span>
                <span className="text-sm font-medium">{sensorData.moisture1.toFixed(1)}%</span>
              </div>
              <Progress value={sensorData.moisture1} className="h-2" />
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Sensor 2</span>
                <span className="text-sm font-medium">{sensorData.moisture2.toFixed(1)}%</span>
              </div>
              <Progress value={sensorData.moisture2} className="h-2" />
            </div>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Temperature</span>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {weatherData.temperature}°C
              </div>
              <div className="text-xs text-gray-600">
                Feels like {weatherData.feelsLike}°C
              </div>
              <div className={`text-xs ${
                weatherData.temperature >= 20 && weatherData.temperature <= 30 
                  ? 'text-green-600' 
                  : 'text-orange-600'
              }`}>
                {weatherData.temperature >= 20 && weatherData.temperature <= 30 
                  ? 'Optimal range' 
                  : weatherData.temperature < 20 
                    ? 'Below optimal' 
                    : 'Above optimal'
                }
              </div>
            </div>
          </div>

          {/* Weather Conditions */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Cloud className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Weather</span>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {weatherData.condition}
              </div>
              <div className="text-sm text-gray-600">
                Humidity: {weatherData.humidity}%
              </div>
              {weatherData.precipitation > 0 && (
                <div className="text-xs text-blue-600 mt-1">
                  Rain expected: {weatherData.precipitation}mm
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Growth Prediction */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GrowthIcon className={`h-5 w-5 ${growthPrediction.color}`} />
              <span className="font-medium">Growth Prediction</span>
            </div>
            <Badge variant="outline" className={growthPrediction.color}>
              {growthPrediction.trend}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">{growthPrediction.prediction}</p>
        </div>

        {/* Actionable Recommendations */}
        <div className={`p-4 rounded-lg border ${fieldCondition.borderColor} ${fieldCondition.bgColor}`}>
          <h4 className={`font-medium ${fieldCondition.color} mb-2`}>
            🎯 Recommended Action
          </h4>
          <p className="text-sm text-gray-700">{fieldCondition.actionable}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {((sensorData.moisture1 + sensorData.moisture2) / 2).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">Avg Moisture</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {isIrrigationActive ? 'ON' : 'OFF'}
            </div>
            <div className="text-xs text-gray-600">Irrigation</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {weatherData.windSpeed}
            </div>
            <div className="text-xs text-gray-600">Wind km/h</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};