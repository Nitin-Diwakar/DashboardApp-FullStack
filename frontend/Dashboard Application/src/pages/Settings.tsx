import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Save, 
  RotateCcw, 
  AlertTriangle, 
  Droplets, 
  Settings as SettingsIcon,
  Info,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Types for settings
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
  duration: number; // minutes
  reIrrigationDelay: number; // minutes
  weatherIntegration: boolean;
  sensorPriority: 'sensor1' | 'sensor2' | 'both';
}

interface CropProfile {
  id: string;
  name: string;
  description: string;
  moistureSettings: MoistureSettings;
  irrigationSettings: IrrigationSettings;
}

// Predefined crop profiles
const CROP_PROFILES: CropProfile[] = [
  {
    id: 'tomatoes',
    name: 'Tomatoes',
    description: 'Deep root vegetables requiring consistent moisture',
    moistureSettings: {
      sensor1: { irrigationThreshold: 25, alertThreshold: 35, optimalMin: 25, optimalMax: 70 },
      sensor2: { irrigationThreshold: 30, alertThreshold: 40, optimalMin: 30, optimalMax: 75 }
    },
    irrigationSettings: {
      duration: 15,
      reIrrigationDelay: 120,
      weatherIntegration: true,
      sensorPriority: 'both'
    }
  },
  {
    id: 'lettuce',
    name: 'Lettuce',
    description: 'Shallow root leafy greens needing frequent watering',
    moistureSettings: {
      sensor1: { irrigationThreshold: 30, alertThreshold: 40, optimalMin: 30, optimalMax: 75 },
      sensor2: { irrigationThreshold: 35, alertThreshold: 45, optimalMin: 35, optimalMax: 80 }
    },
    irrigationSettings: {
      duration: 10,
      reIrrigationDelay: 60,
      weatherIntegration: true,
      sensorPriority: 'sensor2'
    }
  },
  {
    id: 'peppers',
    name: 'Peppers',
    description: 'Heat-loving plants preferring slightly drier conditions',
    moistureSettings: {
      sensor1: { irrigationThreshold: 20, alertThreshold: 30, optimalMin: 20, optimalMax: 65 },
      sensor2: { irrigationThreshold: 25, alertThreshold: 35, optimalMin: 25, optimalMax: 70 }
    },
    irrigationSettings: {
      duration: 12,
      reIrrigationDelay: 180,
      weatherIntegration: true,
      sensorPriority: 'sensor1'
    }
  },
  {
    id: 'herbs',
    name: 'Herbs',
    description: 'Mediterranean herbs preferring well-drained soil',
    moistureSettings: {
      sensor1: { irrigationThreshold: 15, alertThreshold: 25, optimalMin: 15, optimalMax: 60 },
      sensor2: { irrigationThreshold: 20, alertThreshold: 30, optimalMin: 20, optimalMax: 65 }
    },
    irrigationSettings: {
      duration: 8,
      reIrrigationDelay: 240,
      weatherIntegration: true,
      sensorPriority: 'sensor1'
    }
  }
];

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

