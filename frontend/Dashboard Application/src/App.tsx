import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import Dashboard from '@/pages/Dashboard';
import Schedule from '@/pages/Schedule';
import Activities from '@/pages/Activities';
import DataSheet from '@/pages/DataSheet';
import { SettingsProvider } from '@/contexts/SettingsContext';
import Settings from '@/pages/Settings';
import ProtectedRoute from '@/components/ProtectedRoute';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { ClerkUserProvider } from '@/contexts/ClerkUserContext';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <ClerkUserProvider>
          <SettingsProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes - Only show when user is NOT signed in */}
                <Route element={
                  <SignedOut>
                    <AuthLayout />
                  </SignedOut>
                }>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Route>

                {/* Protected Routes - Only show when user IS signed in */}
                <Route element={
                  <SignedIn>
                    <ProtectedRoute />
                  </SignedIn>
                }>
                  <Route element={<DashboardLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/activities" element={<Activities />} />
                    <Route path="/data" element={<DataSheet />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </SettingsProvider>
        </ClerkUserProvider>
        <Toaster />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;