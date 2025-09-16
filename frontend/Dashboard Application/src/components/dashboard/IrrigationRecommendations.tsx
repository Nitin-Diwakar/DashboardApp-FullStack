// src/components/dashboard/IrrigationRecommendations.tsx - AI-Driven Irrigation Insights
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Droplets, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Zap,
  Target,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Gauge
} from 'lucide-react';
import { ISensorData, IWeatherData } from '@/types/sensors';
import { useSettings } from '@/contexts/SettingsContext';

interface IrrigationRecommendationsProps {
  sensorData: ISensorData;
  weatherData: IWeatherData;
  isIrrigationActive: boolean;
}

export const IrrigationRecommendations: React.FC<IrrigationRecommendationsProps> = ({
  sensorData,
  weatherData,
  isIrrigationActive,
}) => {
  const { moistureSettings, irrigationSettings } = useSettings();

  // AI-driven recommendation engine
  const generateRecommendations = () => {
    const recommendations = [];
    const avgMoisture = (sensorData.moisture1 + sensorData.moisture2) / 2;
    const avgThreshold = (moistureSettings.sensor1.irrigationThreshold + moistureSettings.sensor2.irrigationThreshold) / 2;
    
    // Primary irrigation decision
    if (isIrrigationActive) {
      recommendations.push({
        type: 'active',
        priority: 'high',
        icon: Droplets,
        title: 'Irrigation Currently Active',
        description: `System is watering for ${irrigationSettings.duration} minutes based on ${irrigationSettings.sensorPriority} sensor priority.`,
        action: 'Monitor soil response and adjust if needed',
        confidence: 95,
        reasoning: 'Moisture levels triggered automatic irrigation'
      });
    } else if (weatherData.precipitation > 0.5) {
      recommendations.push({
        type: 'skip',
        priority: 'high',
        icon: CheckCircle,
        title: 'Skip Irrigation - Rain Expected',
        description: `${weatherData.precipitation}mm of rain expected. Natural watering will occur.`,
        action: 'Monitor soil moisture post-rain',
        confidence: 90,
        reasoning: 'Weather forecast indicates sufficient natural watering'
      });
    } else if (avgMoisture < avgThreshold) {
      const urgency = avgMoisture < avgThreshold - 10 ? 'immediately' : 'within 2 hours';
      recommendations.push({
        type: 'irrigate',
        priority: 'high',
        icon: AlertTriangle,
        title: 'Irrigation Recommended',
        description: `Soil moisture (${avgMoisture.toFixed(1)}%) below optimal. Start irrigation ${urgency}.`,
        action: 'Begin irrigation cycle',
        confidence: 85,
        reasoning: 'Moisture levels below irrigation threshold'
      });
    } else {
      recommendations.push({
        type: 'monitor',
        priority: 'medium',
        icon: Target,
        title: 'Continue Monitoring',
        description: `Soil moisture adequate (${avgMoisture.toFixed(1)}%). Next check in 30 minutes.`,
        action: 'Maintain current schedule',
        confidence: 80,
        reasoning: 'Moisture levels within acceptable range'
      });
    }

    // Weather-based recommendations
    if (weatherData.temperature > 35) {
      recommendations.push({
        type: 'adjust',
        priority: 'medium',
        icon: Gauge,
        title: 'Heat Stress Mitigation',
        description: `Extreme heat (${weatherData.temperature}°C) detected. Consider increasing irrigation frequency.`,
        action: 'Increase watering by 20-30%',
        confidence: 75,
        reasoning: 'High temperatures increase evapotranspiration rates'
      });
    }

    if (weatherData.humidity < 40 && weatherData.windSpeed > 15) {
      recommendations.push({
        type: 'adjust',
        priority: 'medium',
        icon: Zap,
        title: 'High Evaporation Conditions',
        description: `Low humidity (${weatherData.humidity}%) and wind (${weatherData.windSpeed} km/h) increase water loss.`,
        action: 'Consider early morning irrigation',
        confidence: 70,
        reasoning: 'Environmental conditions promote rapid moisture loss'
      });
    }

    // Efficiency recommendations
    if (!isIrrigationActive && avgMoisture > avgThreshold + 15) {
      recommendations.push({
        type: 'optimize',
        priority: 'low',
        icon: Lightbulb,
        title: 'Water Conservation Opportunity',
        description: `Soil moisture high (${avgMoisture.toFixed(1)}%). Consider reducing next irrigation duration.`,
        action: 'Reduce next cycle by 20%',
        confidence: 65,
        reasoning: 'Current moisture levels allow for water conservation'
      });
    }

    return recommendations;
  };

  // Smart scheduling suggestions
  const getSchedulingSuggestions = () => {
    const suggestions = [];
    // const currentHour = new Date().getHours();
    
    // Optimal timing based on weather
    if (weatherData.temperature > 25) {
      suggestions.push({
        time: 'Early Morning (5-7 AM)',
        reason: 'Lower evaporation rates',
        benefit: 'Reduces water loss by 30-40%'
      });
      suggestions.push({
        time: 'Evening (6-8 PM)',
        reason: 'Cool temperatures',
        benefit: 'Better water absorption'
      });
    } else {
      suggestions.push({
        time: 'Mid-Morning (8-10 AM)',
        reason: 'Optimal temperature',
        benefit: 'Good absorption with low evaporation'
      });
    }

    // Avoid midday if hot
    if (weatherData.temperature > 30) {
      suggestions.push({
        time: 'Avoid Midday (11 AM - 3 PM)',
        reason: 'High evaporation',
        benefit: 'Prevents water waste'
      });
    }

    return suggestions;
  };

  // Water efficiency metrics
  const calculateEfficiencyMetrics = () => {
    const avgMoisture = (sensorData.moisture1 + sensorData.moisture2) / 2;
    const targetMoisture = (moistureSettings.sensor1.optimalMin + moistureSettings.sensor1.optimalMax) / 2;
    
    const efficiency = Math.min(100, Math.max(0, 100 - Math.abs(avgMoisture - targetMoisture) * 2));
    
    return {
      efficiency: Math.round(efficiency),
      waterSavings: efficiency > 80 ? 'High' : efficiency > 60 ? 'Medium' : 'Low',
      recommendation: efficiency > 80 ? 'Excellent water management' : 
                     efficiency > 60 ? 'Good efficiency, minor improvements possible' : 
                     'Optimization opportunities available'
    };
  };

  const recommendations = generateRecommendations();
  const schedulingSuggestions = getSchedulingSuggestions();
  const efficiencyMetrics = calculateEfficiencyMetrics();

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-blue-600" />
          <span>Smart Irrigation Recommendations</span>
          <Badge variant="secondary" className="ml-auto">
            AI-Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Primary Recommendations */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Target className="h-4 w-4 mr-2" />
            Immediate Actions
          </h4>
          
          {recommendations.map((rec, index) => {
            const IconComponent = rec.icon;
            return (
              <Alert key={index} className={
                rec.priority === 'high' ? 'border-orange-200 bg-orange-50' :
                rec.priority === 'medium' ? 'border-blue-200 bg-blue-50' :
                'border-green-200 bg-green-50'
              }>
                <IconComponent className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-sm">{rec.title}</h5>
                        <p className="text-sm mt-1">{rec.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {rec.confidence}% confident
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">
                        💡 {rec.reasoning}
                      </span>
                      <Button size="sm" variant="outline" className="text-xs">
                        {rec.action}
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            );
          })}
        </div>

        {/* Optimal Timing Suggestions */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Optimal Irrigation Timing
          </h4>
          
          <div className="grid gap-3">
            {schedulingSuggestions.map((suggestion, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{suggestion.time}</div>
                  <div className="text-xs text-gray-600">{suggestion.reason}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-green-600 font-medium">{suggestion.benefit}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Water Efficiency Dashboard */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Water Efficiency Score
          </h4>
          
          <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Efficiency</span>
              <Badge className={`${
                efficiencyMetrics.efficiency >= 80 ? 'bg-green-600' :
                efficiencyMetrics.efficiency >= 60 ? 'bg-yellow-600' : 'bg-red-600'
              } text-white`}>
                {efficiencyMetrics.efficiency}%
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Water Savings:</span>
                <span className="font-medium">{efficiencyMetrics.waterSavings}</span>
              </div>
              <p className="text-sm text-gray-700">{efficiencyMetrics.recommendation}</p>
            </div>
          </div>
        </div>

        {/* Quick Decision Helper */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-3 flex items-center">
            <Lightbulb className="h-4 w-4 mr-2" />
            Quick Decision Helper
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-blue-800">Should I irrigate now?</h5>
              <div className="flex items-center space-x-2">
                {isIrrigationActive || (sensorData.moisture1 + sensorData.moisture2) / 2 < (moistureSettings.sensor1.irrigationThreshold + moistureSettings.sensor2.irrigationThreshold) / 2 ? (
                  <>
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">Yes - Soil needs water</span>
                  </>
                ) : weatherData.precipitation > 0.5 ? (
                  <>
                    <ThumbsDown className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700">No - Rain expected</span>
                  </>
                ) : (
                  <>
                    <ThumbsDown className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">No - Soil adequate</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-blue-800">Next check in:</h5>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700">
                  {isIrrigationActive ? '30 minutes (post-irrigation)' : 
                   weatherData.precipitation > 0 ? '2-4 hours (after rain)' : 
                   '30 minutes (regular monitoring)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};