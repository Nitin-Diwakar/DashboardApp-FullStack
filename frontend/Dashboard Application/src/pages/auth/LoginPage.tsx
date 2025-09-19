import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, LogIn, Mail, Phone } from 'lucide-react';

const LoginPage = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    await loginWithRedirect({
      authorizationParams: {
        screen_hint: 'login',
      },
    });
  };

  const handleSignup = async () => {
    await loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to access your Smart Irrigation Dashboard
        </p>
      </div>
      
      <div className="space-y-4">
        <Button
          onClick={handleLogin}
          className="w-full"
          size="lg"
        >
          <LogIn className="mr-2 h-4 w-4" />
          Continue with Auth0
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Features after login
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>SMS Alerts</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Email Notifications</span>
          </div>
        </div>
      </div>
      
      <div className="text-center text-sm">
        New to Smart Irrigation?{' '}
        <button 
          onClick={handleSignup}
          className="underline underline-offset-4 hover:text-primary"
        >
          Create an account
        </button>
      </div>
    </div>
  );
};

export default LoginPage;