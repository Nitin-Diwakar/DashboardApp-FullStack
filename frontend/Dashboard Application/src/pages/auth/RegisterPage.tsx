// src/pages/auth/RegisterPage.tsx
import { SignUp, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const RegisterPage = () => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already signed in
  useEffect(() => {
    if (isSignedIn) {
      navigate('/');
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Welcome! Please fill in the details to get started.
        </p>
      </div>
      
      <SignUp 
        appearance={{
          elements: {
            formButtonPrimary: 
              "bg-primary hover:bg-primary/90 text-primary-foreground",
            card: "bg-background border shadow-lg",
            headerTitle: "text-foreground",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton: "border border-input bg-background hover:bg-accent",
            socialButtonsBlockButtonText: "text-foreground",
            formFieldLabel: "text-foreground",
            formFieldInput: "bg-background border-input",
            footerActionLink: "text-primary hover:text-primary/80",
            dividerLine: "bg-border",
            dividerText: "text-muted-foreground",
            formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
            identityPreviewText: "text-foreground",
            identityPreviewEditButton: "text-primary hover:text-primary/80",
            otpCodeFieldInput: "bg-background border-input",
            formResendCodeLink: "text-primary hover:text-primary/80"
          }
        }}
        redirectUrl="/"
        signInUrl="/login"
        // Remove routing and path props - let Clerk handle routing internally
      />
    </div>
  );
};

export default RegisterPage;