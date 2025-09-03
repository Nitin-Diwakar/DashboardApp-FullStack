import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface SoilConditionAnalysisProps {
  sensorData?: any;
  historicalData?: any[];
  showRecommendations?: boolean;
}

export const SoilConditionAnalysis: React.FC<SoilConditionAnalysisProps> = ({
  sensorData,
  historicalData = [],
  showRecommendations = true
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Soil Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Analysis based on {historicalData.length} data points
          </div>
          {showRecommendations && (
            <div className="p-2 bg-muted rounded text-sm">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              Detailed soil analysis coming soon
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};