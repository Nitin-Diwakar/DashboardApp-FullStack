// src/components/dashboard/IrrigationStatusCard.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ISensorData } from '@/types/sensors';
import { useSettings } from '@/contexts/SettingsContext';

interface IrrigationStatusCardProps {
  sensorData: ISensorData;
  isIrrigationActive: boolean;
}

export const IrrigationStatusCard: React.FC<IrrigationStatusCardProps> = ({
  sensorData,
  isIrrigationActive,
}) => {
  const { moistureSettings, irrigationSettings } = useSettings();
  
  const IRRIGATION_THRESHOLD_S1 = moistureSettings.sensor1.irrigationThreshold;
  const IRRIGATION_THRESHOLD_S2 = moistureSettings.sensor2.irrigationThreshold;
  const LOW_MOISTURE_THRESHOLD_S1 = moistureSettings.sensor1.alertThreshold;
  const LOW_MOISTURE_THRESHOLD_S2 = moistureSettings.sensor2.alertThreshold;

  const getSensorPriorityText = () => {
    switch (irrigationSettings.sensorPriority) {
      case 'both':
        return 'both sensors';
      case 'sensor1':
        return 'Soil Moisture Sensor 1';
      case 'sensor2':
        return 'Soil Moisture Sensor 2';
      default:
        return 'sensor';
    }
  };

  return (
    <Card className="md:col-span-3">
      <CardHeader>
        <CardTitle>Irrigation Status</CardTitle>
        <CardDescription>
          Smart irrigation based on {getSensorPriorityText()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Status */}
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2 text-foreground">Current Status</h4>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Irrigation System:</span>
              <Badge 
                variant={isIrrigationActive ? "default" : "outline"}
                className={isIrrigationActive ? "bg-green-600 text-white hover:bg-green-700" : ""}
              >
                {isIrrigationActive ? "ACTIVE" : "INACTIVE"}
              </Badge>
            </div>
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sensor 1 Level:</span>
                <span className={`font-medium ${sensorData.moisture1 < IRRIGATION_THRESHOLD_S1 ? "text-orange-500" : "text-green-500"}`}>
                  {sensorData.moisture1.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sensor 2 Level:</span>
                <span className={`font-medium ${sensorData.moisture2 < IRRIGATION_THRESHOLD_S2 ? "text-orange-500" : "text-green-500"}`}>
                  {sensorData.moisture2.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* System Thresholds */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium mb-2 text-foreground">System Thresholds</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sensor 1 Irrigation:</span>
                <span className="font-medium text-orange-500">&lt; {IRRIGATION_THRESHOLD_S1}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sensor 2 Irrigation:</span>
                <span className="font-medium text-orange-500">&lt; {IRRIGATION_THRESHOLD_S2}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sensor 1 Alert:</span>
                <span className="font-medium text-red-500">&lt; {LOW_MOISTURE_THRESHOLD_S1}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sensor 2 Alert:</span>
                <span className="font-medium text-red-500">&lt; {LOW_MOISTURE_THRESHOLD_S2}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sensor Priority:</span>
                <span className="font-medium text-blue-500 capitalize">{irrigationSettings.sensorPriority}</span>
              </div>
            </div>
          </div>

          {/* System Logic */}
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800">
            <h4 className="font-medium mb-2 text-foreground">Smart Logic</h4>
            <p className="text-sm text-muted-foreground">
              Irrigation automatically activates based on {irrigationSettings.sensorPriority} priority. 
              Duration: {irrigationSettings.duration} minutes. Re-irrigation delay: {irrigationSettings.reIrrigationDelay} minutes.
              {irrigationSettings.weatherIntegration && " Weather integration enabled."}
            </p>
            {isIrrigationActive && (
              <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 rounded text-sm">
                <span className="font-medium text-green-800 dark:text-green-200">
                  🌱 Currently irrigating: 
                  {irrigationSettings.sensorPriority === 'sensor1' && ` Sensor 1 at ${sensorData.moisture1.toFixed(1)}% < ${IRRIGATION_THRESHOLD_S1}%`}
                  {irrigationSettings.sensorPriority === 'sensor2' && ` Sensor 2 at ${sensorData.moisture2.toFixed(1)}% < ${IRRIGATION_THRESHOLD_S2}%`}
                  {irrigationSettings.sensorPriority === 'both' && ` Multi-sensor trigger activated`}
                </span>
              </div>
            )}
          </div>

          {/* Next Action */}
          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800">
            <h4 className="font-medium mb-2 text-foreground">Next Action</h4>
            <p className="text-sm">
              {isIrrigationActive ? (
                <span className="text-orange-600 dark:text-orange-400">
                  ⏳ System will stop irrigation in {irrigationSettings.duration} minutes or when moisture levels recover
                </span>
              ) : (
                <span className="text-green-600 dark:text-green-400">
                  ✓ System monitoring {irrigationSettings.sensorPriority} sensor(s). Next check in 30 seconds.
                </span>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};