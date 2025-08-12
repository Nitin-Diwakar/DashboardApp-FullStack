import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Types (same as in Settings.tsx)
interface MoistureSettings {
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
}

interface IrrigationSettings {
  duration: number;
  reIrrigationDelay: number;
  weatherIntegration: boolean;
  sensorPriority: 'sensor1' | 'sensor2' | 'both';
}

interface SettingsContextType {
  moistureSettings: MoistureSettings;
  irrigationSettings: IrrigationSettings;
  selectedCropId: string;
  refreshSettings: () => void;
}

// Default settings
const DEFAULT_SETTINGS = {
  selectedCropId: 'custom',
  moistureSettings: {
    sensor1: { irrigationThreshold: 20, alertThreshold: 30, optimalMin: 20, optimalMax: 80 },
    sensor2: { irrigationThreshold: 20, alertThreshold: 30, optimalMin: 20, optimalMax: 80 }
  },
  irrigationSettings: {
    duration: 15,
    reIrrigationDelay: 120,
    weatherIntegration: true,
    sensorPriority: 'sensor1' as const
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [selectedCropId, setSelectedCropId] = useState<string>(DEFAULT_SETTINGS.selectedCropId);
  const [moistureSettings, setMoistureSettings] = useState<MoistureSettings>(DEFAULT_SETTINGS.moistureSettings);
  const [irrigationSettings, setIrrigationSettings] = useState<IrrigationSettings>(DEFAULT_SETTINGS.irrigationSettings);

  // Load settings from localStorage
  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('irrigationSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSelectedCropId(parsed.selectedCropId || DEFAULT_SETTINGS.selectedCropId);
        setMoistureSettings(parsed.moistureSettings || DEFAULT_SETTINGS.moistureSettings);
        setIrrigationSettings(parsed.irrigationSettings || DEFAULT_SETTINGS.irrigationSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Use default settings if loading fails
      setSelectedCropId(DEFAULT_SETTINGS.selectedCropId);
      setMoistureSettings(DEFAULT_SETTINGS.moistureSettings);
      setIrrigationSettings(DEFAULT_SETTINGS.irrigationSettings);
    }
  };

  // Load settings on component mount
  useEffect(() => {
    loadSettings();

    // Listen for settings updates from Settings page
    const handleSettingsUpdate = () => {
      loadSettings();
    };

    window.addEventListener('irrigationSettingsUpdated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('irrigationSettingsUpdated', handleSettingsUpdate);
    };
  }, []);

  const refreshSettings = () => {
    loadSettings();
  };

  const value = {
    moistureSettings,
    irrigationSettings,
    selectedCropId,
    refreshSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};