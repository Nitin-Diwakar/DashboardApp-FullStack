// src/components/dashboard/DashboardHeader.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PowerIcon, AlertTriangleIcon } from 'lucide-react';
import { ISensorData } from '@/types/sensors';
import { useSettings } from '@/contexts/SettingsContext';

interface DashboardHeaderProps {
  sensorData: ISensorData;
  isIrrigationActive: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  sensorData,
  isIrrigationActive,
}) => {
  const { moistureSettings, irrigationSettings } = useSettings();
  
  const IRRIGATION_THRESHOLD_S1 = moistureSettings.sensor1.irrigationThreshold;
  const IRRIGATION_THRESHOLD_S2 = moistureSettings.sensor2.irrigationThreshold;
  const LOW_MOISTURE_THRESHOLD_S1 = moistureSettings.sensor1.alertThreshold;
  const LOW_MOISTURE_THRESHOLD_S2 = moistureSettings.sensor2.alertThreshold;

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="flex items-center space-x-2">
        {/* Irrigation Status Badge */}
        <Badge 
          variant={isIrrigationActive ? "default" : "outline"} 
          className={`py-1 ${isIrrigationActive ? "bg-green-600 hover:bg-green-700" : ""}`}
        >
          <PowerIcon className={`h-3.5 w-3.5 mr-1 ${isIrrigationActive ? "text-green-100" : ""}`} />
          Irrigation {isIrrigationActive ? "Active" : "Inactive"}
          {isIrrigationActive && (
            <span className="ml-1 text-xs">
              ({irrigationSettings.sensorPriority === 'sensor1' && `${sensorData.moisture1.toFixed(1)}% < ${IRRIGATION_THRESHOLD_S1}%`}
              {irrigationSettings.sensorPriority === 'sensor2' && `${sensorData.moisture2.toFixed(1)}% < ${IRRIGATION_THRESHOLD_S2}%`}
              {irrigationSettings.sensorPriority === 'both' && 'Multi-sensor trigger'})
            </span>
          )}
        </Badge>
        
        {/* Alert Badges */}
        {sensorData.moisture1 < LOW_MOISTURE_THRESHOLD_S1 && (
          <Badge variant="destructive" className="py-1">
            <AlertTriangleIcon className="h-3.5 w-3.5 mr-1" />
            Sensor 1 Low ({sensorData.moisture1.toFixed(1)}%)
          </Badge>
        )}
        {sensorData.moisture2 < LOW_MOISTURE_THRESHOLD_S2 && (
          <Badge variant="destructive" className="py-1">
            <AlertTriangleIcon className="h-3.5 w-3.5 mr-1" />
            Sensor 2 Low ({sensorData.moisture2.toFixed(1)}%)
          </Badge>
        )}
      </div>
    </div>
  );
};