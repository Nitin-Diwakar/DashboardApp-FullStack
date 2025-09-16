import { Suspense, lazy } from 'react';
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';

// Register service worker for caching
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Lazy load layouts - these are more critical and loaded early
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

// Lazy load auth pages (less critical)
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));

// Lazy load dashboard pages for better initial loading performance
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Schedule = lazy(() => import('@/pages/Schedule'));
const Activities = lazy(() => import('@/pages/Activities'));
const DataSheet = lazy(() => import('@/pages/DataSheet'));
const Settings = lazy(() => import('@/pages/Settings'));


// Create a client with optimized configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduce background refetch frequency to improve performance
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: 'always',
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

// Loading component for Suspense fallbacks
const LoadingSpinner = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Layout-specific loading component
const LayoutLoading = () => (
  <div className="flex h-16 w-full items-center justify-center border-b">
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <SettingsProvider>
            <BrowserRouter>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route element={<AuthLayout />}>
                    <Route 
                      path="/login" 
                      element={
                        <Suspense fallback={<LayoutLoading />}>
                          <LoginPage />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="/register" 
                      element={
                        <Suspense fallback={<LayoutLoading />}>
                          <RegisterPage />
                        </Suspense>
                      } 
                    />
                  </Route>
                  <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                      <Route 
                        path="/" 
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <Dashboard />
                          </Suspense>
                        } 
                      />
                      <Route 
                        path="/schedule" 
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <Schedule />
                          </Suspense>
                        } 
                      />
                      <Route 
                        path="/activities" 
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <Activities />
                          </Suspense>
                        } 
                      />
                      <Route 
                        path="/data" 
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <DataSheet />
                          </Suspense>
                        } 
                      />
                      <Route 
                        path="/settings" 
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <Settings />
                          </Suspense>
                        } 
                      />
                    </Route>
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </SettingsProvider>
        </AuthProvider>
        <Toaster />
        {/* Performance monitoring for development */}
        {process.env.NODE_ENV === 'development' && (
          <PerformanceMonitor 
            onMetric={(metric) => {
              // You can send these metrics to analytics service
              console.log('Performance Metric:', metric);
            }}
          />
        )}
      </ThemeProvider>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

export default App;