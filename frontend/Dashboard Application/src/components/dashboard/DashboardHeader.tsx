import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Clock } from 'lucide-react';

interface DashboardHeaderProps {
  lastUpdated?: Date | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  userType?: string;
  showAdvancedMetrics?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  lastUpdated,
  onRefresh,
  isRefreshing = false,
  userType = 'farmer'
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Dashboard Overview</span>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};