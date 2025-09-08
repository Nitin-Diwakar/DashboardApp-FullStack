// src/components/dashboard/SoilConditionAnalysis.tsx - Advanced Soil Analysis
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Droplets, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Clock,
  Target
} from 'lucide-react';
import { ISensorData, FormattedSensorData } from '@/types/sensors';
import { useSettings } from '@/contexts/SettingsContext';

interface SoilConditionAnalysisProps {
  sensorData: ISensorData;
  historicalData: FormattedSensorData[]; // Last 24 hours
}

export const SoilConditionAnalysis: React.FC<SoilConditionAnalysisProps> = ({
  sensorData,
  historicalData,
}) => {
  const { moistureSettings } = useSettings();

  // Calculate moisture trends
  const calculateTrends = () => {
    if (historicalData.length < 2) return { sensor1: 'stable', sensor2: 'stable' };
    
    const recent = historicalData.slice(-6); // Last 6 readings
    const older = historicalData.slice(-12, -6); // Previous 6 readings
    
    const avgRecent1 = recent.reduce((sum, d) => sum + d.moisture1, 0) / recent.length;
    const avgOlder1 = older.length > 0 ? older.reduce((sum, d) => sum + d.moisture1, 0) / older.length : avgRecent1;
    
    const avgRecent2 = recent.reduce((sum, d) => sum + d.moisture2, 0) / recent.length;
    const avgOlder2 = older.length > 0 ? older.reduce((sum, d) => sum + d.moisture2, 0) / older.length : avgRecent2;
    
    const trend1 = avgRecent1 > avgOlder1 + 2 ? 'increasing' : 
                   avgRecent1 < avgOlder1 - 2 ? 'decreasing' : 'stable';
    const trend2 = avgRecent2 > avgOlder2 + 2 ? 'increasing' : 
                   avgRecent2 < avgOlder2 - 2 ? 'decreasing' : 'stable';
    
    return { 
      sensor1: trend1, 
      sensor2: trend2,
      change1: avgRecent1 - avgOlder1,
      change2: avgRecent2 - avgOlder2
    };
  };

  // Soil health assessment
  const assessSoilHealth = () => {
    const sensor1Health = getSensorHealth(sensorData.moisture1, 'sensor1');
    const sensor2Health = getSensorHealth(sensorData.moisture2, 'sensor2');
    
    return {
      sensor1: sensor1Health,
      sensor2: sensor2Health,
      overall: Math.round((sensor1Health.score + sensor2Health.score) / 2)
    };
  };

  const getSensorHealth = (moisture: number, sensorType: 'sensor1' | 'sensor2') => {
    const settings = moistureSettings[sensorType];
    
    if (moisture >= settings.optimalMin && moisture <= settings.optimalMax) {
      return { 
        status: 'Optimal', 
        score: 100, 
        color: 'text-green-600', 
        bgColor: 'bg-green-50',
        description: 'Perfect moisture level for healthy growth'
      };
    } else if (moisture >= settings.irrigationThreshold) {
      return { 
        status: 'Good', 
        score: 80, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50',
        description: 'Adequate moisture, monitor regularly'
      };
    } else if (moisture >= settings.alertThreshold) {
      return { 
        status: 'Dry', 
        score: 60, 
        color: 'text-orange-600', 
        bgColor: 'bg-orange-50',
        description: 'Below optimal, irrigation recommended'
      };
    } else {
      return { 
        status: 'Critical', 
        score: 30, 
        color: 'text-red-600', 
        bgColor: 'bg-red-50',
        description: 'Critically low, immediate irrigation needed'
      };
    }
  };

  // Estimate time to irrigation threshold
  const estimateTimeToThreshold = () => {
    if (historicalData.length < 3) return null;
    
    const recent = historicalData.slice(-6);
    const rates = [];
    
    // Calculate moisture decrease rate per hour
    for (let i = 1; i < recent.length; i++) {
      const hoursDiff = (new Date(recent[i].timestamp).getTime() - new Date(recent[i-1].timestamp).getTime()) / (1000 * 60 * 60);
      if (hoursDiff > 0) {
        rates.push({
          sensor1: (recent[i-1].moisture1 - recent[i].moisture1) / hoursDiff,
          sensor2: (recent[i-1].moisture2 - recent[i].moisture2) / hoursDiff
        });
      }
    }
    
    if (rates.length === 0) return null;
    
    const avgRate1 = rates.reduce((sum, r) => sum + r.sensor1, 0) / rates.length;
    const avgRate2 = rates.reduce((sum, r) => sum + r.sensor2, 0) / rates.length;
    
    const timeToThreshold1 = avgRate1 > 0 ? 
      (sensorData.moisture1 - moistureSettings.sensor1.irrigationThreshold) / avgRate1 : null;
    const timeToThreshold2 = avgRate2 > 0 ? 
      (sensorData.moisture2 - moistureSettings.sensor2.irrigationThreshold) / avgRate2 : null;
    
    return {
      sensor1: timeToThreshold1 && timeToThreshold1 > 0 ? Math.round(timeToThreshold1) : null,
      sensor2: timeToThreshold2 && timeToThreshold2 > 0 ? Math.round(timeToThreshold2) : null
    };
  };

  // Soil uniformity analysis
  const analyzeSoilUniformity = () => {
    const difference = Math.abs(sensorData.moisture1 - sensorData.moisture2);
    
    if (difference <= 5) {
      return {
        status: 'Uniform',
        color: 'text-green-600',
        description: 'Moisture distribution is even across the field',
        recommendation: 'Continue current irrigation pattern'
      };
    } else if (difference <= 10) {
      return {
        status: 'Moderate Variation',
        color: 'text-yellow-600',
        description: 'Some variation in moisture levels detected',
        recommendation: 'Monitor and consider adjusting irrigation zones'
      };
    } else {
      return {
        status: 'High Variation',
        color: 'text-red-600',
        description: 'Significant moisture variation detected',
        recommendation: 'Check irrigation coverage and soil conditions'
      };
    }
  };

  const trends = calculateTrends();
  const soilHealth = assessSoilHealth();
  const timeToThreshold = estimateTimeToThreshold();
  const uniformity = analyzeSoilUniformity();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          <span>Soil Condition Analysis</span>
          <Badge className={`ml-auto ${soilHealth.overall >= 80 ? 'bg-green-600' : soilHealth.overall >= 60 ? 'bg-yellow-600' : 'bg-red-600'} text-white`}>
            {soilHealth.overall}/100
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Sensor Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sensor 1 */}
          <div className={`p-4 rounded-lg border ${soilHealth.sensor1.bgColor}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Sensor 1 (Deep)</span>
              </div>
              <Badge className={soilHealth.sensor1.color} variant="outline">
                {soilHealth.sensor1.status}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Current Level</span>
                <span className="font-medium">{sensorData.moisture1.toFixed(1)}%</span>
              </div>
              <Progress value={sensorData.moisture1} className="h-2" />
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Trend</span>
                <div className="flex items-center space-x-1">
                  {trends.sensor1 === 'increasing' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : trends.sensor1 === 'decreasing' ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : (
                    <Activity className="h-4 w-4 text-gray-500" />
                  )}
                  <span className={`${
                    trends.sensor1 === 'increasing' ? 'text-green-600' :
                    trends.sensor1 === 'decreasing' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {trends.change1 !== undefined ? 
                      `${trends.change1 > 0 ? '+' : ''}${trends.change1.toFixed(1)}%` : 
                      trends.sensor1
                    }
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-gray-600 mt-2">
                {soilHealth.sensor1.description}
              </p>
            </div>
          </div>

          {/* Sensor 2 */}
          <div className={`p-4 rounded-lg border ${soilHealth.sensor2.bgColor}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-green-500" />
                <span className="font-medium">Sensor 2 (Root Zone)</span>
              </div>
              <Badge className={soilHealth.sensor2.color} variant="outline">
                {soilHealth.sensor2.status}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Current Level</span>
                <span className="font-medium">{sensorData.moisture2.toFixed(1)}%</span>
              </div>
              <Progress value={sensorData.moisture2} className="h-2" />
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Trend</span>
                <div className="flex items-center space-x-1">
                  {trends.sensor2 === 'increasing' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : trends.sensor2 === 'decreasing' ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : (
                    <Activity className="h-4 w-4 text-gray-500" />
                  )}
                  <span className={`${
                    trends.sensor2 === 'increasing' ? 'text-green-600' :
                    trends.sensor2 === 'decreasing' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {trends.change2 !== undefined ? 
                      `${trends.change2 > 0 ? '+' : ''}${trends.change2.toFixed(1)}%` : 
                      trends.sensor2
                    }
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-gray-600 mt-2">
                {soilHealth.sensor2.description}
              </p>
            </div>
          </div>
        </div>

        {/* Time to Irrigation Threshold */}
        {timeToThreshold && (timeToThreshold.sensor1 || timeToThreshold.sensor2) && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Irrigation Timing Prediction</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {timeToThreshold.sensor1 && (
                <div>
                  <span className="text-gray-600">Sensor 1: </span>
                  <span className="font-medium">
                    {timeToThreshold.sensor1} hours to irrigation threshold
                  </span>
                </div>
              )}
              {timeToThreshold.sensor2 && (
                <div>
                  <span className="text-gray-600">Sensor 2: </span>
                  <span className="font-medium">
                    {timeToThreshold.sensor2} hours to irrigation threshold
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Soil Uniformity */}
        <div className="p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Moisture Uniformity</span>
            </div>
            <Badge className={uniformity.color} variant="outline">
              {uniformity.status}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Sensor Difference:</span>
              <span className="font-medium">
                {Math.abs(sensorData.moisture1 - sensorData.moisture2).toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-gray-700">{uniformity.description}</p>
            <p className="text-xs text-blue-600">💡 {uniformity.recommendation}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-6 w-6 mx-auto text-green-600 mb-1" />
            <div className="text-sm font-medium text-green-900">Optimal Range</div>
            <div className="text-xs text-green-700">
              {moistureSettings.sensor1.optimalMin}-{moistureSettings.sensor1.optimalMax}%
            </div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
            <AlertTriangle className="h-6 w-6 mx-auto text-orange-600 mb-1" />
            <div className="text-sm font-medium text-orange-900">Irrigation Threshold</div>
            <div className="text-xs text-orange-700">
              S1: {moistureSettings.sensor1.irrigationThreshold}% | S2: {moistureSettings.sensor2.irrigationThreshold}%
            </div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle className="h-6 w-6 mx-auto text-red-600 mb-1" />
            <div className="text-sm font-medium text-red-900">Critical Alert</div>
            <div className="text-xs text-red-700">
              S1: {moistureSettings.sensor1.alertThreshold}% | S2: {moistureSettings.sensor2.alertThreshold}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};