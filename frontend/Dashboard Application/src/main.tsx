import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ClerkProvider } from '@clerk/clerk-react';

// TEMPORARY: Clean up old auth data (remove these lines after running once)
localStorage.removeItem('auth_token');
localStorage.removeItem('registered_name');
localStorage.removeItem('registered_email');
console.log('🧹 Cleaned up old authentication data from localStorage');

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/"
      signInUrl="/login"
      signUpUrl="/register"
      routerPush={(to) => window.history.pushState(null, '', to)}
      routerReplace={(to) => window.history.replaceState(null, '', to)}
    >
      <App />
    </ClerkProvider>
  </StrictMode>
);