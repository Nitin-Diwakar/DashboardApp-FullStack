import { useAuth0 } from '@auth0/auth0-react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth0Profile } from '@/hooks/useAuth0Profile';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth0();
  const { needsPhoneNumber, isLoading: profileLoading } = useAuth0Profile();

  if (isLoading || profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Only redirect to phone collection if we're not already there
  if (needsPhoneNumber() && !window.location.pathname.includes('/collect-phone')) {
    return <Navigate to="/collect-phone" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;