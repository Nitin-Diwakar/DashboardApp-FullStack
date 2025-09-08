// src/components/dashboard/WeatherInsights.tsx - Smart Weather Analysis for Farmers
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CloudRain, 
  Sun, 
  Wind, 
  Droplets, 
  Thermometer,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';
import { ISensorData, IWeatherData } from '@/types/sensors';

interface WeatherInsightsProps {
  weatherData: IWeatherData;
  sensorData: ISensorData;
}

export const WeatherInsights: React.FC<WeatherInsightsProps> = ({
  weatherData,
  sensorData,
}) => {
  
  // Weather impact analysis
  const analyzeWeatherImpact = () => {
    const insights = [];
    
    // Rain prediction impact
    if (weatherData.precipitation > 0.5) {
      insights.push({
        type: 'info',
        icon: CloudRain,
        title: 'Rain Expected',
        message: `${weatherData.precipitation}mm expected. Skip irrigation for 24-48 hours.`,
        priority: 'high',
        action: 'Delay irrigation'
      });
    }
    
    // Temperature stress
    if (weatherData.temperature > 35) {
      insights.push({
        type: 'warning',
        icon: Thermometer,
        title: 'Heat Stress Risk',
        message: `Temperature ${weatherData.temperature}°C may stress crops. Increase irrigation frequency.`,
        priority: 'high',
        action: 'Monitor closely'
      });
    } else if (weatherData.temperature < 15) {
      insights.push({
        type: 'info',
        icon: Thermometer,
        title: 'Cool Weather',
        message: `Low temperature ${weatherData.temperature}°C. Reduce irrigation frequency.`,
        priority: 'medium',
        action: 'Adjust schedule'
      });
    }
    
    // Humidity impact
    if (weatherData.humidity > 85) {
      insights.push({
        type: 'info',
        icon: Droplets,
        title: 'High Humidity',
        message: `${weatherData.humidity}% humidity may reduce water needs.`,
        priority: 'medium',
        action: 'Monitor soil moisture'
      });
    } else if (weatherData.humidity < 40) {
      insights.push({
        type: 'warning',
        icon: Droplets,
        title: 'Low Humidity',
        message: `${weatherData.humidity}% humidity increases evaporation. More water needed.`,
        priority: 'medium',
        action: 'Increase watering'
      });
    }
    
    // Wind impact
    if (weatherData.windSpeed > 20) {
      insights.push({
        type: 'warning',
        icon: Wind,
        title: 'High Wind',
        message: `${weatherData.windSpeed} km/h winds increase evaporation.`,
        priority: 'medium',
        action: 'Shield young plants'
      });
    }
    
    return insights;
  };

  // Next 24-48 hour recommendations
  const getWeatherRecommendations = () => {
    const recommendations = [];
    
    // Based on current conditions
    if (weatherData.precipitation > 0.1) {
      recommendations.push({
        timeframe: 'Next 24 hours',
        action: '🌧️ Skip irrigation - Natural watering expected',
        confidence: 'High'
      });
      recommendations.push({
        timeframe: 'Next 48 hours', 
        action: '📊 Monitor soil moisture levels post-rain',
        confidence: 'High'
      });
    } else if (weatherData.temperature > 30 && weatherData.humidity < 50) {
      recommendations.push({
        timeframe: 'Next 6 hours',
        action: '💧 Increase irrigation by 20-30%',
        confidence: 'Medium'
      });
      recommendations.push({
        timeframe: 'Next 24 hours',
        action: '🕐 Consider early morning watering (5-7 AM)',
        confidence: 'High'
      });
    } else {
      recommendations.push({
        timeframe: 'Next 24 hours',
        action: '✅ Continue normal irrigation schedule',
        confidence: 'High'
      });
    }
    
    return recommendations;
  };

  // Water conservation tips based on weather
  const getConservationTips = () => {
    const tips = [];
    
    if (weatherData.humidity > 70) {
      tips.push('💡 High humidity reduces plant water loss - reduce irrigation by 10-15%');
    }
    
    if (weatherData.temperature < 25) {
      tips.push('💡 Cool weather means less evaporation - water in early morning');
    }
    
    if (weatherData.windSpeed < 10) {
      tips.push('💡 Low wind conditions are ideal for efficient watering');
    }
    
    if (weatherData.precipitation > 0) {
      tips.push('💡 Rain expected - turn off irrigation and collect rainwater');
    }
    
    return tips;
  };

  const insights = analyzeWeatherImpact();
  const recommendations = getWeatherRecommendations();
  const conservationTips = getConservationTips();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CloudRain className="h-5 w-5 text-blue-500" />
          <span>Weather Insights</span>
          <Badge variant="outline" className="ml-auto">
            {weatherData.location}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Weather Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Thermometer className="h-6 w-6 mx-auto text-orange-500 mb-1" />
            <div className="text-lg font-bold">{weatherData.temperature}°C</div>
            <div className="text-xs text-gray-600">Temperature</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Droplets className="h-6 w-6 mx-auto text-blue-500 mb-1" />
            <div className="text-lg font-bold">{weatherData.humidity}%</div>
            <div className="text-xs text-gray-600">Humidity</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Wind className="h-6 w-6 mx-auto text-gray-500 mb-1" />
            <div className="text-lg font-bold">{weatherData.windSpeed}</div>
            <div className="text-xs text-gray-600">Wind km/h</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <CloudRain className="h-6 w-6 mx-auto text-blue-600 mb-1" />
            <div className="text-lg font-bold">{weatherData.precipitation || 0}</div>
            <div className="text-xs text-gray-600">Rain mm</div>
          </div>
        </div>

        {/* Weather Alerts & Insights */}
        {insights.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Weather Alerts</h4>
            {insights.map((insight, index) => {
              const IconComponent = insight.icon;
              return (
                <Alert key={index} className={
                  insight.type === 'warning' ? 'border-orange-200 bg-orange-50' : 
                  insight.type === 'info' ? 'border-blue-200 bg-blue-50' : 
                  'border-green-200 bg-green-50'
                }>
                  <IconComponent className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-sm">{insight.title}</strong>
                        <p className="text-sm mt-1">{insight.message}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {insight.action}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              );
            })}
          </div>
        )}

        {/* 24-48 Hour Recommendations */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Smart Recommendations
          </h4>
          <div className="space-y-2">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">{rec.timeframe}</div>
                  <div className="text-sm text-gray-600">{rec.action}</div>
                </div>
                <Badge variant={rec.confidence === 'High' ? 'default' : 'secondary'} className="text-xs">
                  {rec.confidence}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Water Conservation Tips */}
        {conservationTips.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Droplets className="h-4 w-4 mr-2 text-green-500" />
              Water Conservation Tips
            </h4>
            <div className="space-y-2">
              {conservationTips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weather Impact on Soil */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-2">
            Weather Impact Analysis
          </h4>
          <div className="text-sm text-gray-700">
            {weatherData.temperature > 30 ? (
              <p>🌡️ High temperatures increase evaporation rate. Current soil moisture: {((sensorData.moisture1 + sensorData.moisture2) / 2).toFixed(1)}% may decrease faster.</p>
            ) : weatherData.temperature < 20 ? (
              <p>❄️ Cool temperatures slow evaporation. Current irrigation schedule may be sufficient.</p>
            ) : (
              <p>🌤️ Moderate temperatures provide optimal growing conditions. Maintain current care routine.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};