import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, UserPlus, Phone, Mail, Shield } from 'lucide-react';

const RegisterPage = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSignup = async () => {
    await loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
      },
    });
  };

  const handleLogin = async () => {
    await loginWithRedirect({
      authorizationParams: {
        screen_hint: 'login',
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
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Join Smart Irrigation Dashboard and start optimizing your farm
        </p>
      </div>
      
      <div className="space-y-4">
        <Button
          onClick={handleSignup}
          className="w-full"
          size="lg"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Sign Up with Auth0
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              What you'll get
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-green-500" />
            <span>SMS alerts for irrigation schedules and soil conditions</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-blue-500" />
            <span>Email notifications for system updates</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-4 w-4 text-purple-500" />
            <span>Secure authentication with Auth0</span>
          </div>
        </div>
      </div>
      
      <div className="text-center text-sm">
        Already have an account?{' '}
        <button 
          onClick={handleLogin}
          className="underline underline-offset-4 hover:text-primary"
        >
          Sign in
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;