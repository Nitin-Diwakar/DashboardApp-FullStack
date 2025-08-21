// src/types/sensors.ts - Enhanced Types with FormattedSensorData
export interface ISensorHistory {
  timestamp: string;
  sensor1: number;
  sensor2: number;
  temperature: number | null;  // Allow null for missing data
  humidity: number | null;     // Allow null for missing data
  batteryLevel: number | null; // Allow null for missing data
}

export interface ISensorData {
  moisture1: number;
  moisture2: number;
  temperature: number;
  humidity: number;
}

export interface IWeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  condition: string;
  location: string;
  windSpeed: number;
  precipitation: number;
}

export interface FormattedSensorData {
  timestamp: string;
  time: string;
  moisture1: number;
  moisture2: number;
  date: Date;
  month: number;
  year: number;
  monthName: string;
  weekNum: number;
  monthWeek: number; 
  dayOfMonth: number;
  formattedDate: string; 
}