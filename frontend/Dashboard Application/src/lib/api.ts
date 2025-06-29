import { ISensorData, IWeatherData } from '@/types/sensors';
import { ISensorHistory } from "@/types/sensors";

export const fetchSensorData = async (): Promise<ISensorHistory[]> => {
  const res = await fetch("http://localhost:5000/api/sensor-data");
  return await res.json();
};
export const fetchWeatherData = async (): Promise<IWeatherData> => {
  const lat = 12.842107714800836; 
  const lon =  77.66314163241391; 
  const apiKey = "b6239bdd3bff44fe86872b5ee890284c";
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  return {
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    condition: data.weather[0].description,
    location: data.name,
    windSpeed: Math.round(data.wind.speed),
    precipitation: data.clouds.all, // cloudiness as % precipitation proxy
  };
};


export const fetchMotorStatus = async (): Promise<boolean> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Random motor status
  return Math.random() > 0.7; // 30% chance of being on
};

export const controlMotor = async (turnOn: boolean): Promise<boolean> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate success response
  return turnOn;
};