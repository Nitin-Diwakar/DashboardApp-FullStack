// Sensor data types for the application

export interface ISensorData {
  moisture1: number;      // Soil moisture reading for sensor 1 (%)
  moisture2: number;      // Soil moisture reading for sensor 2 (%)
  temperature: number;    // Temperature reading (°C)
  humidity: number;       // Humidity reading (%)
}

export interface IWeatherData {
  temperature: number; // Current temperature (°C)
  feelsLike: number; // Feels like temperature (°C)
  humidity: number; // Humidity (%)
  condition: string; // Weather condition (e.g., "Sunny", "Cloudy")
  location: string; // Location name
  windSpeed: number; // Wind speed (km/h)
  precipitation: number; // Precipitation chance (%)
}
export interface ISensorHistory {
  timestamp: string;
  sensor1: number;
  sensor2: number;
}