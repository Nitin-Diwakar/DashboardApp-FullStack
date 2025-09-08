import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Mock API URL - in a real app, this would be an environment variable
const API_URL = 'https://api.example.com';

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockLogin = async (email: string, password: string) => {
  const name = localStorage.getItem('registered_name') || 'Farmer';

  return {
    token: 'mock-jwt-token',
    user: {
      id: '1',
      name,   
      email,
    },
  };
};


const mockRegister = async (name: string, email: string, password: string) => {
  // Save it to localStorage
  localStorage.setItem('registered_name', name);
  localStorage.setItem('registered_email', email);

  return {
    token: 'mock-jwt-token',
    user: {
      id: '1',
      name,
      email,
    },
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        // In a real app, you would verify the token with the backend
        // For now, we'll just assume it's valid and decode it
        const decoded = jwtDecode(token) as { user: User };
        setUser(decoded.user);
      } catch (error) {
        // Invalid token
        localStorage.removeItem('auth_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // In a real app, this would be an API call
      const { token, user } = await mockLogin(email, password);
      
      localStorage.setItem('auth_token', token);
      setUser(user);
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // In a real app, this would be an API call
      const { token, user } = await mockRegister(name, email, password);
      
      localStorage.setItem('auth_token', token);
      setUser(user);
    } catch (error) {
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};