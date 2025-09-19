import { AppState, Auth0Provider } from '@auth0/auth0-react';

// Auth0 configuration
export const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN!,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID!,
  authorizationParams: {
    redirect_uri: import.meta.env.VITE_AUTH0_CALLBACK_URL || window.location.origin + '/callback',
    ...(import.meta.env.VITE_AUTH0_AUDIENCE && { audience: import.meta.env.VITE_AUTH0_AUDIENCE }),
  },
  cacheLocation: 'localstorage' as const,
};

// Validation function to ensure all required config is present
export const validateAuth0Config = () => {
  const { domain, clientId } = auth0Config;
  
  if (!domain) {
    throw new Error('Auth0 domain is required. Please set VITE_AUTH0_DOMAIN in your environment variables.');
  }
  
  if (!clientId) {
    throw new Error('Auth0 client ID is required. Please set VITE_AUTH0_CLIENT_ID in your environment variables.');
  }
  
  console.log('✅ Auth0 configuration validated successfully');
};

// OnRedirectCallback function for handling Auth0 redirects
export const onRedirectCallback = (appState?: AppState) => {
  window.history.replaceState(
    {},
    document.title,
    appState?.returnTo || window.location.pathname
  );
};

// Auth0 provider props
export const auth0ProviderProps = {
  ...auth0Config,
  onRedirectCallback,
  useRefreshTokens: true,
  cacheLocation: 'localstorage' as const,
};