const Settings: React.FC = () => {
  const { toast } = useToast();
  const [selectedCropId, setSelectedCropId] = useState<string>('custom');
  const [moistureSettings, setMoistureSettings] = useState<MoistureSettings>(DEFAULT_SETTINGS.moistureSettings);
  const [irrigationSettings, setIrrigationSettings] = useState<IrrigationSettings>(DEFAULT_SETTINGS.irrigationSettings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('irrigationSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSelectedCropId(parsed.selectedCropId || 'custom');
        setMoistureSettings(parsed.moistureSettings || DEFAULT_SETTINGS.moistureSettings);
        setIrrigationSettings(parsed.irrigationSettings || DEFAULT_SETTINGS.irrigationSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
        toast({
          title: "Error loading settings",
          description: "Using default values instead.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  // Handle crop profile selection
  const handleCropProfileChange = (cropId: string) => {
    if (cropId === 'custom') {
      setSelectedCropId(cropId);
      return;
    }

    const cropProfile = CROP_PROFILES.find(crop => crop.id === cropId);
    if (cropProfile) {
      setSelectedCropId(cropId);
      setMoistureSettings(cropProfile.moistureSettings);
      setIrrigationSettings(cropProfile.irrigationSettings);
      setHasUnsavedChanges(true);
      setValidationErrors([]);
    }
  };

  // Validation function
  const validateSettings = (): string[] => {
    const errors: string[] = [];

    // Validate sensor 1
    if (moistureSettings.sensor1.irrigationThreshold >= moistureSettings.sensor1.alertThreshold) {
      errors.push('Sensor 1: Irrigation threshold must be lower than alert threshold');
    }
    if (moistureSettings.sensor1.optimalMin >= moistureSettings.sensor1.optimalMax) {
      errors.push('Sensor 1: Optimal minimum must be lower than maximum');
    }
    if (moistureSettings.sensor1.irrigationThreshold < moistureSettings.sensor1.optimalMin) {
      errors.push('Sensor 1: Irrigation threshold should not be below optimal minimum');
    }

    // Validate sensor 2
    if (moistureSettings.sensor2.irrigationThreshold >= moistureSettings.sensor2.alertThreshold) {
      errors.push('Sensor 2: Irrigation threshold must be lower than alert threshold');
    }
    if (moistureSettings.sensor2.optimalMin >= moistureSettings.sensor2.optimalMax) {
      errors.push('Sensor 2: Optimal minimum must be lower than maximum');
    }
    if (moistureSettings.sensor2.irrigationThreshold < moistureSettings.sensor2.optimalMin) {
      errors.push('Sensor 2: Irrigation threshold should not be below optimal minimum');
    }

    // Validate irrigation settings
    if (irrigationSettings.duration < 1 || irrigationSettings.duration > 60) {
      errors.push('Irrigation duration must be between 1 and 60 minutes');
    }
    if (irrigationSettings.reIrrigationDelay < 30) {
      errors.push('Re-irrigation delay must be at least 30 minutes');
    }

    return errors;
  };

  // Handle input changes
  const handleMoistureChange = (sensor: 'sensor1' | 'sensor2', field: string, value: number) => {
    setMoistureSettings(prev => ({
      ...prev,
      [sensor]: {
        ...prev[sensor],
        [field]: value
      }
    }));
    setHasUnsavedChanges(true);
    setSelectedCropId('custom'); // Switch to custom when manually editing
  };

  const handleIrrigationChange = (field: keyof IrrigationSettings, value: any) => {
    setIrrigationSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  // Save settings
  const handleSave = () => {
    const errors = validateSettings();
    setValidationErrors(errors);

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      });
      return;
    }

    const settingsToSave = {
      selectedCropId,
      moistureSettings,
      irrigationSettings,
      lastUpdated: new Date().toISOString()
    };

    localStorage.setItem('irrigationSettings', JSON.stringify(settingsToSave));
    setHasUnsavedChanges(false);

    toast({
      title: "Settings Saved",
      description: "Your irrigation settings have been updated successfully.",
    });

    // Dispatch custom event to notify Dashboard component
    window.dispatchEvent(new CustomEvent('irrigationSettingsUpdated', {
      detail: settingsToSave
    }));
  };

  // Reset to defaults
  const handleReset = () => {
    setSelectedCropId(DEFAULT_SETTINGS.selectedCropId);
    setMoistureSettings(DEFAULT_SETTINGS.moistureSettings);
    setIrrigationSettings(DEFAULT_SETTINGS.irrigationSettings);
    setHasUnsavedChanges(true);
    setValidationErrors([]);
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Irrigation Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure irrigation thresholds and crop-specific parameters
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasUnsavedChanges}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {validationErrors.map((error, index) => (
                <div key={index}>• {error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Don't forget to save your settings.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="crop-profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="crop-profile">Crop Profile</TabsTrigger>
          <TabsTrigger value="thresholds">Moisture Thresholds</TabsTrigger>
          <TabsTrigger value="irrigation">Irrigation Control</TabsTrigger>
        </TabsList>

        {/* Crop Profile Tab */}
        <TabsContent value="crop-profile">
          <Card>
            <CardHeader>
              <CardTitle>Crop Profile Selection</CardTitle>
              <CardDescription>
                Choose a predefined crop profile or customize your own settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="crop-select">Select Crop Type</Label>
                <Select value={selectedCropId} onValueChange={handleCropProfileChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a crop profile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom Settings</SelectItem>
                    <Separator />
                    {CROP_PROFILES.map((crop) => (
                      <SelectItem key={crop.id} value={crop.id}>
                        {crop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Show selected crop info */}
              {selectedCropId !== 'custom' && (
                <div className="p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-800">
                  {(() => {
                    const crop = CROP_PROFILES.find(c => c.id === selectedCropId);
                    return crop ? (
                      <div>
                        <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                          {crop.name} Profile
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                          {crop.description}
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Sensor 1:</strong> Irrigation at {crop.moistureSettings.sensor1.irrigationThreshold}%
                          </div>
                          <div>
                            <strong>Sensor 2:</strong> Irrigation at {crop.moistureSettings.sensor2.irrigationThreshold}%
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {selectedCropId === 'custom' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Custom Configuration
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    You're using custom settings. Configure thresholds in the other tabs to match your specific crop requirements.
                  </p>
                </div>
              )}

              {/* Crop Profile Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CROP_PROFILES.map((crop) => (
                  <Card 
                    key={crop.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedCropId === crop.id ? 'ring-2 ring-green-500' : ''
                    }`}
                    onClick={() => handleCropProfileChange(crop.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{crop.name}</h4>
                        {selectedCropId === crop.id && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {crop.description}
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          S1: {crop.moistureSettings.sensor1.irrigationThreshold}%
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          S2: {crop.moistureSettings.sensor2.irrigationThreshold}%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Moisture Thresholds Tab */}
        <TabsContent value="thresholds">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Sensor 1 Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  Soil Moisture Sensor 1
                </CardTitle>
                <CardDescription>Depth embedded sensor settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="s1-irrigation">Irrigation Threshold (%)</Label>
                  <Input
                    id="s1-irrigation"
                    type="number"
                    min="0"
                    max="100"
                    value={moistureSettings.sensor1.irrigationThreshold}
                    onChange={(e) => handleMoistureChange('sensor1', 'irrigationThreshold', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Start irrigation when moisture drops below this level
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="s1-alert">Low Moisture Alert (%)</Label>
                  <Input
                    id="s1-alert"
                    type="number"
                    min="0"
                    max="100"
                    value={moistureSettings.sensor1.alertThreshold}
                    onChange={(e) => handleMoistureChange('sensor1', 'alertThreshold', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Show alert when moisture drops below this level
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="s1-min">Optimal Min (%)</Label>
                    <Input
                      id="s1-min"
                      type="number"
                      min="0"
                      max="100"
                      value={moistureSettings.sensor1.optimalMin}
                      onChange={(e) => handleMoistureChange('sensor1', 'optimalMin', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="s1-max">Optimal Max (%)</Label>
                    <Input
                      id="s1-max"
                      type="number"
                      min="0"
                      max="100"
                      value={moistureSettings.sensor1.optimalMax}
                      onChange={(e) => handleMoistureChange('sensor1', 'optimalMax', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Optimal moisture range for healthy plant growth
                </p>
              </CardContent>
            </Card>

            {/* Sensor 2 Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-green-500" />
                  Soil Moisture Sensor 2
                </CardTitle>
                <CardDescription>Root zone sensor settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="s2-irrigation">Irrigation Threshold (%)</Label>
                  <Input
                    id="s2-irrigation"
                    type="number"
                    min="0"
                    max="100"
                    value={moistureSettings.sensor2.irrigationThreshold}
                    onChange={(e) => handleMoistureChange('sensor2', 'irrigationThreshold', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Start irrigation when moisture drops below this level
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="s2-alert">Low Moisture Alert (%)</Label>
                  <Input
                    id="s2-alert"
                    type="number"
                    min="0"
                    max="100"
                    value={moistureSettings.sensor2.alertThreshold}
                    onChange={(e) => handleMoistureChange('sensor2', 'alertThreshold', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Show alert when moisture drops below this level
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="s2-min">Optimal Min (%)</Label>
                    <Input
                      id="s2-min"
                      type="number"
                      min="0"
                      max="100"
                      value={moistureSettings.sensor2.optimalMin}
                      onChange={(e) => handleMoistureChange('sensor2', 'optimalMin', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="s2-max">Optimal Max (%)</Label>
                    <Input
                      id="s2-max"
                      type="number"
                      min="0"
                      max="100"
                      value={moistureSettings.sensor2.optimalMax}
                      onChange={(e) => handleMoistureChange('sensor2', 'optimalMax', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Optimal moisture range for healthy plant growth
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Irrigation Control Tab */}
        <TabsContent value="irrigation">
          <Card>
            <CardHeader>
              <CardTitle>Irrigation Control Settings</CardTitle>
              <CardDescription>
                Configure irrigation timing and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="duration">Irrigation Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="60"
                    value={irrigationSettings.duration}
                    onChange={(e) => handleIrrigationChange('duration', parseInt(e.target.value) || 1)}
                  />
                  <p className="text-xs text-muted-foreground">
                    How long to run irrigation when triggered
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delay">Re-irrigation Delay (minutes)</Label>
                  <Input
                    id="delay"
                    type="number"
                    min="30"
                    max="1440"
                    value={irrigationSettings.reIrrigationDelay}
                    onChange={(e) => handleIrrigationChange('reIrrigationDelay', parseInt(e.target.value) || 30)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum time between irrigation cycles
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sensor-priority">Sensor Priority</Label>
                  <Select 
                    value={irrigationSettings.sensorPriority} 
                    onValueChange={(value: 'sensor1' | 'sensor2' | 'both') => handleIrrigationChange('sensorPriority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sensor1">Sensor 1 Only</SelectItem>
                      <SelectItem value="sensor2">Sensor 2 Only</SelectItem>
                      <SelectItem value="both">Both Sensors (Either)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Which sensor(s) should trigger irrigation
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weather-integration">Weather Integration</Label>
                    <p className="text-xs text-muted-foreground">
                      Skip irrigation if rain is predicted
                    </p>
                  </div>
                  <Switch
                    id="weather-integration"
                    checked={irrigationSettings.weatherIntegration}
                    onCheckedChange={(checked) => handleIrrigationChange('weatherIntegration', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;