// src/pages/Dashboard.tsx - Updated with user type awareness
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useSettings } from '@/contexts/SettingsContext';
import { useClerkUser } from '@/contexts/ClerkUserContext';
import { useDashboardData, useChartFilters } from '@/hooks';
import {
  DashboardHeader,
  SensorCards,
  SensorHistoryChart,
  IrrigationStatusCard,
  WeatherInsights,
  SoilConditionAnalysis,
  IrrigationRecommendations,
  FieldHealthOverview
} from '@/components/dashboard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Loader2, Tractor, Users } from 'lucide-react';

// Loading Components
const DashboardSkeleton = () => (
  <div className="w-full space-y-6">
    <Skeleton className="h-16 w-full" />
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map(i => (
        <Skeleton key={i} className="h-48 w-full" />
      ))}
    </div>
    <div className="grid gap-4 md:grid-cols-7">
      <Skeleton className="h-96 md:col-span-4" />
      <Skeleton className="h-96 md:col-span-3" />
    </div>
  </div>
);

const ComponentSkeleton = ({ className = "h-32" }: { className?: string }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
      </div>
    </CardContent>
  </Card>
);

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <Alert variant="destructive">
    <AlertTriangle className="h-4 w-4" />
    <AlertDescription>
      Something went wrong loading this section. Please try refreshing the page.
    </AlertDescription>
  </Alert>
);

// User Type Specific Welcome Card
const UserWelcomeCard = () => {
  const { userData, isUserType } = useClerkUser();
  
  if (!userData) return null;

  const isFarmer = isUserType('farmer');
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isFarmer ? (
            <>
              <Tractor className="h-5 w-5 text-green-600" />
              <span>Farmer Dashboard</span>
            </>
          ) : (
            <>
              <Users className="h-5 w-5 text-blue-600" />
              <span>Agriculture Monitor</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-lg font-medium">
            Welcome back, {userData.firstName}!
          </p>
          <p className="text-sm text-muted-foreground">
            {isFarmer ? (
              "Monitor your farm's conditions and manage irrigation efficiently."
            ) : (
              "Track agricultural data and analyze farming insights."
            )}
          </p>
          {isFarmer && (
            <div className="mt-3 text-xs text-muted-foreground">
              <p>Contact: {userData.contactNumber}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const { userData, isLoading: userLoading, isUserType } = useClerkUser();
  const {
    sensorData,
    weatherData,
    historicalData,
    weeklyData,
    monthlyData,
    availableMonths,
    isLoading: dashboardLoading,
    isRefreshing,
    error,
    retryCount,
    lastUpdated,
    dataInitialized,
    loadInitialData,
    refreshLiveData,
    retryLoad,
    getInitialMonth,
  } = useDashboardData();

  const {
    selectedMonth,
    setSelectedMonth,
    selectedTimeframe,
    setSelectedTimeframe,
    filteredData,
  } = useChartFilters(historicalData, getInitialMonth());

  // Show loading while user data or dashboard data loads
  if (userLoading || dashboardLoading) {
    return <DashboardSkeleton />;
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="w-full space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Failed to load dashboard data
              {retryCount > 0 && ` (Attempt ${retryCount + 1})`}
            </span>
            <button 
              onClick={retryLoad}
              className="underline hover:no-underline"
            >
              Retry
            </button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isFarmer = isUserType('farmer');

  return (
    <div className="w-full space-y-6">
      {/* User Type Specific Welcome */}
      <UserWelcomeCard />

      {/* Header with user-specific context */}
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<ComponentSkeleton className="h-16" />}>
          <DashboardHeader 
            lastUpdated={lastUpdated}
            onRefresh={refreshLiveData}
            isRefreshing={isRefreshing}
            userType={userData?.userType}
          />
        </Suspense>
      </ErrorBoundary>

      {/* Sensor Cards - Show different priorities for different user types */}
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<ComponentSkeleton />}>
          <SensorCards 
            sensorData={sensorData}
            showAdvancedMetrics={isFarmer} // Farmers get more detailed view
          />
        </Suspense>
      </ErrorBoundary>

      {/* Main Chart and Status */}
      <div className="grid gap-4 md:grid-cols-7">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<ComponentSkeleton className="h-96 md:col-span-4" />}>
            <SensorHistoryChart
              data={filteredData}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              availableMonths={availableMonths}
              selectedTimeframe={selectedTimeframe}
              onTimeframeChange={setSelectedTimeframe}
              weeklyData={weeklyData}
              monthlyData={monthlyData}
              className="md:col-span-4"
              chartType={isFarmer ? 'detailed' : 'overview'} // Different chart complexity
            />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<ComponentSkeleton className="h-96 md:col-span-3" />}>
            <div className="md:col-span-3 space-y-4">
              <IrrigationStatusCard showFarmerControls={isFarmer} />
              <WeatherInsights weatherData={weatherData} />
            </div>
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Additional Components - Conditional based on user type */}
      {isFarmer ? (
        // Farmer-specific sections
        <div className="grid gap-4 md:grid-cols-2">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<ComponentSkeleton />}>
              <SoilConditionAnalysis 
                sensorData={sensorData}
                historicalData={historicalData}
                showRecommendations={true}
              />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<ComponentSkeleton />}>
              <IrrigationRecommendations 
                sensorData={sensorData}
                weatherData={weatherData}
                userPreferences={userData?.workspace?.irrigationSettings}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      ) : (
        // Non-farmer sections (more analytical/overview)
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<ComponentSkeleton />}>
            <FieldHealthOverview 
              sensorData={sensorData}
              historicalData={historicalData}
              weatherData={weatherData}
              showAnalytics={true}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && userData && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1">
            <p>User ID: {userData.clerkUserId}</p>
            <p>User Type: {userData.userType}</p>
            <p>Data Initialized: {dataInitialized ? 'Yes' : 'No'}</p>
            <p>Last Updated: {lastUpdated?.toLocaleTimeString()}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;