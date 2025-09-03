import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Power, Droplets } from 'lucide-react';

interface IrrigationStatusCardProps {
  showFarmerControls?: boolean;
}

export const IrrigationStatusCard: React.FC<IrrigationStatusCardProps> = ({
  showFarmerControls = false
}) => {
  const [isActive, setIsActive] = React.useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-4 w-4" />
          Irrigation Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>System Status</span>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        {showFarmerControls && (
          <Button
            variant={isActive ? "destructive" : "default"}
            size="sm"
            onClick={() => setIsActive(!isActive)}
            className="w-full"
          >
            <Power className="h-3 w-3 mr-1" />
            {isActive ? "Stop" : "Start"} Irrigation
          </Button>
        )}
      </CardContent>
    </Card>
  );
};