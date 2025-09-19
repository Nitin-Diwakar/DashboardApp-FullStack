import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useAuth0Profile } from '@/hooks/useAuth0Profile';

const CallbackPage = () => {
  const { isLoading, error, isAuthenticated } = useAuth0();
  const { needsPhoneNumber } = useAuth0Profile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !error && isAuthenticated) {
      // Small delay to ensure profile is loaded
      const timer = setTimeout(() => {
        if (needsPhoneNumber()) {
          navigate('/collect-phone', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    } else if (!isLoading && error) {
      navigate('/login', { replace: true });
    }
  }, [isLoading, error, isAuthenticated, needsPhoneNumber, navigate]);

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 text-red-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Authentication Error</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {error.message}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <div className="text-center">
          <h2 className="text-lg font-semibold">Completing Authentication</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Please wait while we log you in...
          </p>
        </div>
      </div>
    </div>
  );
};

export default CallbackPage;