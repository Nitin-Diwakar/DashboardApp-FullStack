// src/contexts/ClerkUserContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';

interface UserWorkspace {
  irrigationSettings: {
    selectedCropId: string;
    moistureSettings: {
      sensor1: {
        irrigationThreshold: number;
        alertThreshold: number;
        optimalMin: number;
        optimalMax: number;
      };
      sensor2: {
        irrigationThreshold: number;
        alertThreshold: number;
        optimalMin: number;
        optimalMax: number;
      };
    };
    irrigationSettings: {
      duration: number;
      reIrrigationDelay: number;
      weatherIntegration: boolean;
      sensorPriority: string;
    };
  };
  projects: Array<{
    id: string;
    name: string;
    description: string;
    createdAt: string;
    status: 'active' | 'completed' | 'paused';
  }>;
  activities: Array<{
    id: string;
    title: string;
    description: string;
    scheduledDate: string;
    completed: boolean;
    createdAt: string;
  }>;
  dashboardPreferences: {
    defaultView: string;
    favoriteCharts: string[];
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

interface UserData {
  clerkUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'farmer' | 'non-farmer';
  contactNumber: string;
  workspace: UserWorkspace;
  createdAt: string;
  updatedAt: string;
}

interface ClerkUserContextType {
  userData: UserData | null;
  isLoading: boolean;
  updateWorkspace: (workspace: UserWorkspace) => Promise<void>;
  addProject: (project: Omit<UserData['workspace']['projects'][0], 'id' | 'createdAt'>) => Promise<void>;
  addActivity: (activity: Omit<UserData['workspace']['activities'][0], 'id' | 'createdAt'>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  getUserType: () => 'farmer' | 'non-farmer' | null;
  isUserType: (type: 'farmer' | 'non-farmer') => boolean;
}

const ClerkUserContext = createContext<ClerkUserContextType | undefined>(undefined);

export const ClerkUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:5000/api';

  const fetchUserData = async () => {
    if (!user || !isLoaded) return;

    setIsLoading(true);
    try {
      const userPayload = {
        clerkUserId: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        userType: user.unsafeMetadata?.userType as 'farmer' | 'non-farmer',
        contactNumber: user.unsafeMetadata?.contactNumber as string || ''
      };

      const response = await fetch(`${API_BASE_URL}/user-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: 'Error loading user data',
        description: 'Failed to load your workspace data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user, isLoaded]);

  const updateWorkspace = async (workspace: UserWorkspace) => {
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE_URL}/user-data/${user.id}/workspace`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workspace }),
      });

      if (!response.ok) {
        throw new Error('Failed to update workspace');
      }

      const data = await response.json();
      setUserData(data);
      
      toast({
        title: 'Settings updated',
        description: 'Your workspace settings have been saved.',
      });
    } catch (error) {
      console.error('Error updating workspace:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to save your settings.',
        variant: 'destructive',
      });
    }
  };

  const addProject = async (project: Omit<UserData['workspace']['projects'][0], 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE_URL}/user-data/${user.id}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project }),
      });

      if (!response.ok) {
        throw new Error('Failed to add project');
      }

      const data = await response.json();
      setUserData(data);
      
      toast({
        title: 'Project added',
        description: 'Your project has been created successfully.',
      });
    } catch (error) {
      console.error('Error adding project:', error);
      toast({
        title: 'Failed to add project',
        description: 'There was an error creating your project.',
        variant: 'destructive',
      });
    }
  };

  const addActivity = async (activity: Omit<UserData['workspace']['activities'][0], 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE_URL}/user-data/${user.id}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activity }),
      });

      if (!response.ok) {
        throw new Error('Failed to add activity');
      }

      const data = await response.json();
      setUserData(data);
      
      toast({
        title: 'Activity added',
        description: 'Your activity has been scheduled successfully.',
      });
    } catch (error) {
      console.error('Error adding activity:', error);
      toast({
        title: 'Failed to add activity',
        description: 'There was an error creating your activity.',
        variant: 'destructive',
      });
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE_URL}/user-data/${user.id}/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      const data = await response.json();
      setUserData(data);
      
      toast({
        title: 'Project deleted',
        description: 'Your project has been removed successfully.',
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Failed to delete project',
        description: 'There was an error removing your project.',
        variant: 'destructive',
      });
    }
  };

  const refreshUserData = async () => {
    await fetchUserData();
  };

  const getUserType = (): 'farmer' | 'non-farmer' | null => {
    return userData?.userType || null;
  };

  const isUserType = (type: 'farmer' | 'non-farmer'): boolean => {
    return userData?.userType === type;
  };

  const contextValue: ClerkUserContextType = {
    userData,
    isLoading,
    updateWorkspace,
    addProject,
    addActivity,
    deleteProject,
    refreshUserData,
    getUserType,
    isUserType,
  };

  return (
    <ClerkUserContext.Provider value={contextValue}>
      {children}
    </ClerkUserContext.Provider>
  );
};

export const useClerkUser = (): ClerkUserContextType => {
  const context = useContext(ClerkUserContext);
  if (context === undefined) {
    throw new Error('useClerkUser must be used within a ClerkUserProvider');
  }
  return context;
};