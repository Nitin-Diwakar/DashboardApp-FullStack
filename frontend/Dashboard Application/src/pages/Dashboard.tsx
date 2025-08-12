import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSettings } from '@/contexts/SettingsContext';
import {
  DropletIcon,
  ThermometerIcon,
  CloudIcon,
  PowerIcon,
  AlertTriangleIcon,
  BellIcon
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SensorGauge } from '@/components/SensorGauge';
import { fetchSensorData, fetchWeatherData } from '@/lib/api';
import { ISensorData, IWeatherData } from '@/types/sensors';

// Define additional interfaces for data handling
interface FormattedSensorData {
  timestamp: string;
  time: string;
  moisture1: number;
  moisture2: number;
  date: Date;
  month: number;
  year: number;
  monthName: string;
  weekNum: number;
  monthWeek: number; // Week number relative to month
  dayOfMonth: number;
  formattedDate: string; // Formatted date string for display
}

interface MonthOption {
  id: string;
  name: string;
  month: number;
  year: number;
}

interface WeekOption {
  id: string;
  name: string;
  weekNum: number;
  year: number;
}

interface DayOption {
  id: string;
  name: string;
  timestamp: string;
  date: Date;
}

interface MonthlyData {
  time: string;
  moisture1: number;
  moisture2: number;
  weekNum: number;
  monthWeek: number;
  year: number;
  month: number;
}

const Dashboard = () => {
  // Data states
  const [sensorData, setSensorData] = useState<ISensorData | null>(null);
  const [weatherData, setWeatherData] = useState<IWeatherData | null>(null);
  const [historicalData, setHistoricalData] = useState<FormattedSensorData[]>([]);
  const [weeklyData, setWeeklyData] = useState<FormattedSensorData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  
  // Fixed: Irrigation status based on sensor data instead of random
  const [isIrrigationActive, setIsIrrigationActive] = useState<boolean>(false);
  
  // Filter states
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  
  // Options states
  const [availableMonths, setAvailableMonths] = useState<MonthOption[]>([]);
  const [availableWeeks, setAvailableWeeks] = useState<WeekOption[]>([]);
  const [availableDays, setAvailableDays] = useState<DayOption[]>([]);
  
  // Filtered data states
  const [filteredDailyData, setFilteredDailyData] = useState<FormattedSensorData[]>([]);
  const [filteredWeeklyData, setFilteredWeeklyData] = useState<FormattedSensorData[]>([]);
  const [filteredDayData, setFilteredDayData] = useState<FormattedSensorData[]>([]);

  // Data loading flags
  const dataInitialized = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

 // Get settings from context instead of hardcoded values
const { moistureSettings, irrigationSettings } = useSettings();

// Use dynamic thresholds from settings
const IRRIGATION_THRESHOLD_S1 = moistureSettings.sensor1.irrigationThreshold;
const IRRIGATION_THRESHOLD_S2 = moistureSettings.sensor2.irrigationThreshold;
const LOW_MOISTURE_THRESHOLD_S1 = moistureSettings.sensor1.alertThreshold;
const LOW_MOISTURE_THRESHOLD_S2 = moistureSettings.sensor2.alertThreshold;

  // Helper function to get week number of the year
  const getWeekNumber = (date: Date): number => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  // Helper function to get week number relative to the month (1-indexed)
  const getMonthWeek = (date: Date): number => {
    const d = new Date(date);
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
    const offsetDay = firstDay.getDay() || 7; // Make Sunday 7 instead of 0
    const dayOfMonth = d.getDate();
    return Math.ceil((dayOfMonth + offsetDay - 1) / 7);
  };

// Updated: irrigation logic based on sensor priority from settings
useEffect(() => {
  if (sensorData && sensorData.moisture1 !== undefined && sensorData.moisture2 !== undefined) {
    let shouldIrrigate = false;
    
    // Check irrigation based on sensor priority from settings
    switch (irrigationSettings.sensorPriority) {
      case 'sensor1':
        shouldIrrigate = sensorData.moisture1 < IRRIGATION_THRESHOLD_S1;
        break;
      case 'sensor2':
        shouldIrrigate = sensorData.moisture2 < IRRIGATION_THRESHOLD_S2;
        break;
      case 'both':
        shouldIrrigate = sensorData.moisture1 < IRRIGATION_THRESHOLD_S1 || 
                        sensorData.moisture2 < IRRIGATION_THRESHOLD_S2;
        break;
    }
    
    setIsIrrigationActive(shouldIrrigate);
  }
}, [sensorData?.moisture1, sensorData?.moisture2, IRRIGATION_THRESHOLD_S1, IRRIGATION_THRESHOLD_S2, irrigationSettings.sensorPriority]);

  // Initial data load - separate from the refresh cycle
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch data
        const sensors = await fetchSensorData();
        const weather = await fetchWeatherData();

        // Set current weather and sensor data
        setWeatherData(weather);
        const latest = sensors[sensors.length - 1];
        const currentSensorData = {
          moisture1: latest.sensor1,
          moisture2: latest.sensor2,
          temperature: weather.temperature,
          humidity: weather.humidity,
        };
        
        setSensorData(currentSensorData);

        

        // Process historical data
        const formattedData = sensors.map((entry) => {
          const entryDate = new Date(entry.timestamp);
          const monthWeek = getMonthWeek(entryDate);
          
          return {
            timestamp: entry.timestamp,
            time: entryDate.toLocaleString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              day: "numeric",
              month: "short"
            }),
            moisture1: entry.sensor1,
            moisture2: entry.sensor2,
            date: entryDate,
            month: entryDate.getMonth(),
            year: entryDate.getFullYear(),
            monthName: entryDate.toLocaleString("en-IN", { month: "long" }),
            weekNum: getWeekNumber(entryDate),
            monthWeek: monthWeek,
            dayOfMonth: entryDate.getDate(),
            formattedDate: entryDate.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short"
            })
          };
        });

        setHistoricalData(formattedData);

        // Process months
        const monthsMap = new Map<string, MonthOption>();
        formattedData.forEach(entry => {
          const key = `${entry.year}-${entry.month}`;
          if (!monthsMap.has(key)) {
            monthsMap.set(key, {
              id: key,
              name: `${entry.monthName} ${entry.year}`,
              month: entry.month,
              year: entry.year
            });
          }
        });
        
        const monthsList = Array.from(monthsMap.values());
        monthsList.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.month - b.month;
        });
        
        setAvailableMonths(monthsList);
        
        // Process daily average data
        const weekMap = new Map<string, FormattedSensorData[]>();
        formattedData.forEach((d) => {
          const day = new Date(d.timestamp).toDateString();
          if (!weekMap.has(day)) weekMap.set(day, []);
          weekMap.get(day)?.push(d);
        });
        
        const dailyAvgData = Array.from(weekMap.entries()).map(([day, entries]) => {
          const m1 = entries.reduce((sum, e) => sum + e.moisture1, 0) / entries.length;
          const m2 = entries.reduce((sum, e) => sum + e.moisture2, 0) / entries.length;
          const entryDate = new Date(entries[0].timestamp);
          return { 
            timestamp: entries[0].timestamp,
            time: day.slice(4, 10), 
            moisture1: m1, 
            moisture2: m2,
            date: entryDate,
            month: entryDate.getMonth(),
            year: entryDate.getFullYear(),
            monthName: entries[0].monthName,
            weekNum: getWeekNumber(entryDate),
            monthWeek: entries[0].monthWeek,
            dayOfMonth: entryDate.getDate(),
            formattedDate: entries[0].formattedDate
          };
        });
        
        setWeeklyData(dailyAvgData);

        // Process monthly average data
        const monthlyMap = new Map<string, FormattedSensorData[]>();
        dailyAvgData.forEach((d) => {
          const key = `${d.year}-${d.month}-Week${d.monthWeek}`;
          if (!monthlyMap.has(key)) monthlyMap.set(key, []);
          monthlyMap.get(key)?.push(d);
        });
        
        const monthlyAvgData = Array.from(monthlyMap.entries()).map(([weekKey, entries]) => {
          const m1 = entries.reduce((sum, e) => sum + e.moisture1, 0) / entries.length;
          const m2 = entries.reduce((sum, e) => sum + e.moisture2, 0) / entries.length;
          return { 
            time: `Week ${entries[0].monthWeek}`, 
            moisture1: m1, 
            moisture2: m2,
            weekNum: entries[0].weekNum,
            monthWeek: entries[0].monthWeek,
            year: entries[0].year,
            month: entries[0].month
          };
        });

        setMonthlyData(monthlyAvgData);
        
        // Set initial selections if not already set
        if (!dataInitialized.current) {
          const currentDate = new Date();
          const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
          // Find most appropriate month (current or most recent)
          const monthExists = monthsList.some(m => m.id === currentMonthKey);
          if (monthExists) {
            setSelectedMonth(currentMonthKey);
          } else if (monthsList.length > 0) {
            setSelectedMonth(monthsList[monthsList.length - 1].id);
          }
          
          dataInitialized.current = true;
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setIsLoading(false);
      }
    };

    loadInitialData();
    
    // Set up a refresh cycle for only the live data
    const refreshInterval = setInterval(async () => {
      try {
        // Update current sensor values and weather
        const weather = await fetchWeatherData();
        const sensors = await fetchSensorData();
        const latest = sensors[sensors.length - 1];
        
        setWeatherData(prev => ({ 
          ...weather
        }));
        
        const updatedSensorData = {
          moisture1: latest.sensor1,
          moisture2: latest.sensor2, 
          temperature: weather.temperature,
          humidity: weather.humidity
        };
        
        setSensorData(updatedSensorData);
        
        // Update irrigation status based on current moisture level
        // Note: The useEffect above will handle this automatically when sensorData updates
        
      } catch (error) {
        console.error("Error updating sensor data:", error);
      }
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Handle month selection change
  useEffect(() => {
    if (selectedMonth && historicalData.length > 0) {
      const [yearStr, monthStr] = selectedMonth.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      
      // Filter daily data for the selected month
      const filteredDaily = historicalData.filter(
        entry => entry.year === year && entry.month === month
      );
      setFilteredDailyData(filteredDaily);
      
      // Update available days for the selected month - ensure unique days
      const daysInMonth = new Map<string, DayOption>();
      filteredDaily.forEach(entry => {
        // Use just the date part for the key to ensure uniqueness (YYYY-MM-DD)
        const dateKey = new Date(entry.date).toISOString().split('T')[0];
        if (!daysInMonth.has(dateKey)) {
          daysInMonth.set(dateKey, {
            id: dateKey,
            // Format date as "D MMM" (e.g., "17 May") instead of using formattedDate to ensure consistency
            name: new Date(dateKey).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short"
            }),
            timestamp: entry.timestamp,
            date: new Date(dateKey) // Use dateKey to ensure consistent date object
          });
        }
      });
      
      const daysList = Array.from(daysInMonth.values());
      // Sort days chronologically
      daysList.sort((a, b) => a.date.getTime() - b.date.getTime());
      setAvailableDays(daysList);
      
      // Set the first day as default if none selected and days are available
      if (selectedDay === "" && daysList.length > 0) {
        setSelectedDay("current");
      }
      
      // Filter weekly data for the selected month
      const filteredWeekly = weeklyData.filter(
        entry => entry.year === year && entry.month === month
      );
      setFilteredWeeklyData(filteredWeekly);
      
      // Update available weeks for the selected month based on monthWeek
      const weeksInMonth = new Map<string, WeekOption>();
      filteredWeekly.forEach(entry => {
        const weekKey = `${entry.year}-${entry.month}-Week${entry.monthWeek}`;
        if (!weeksInMonth.has(weekKey)) {
          weeksInMonth.set(weekKey, {
            id: weekKey,
            name: `Week ${entry.monthWeek}`,
            weekNum: entry.monthWeek, // Using month-relative week number
            year: entry.year
          });
        }
      });
      
      const weeksList = Array.from(weeksInMonth.values());
      // Sort weeks numerically
      weeksList.sort((a, b) => a.weekNum - b.weekNum);
      setAvailableWeeks(weeksList);
      
      // Set the first week as default if none selected and weeks are available
      if (selectedWeek === "" && weeksList.length > 0) {
        setSelectedWeek(weeksList[0].id);
      }
    }
  }, [selectedMonth, historicalData, weeklyData]);

  // Filter daily data when day changes
  useEffect(() => {
    if (selectedDay === "current") {
      // Show all days of the month
      setFilteredDayData(filteredDailyData);
    } else if (selectedDay && filteredDailyData.length > 0) {
      const dayDate = new Date(selectedDay);
      
      // Filter the daily data for the selected day
      const dayData = filteredDailyData.filter(entry => 
        entry.date.getDate() === dayDate.getDate() &&
        entry.date.getMonth() === dayDate.getMonth() &&
        entry.date.getFullYear() === dayDate.getFullYear()
      );
      
      setFilteredDayData(dayData);
    } else {
      setFilteredDayData(filteredDailyData);
    }
  }, [selectedDay, filteredDailyData]);

  // Filter weekly data when week changes
  useEffect(() => {
    if (selectedWeek && selectedWeek !== "current" && weeklyData.length > 0) {
      // Example week format: "2023-4-Week2"
      const weekParts = selectedWeek.split('-Week');
      if (weekParts.length === 2) {
        const [yearMonth, weekNum] = weekParts;
        const [year, month] = yearMonth.split('-').map(Number);
        const weekNumber = parseInt(weekNum);
        
        // Filter weekly data for the selected month-relative week
        const filteredByWeek = weeklyData.filter(
          entry => entry.year === year && 
                  entry.month === month && 
                  entry.monthWeek === weekNumber
        );
        
        setFilteredWeeklyData(filteredByWeek);
      }
    }
  }, [selectedWeek, weeklyData]);

  const waterUsageData = [
    { name: 'Morning', value: 35 },
    { name: 'Afternoon', value: 45 },
    { name: 'Evening', value: 20 },
  ];

  const WATER_COLORS = ['#0088FE', '#76C2EB', '#4299E1'];
  const MOISTURE_COLORS = ['#00C49F', '#FFBB28'];

  if (isLoading || !sensorData || !weatherData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="w-screen-fit space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center space-x-2">
          {/* Fixed: Irrigation badge now shows proper status based on moisture level */}
          <Badge 
            variant={isIrrigationActive ? "default" : "outline"} 
            className={`py-1 ${isIrrigationActive ? "bg-green-600 hover:bg-green-700" : ""}`}
          >
            <PowerIcon className={`h-3.5 w-3.5 mr-1 ${isIrrigationActive ? "text-green-100" : ""}`} />
            Irrigation {isIrrigationActive ? "Active" : "Inactive"}
            {isIrrigationActive && (
  <span className="ml-1 text-xs">
    ({irrigationSettings.sensorPriority === 'sensor1' && `${sensorData.moisture1.toFixed(1)}% < ${IRRIGATION_THRESHOLD_S1}%`}
    {irrigationSettings.sensorPriority === 'sensor2' && `${sensorData.moisture2.toFixed(1)}% < ${IRRIGATION_THRESHOLD_S2}%`}
    {irrigationSettings.sensorPriority === 'both' && 'Multi-sensor trigger'})
  </span>
)}
          </Badge>
          
          {sensorData.moisture1 < LOW_MOISTURE_THRESHOLD_S1 && (
  <Badge variant="destructive" className="py-1">
    <AlertTriangleIcon className="h-3.5 w-3.5 mr-1" />
    Sensor 1 Low ({sensorData.moisture1.toFixed(1)}%)
  </Badge>
)}
{sensorData.moisture2 < LOW_MOISTURE_THRESHOLD_S2 && (
  <Badge variant="destructive" className="py-1">
    <AlertTriangleIcon className="h-3.5 w-3.5 mr-1" />
    Sensor 2 Low ({sensorData.moisture2.toFixed(1)}%)
  </Badge>
)}
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Soil Moisture Sensor 1 - Enhanced with irrigation indicator */}
        <Card className={`${isIrrigationActive ? "ring-2 ring-green-500 ring-opacity-50" : ""}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Soil Moisture Sensor 1
              {isIrrigationActive && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Triggering Irrigation
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
  Depth Embedded • Threshold: {IRRIGATION_THRESHOLD_S1}% • Alert: {LOW_MOISTURE_THRESHOLD_S1}%
</CardDescription>
          </CardHeader>
          <CardContent>
            <SensorGauge 
              value={sensorData.moisture1} 
              min={0} 
              max={100} 
              label="%" 
              threshold={IRRIGATION_THRESHOLD_S2}
            />
            <div className="mt-2 text-sm text-gray-600">
  {sensorData.moisture2 < IRRIGATION_THRESHOLD_S2 ? (
    <span className="text-orange-600 font-medium">
      ⚠️ Below irrigation threshold
    </span>
  ) : sensorData.moisture2 >= moistureSettings.sensor2.optimalMin && sensorData.moisture2 <= moistureSettings.sensor2.optimalMax ? (
    <span className="text-green-600">
      ✓ Within optimal range ({moistureSettings.sensor2.optimalMin}%-{moistureSettings.sensor2.optimalMax}%)
    </span>
  ) : (
    <span className="text-blue-600">
      ℹ️ Above irrigation threshold
    </span>
  )}
</div>
          </CardContent>
        </Card>
        
        {/* Soil Moisture Sensor 2 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Soil Moisture Sensor 2</CardTitle>
            <CardDescription>Root Zone • Threshold: {IRRIGATION_THRESHOLD_S2}% • Alert: {LOW_MOISTURE_THRESHOLD_S2}%</CardDescription>
          </CardHeader>
          <CardContent>
            <SensorGauge 
              value={sensorData.moisture2} 
              min={0} 
              max={100} 
              label="%" 
              threshold={IRRIGATION_THRESHOLD_S2}
            />
          </CardContent>
        </Card>
        
        {/* Weather Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Current Weather</CardTitle>
            <CardDescription>{weatherData.location}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CloudIcon className="h-10 w-10 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{weatherData.temperature}°C</p>
                  <p className="text-muted-foreground">{weatherData.condition}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end text-muted-foreground">
                  <DropletIcon className="mr-1 h-4 w-4" />
                  <span>{weatherData.humidity}%</span>
                </div>
                <div className="flex items-center justify-end text-muted-foreground mt-1">
                  <ThermometerIcon className="mr-1 h-4 w-4" />
                  <span>{weatherData.feelsLike}°C feels like</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-7">
        {/* Sensor History Chart */}
        <Card className="md:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle>Sensor History</CardTitle>
              <Select 
                value={selectedMonth} 
                onValueChange={setSelectedMonth}
                disabled={availableMonths.length === 0}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map((month) => (
                    <SelectItem key={month.id} value={month.id}>
                      {month.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Tabs defaultValue="day" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
              <TabsContent value="day">
                <div className="flex justify-end mb-2">
                  <Select 
                    value={selectedDay} 
                    onValueChange={setSelectedDay}
                    disabled={availableDays.length === 0}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">All Days</SelectItem>
                      {availableDays.map((day) => (
                        <SelectItem key={day.id} value={day.id}>
                          {day.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {filteredDayData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={filteredDayData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="time" 
                        tickFormatter={(value) => {
                          // Extract just the time part for cleaner display
                          if (value && value.includes(',')) {
                            return value.split(', ')[1];
                          }
                          return value;
                        }}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        label={{ value: 'Moisture %', angle: -90, position: 'insideLeft' }} 
                      />
                      <Tooltip />
                      <Legend />
                      {/* Added reference line for irrigation threshold */}
                      <ReferenceLine y={IRRIGATION_THRESHOLD_S1} stroke="#ff6b6b" strokeDasharray="5 5" label="S1 Threshold" />
{irrigationSettings.sensorPriority !== 'sensor1' && (
  <ReferenceLine y={IRRIGATION_THRESHOLD_S2} stroke="#ff9999" strokeDasharray="3 3" label="S2 Threshold" />
)}
                      <Line 
                        type="monotone" 
                        dataKey="moisture1" 
                        name="Soil Moisture Sensor 1" 
                        stroke="#00C49F" 
                        strokeWidth={2} 
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="moisture2" 
                        name="Soil Moisture Sensor 2" 
                        stroke="#FFBB28" 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px]">
                    <p>No data available for this selection</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="week">
                <div className="flex justify-end mb-2">
                  <Select 
                    value={selectedWeek} 
                    onValueChange={setSelectedWeek}
                    disabled={availableWeeks.length === 0}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Week" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableWeeks.map((week) => (
                        <SelectItem key={week.id} value={week.id}>
                          {week.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {filteredWeeklyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={filteredWeeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="formattedDate" />
                      <YAxis 
                        domain={[0, 100]} 
                        label={{ value: 'Moisture %', angle: -90, position: 'insideLeft' }} 
                      />
                      <Tooltip />
                      <Legend />
                      {/* Added reference line for irrigation threshold */}
                      <ReferenceLine y={IRRIGATION_THRESHOLD_S1} stroke="#ff6b6b" strokeDasharray="5 5" label="S1 Threshold" />
{irrigationSettings.sensorPriority !== 'sensor1' && (
  <ReferenceLine y={IRRIGATION_THRESHOLD_S2} stroke="#ff9999" strokeDasharray="3 3" label="S2 Threshold" />
)}
                      <Line 
                        type="monotone" 
                        dataKey="moisture1" 
                        name="Soil Moisture Sensor 1" 
                        stroke="#00C49F" 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="moisture2" 
                        name="Soil Moisture Sensor 2" 
                        stroke="#FFBB28" 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px]">
                    <p>No data available for this week</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="month">
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData.filter(data => {
                      if (selectedMonth) {
                        const [yearStr, monthStr] = selectedMonth.split('-');
                        const year = parseInt(yearStr);
                        const month = parseInt(monthStr);
                        return data.year === year && data.month === month;
                      }
                      return true;
                    })}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis 
                        domain={[0, 100]} 
                        label={{ value: 'Avg Moisture %', angle: -90, position: 'insideLeft' }} 
                      />
                      <Tooltip />
                      <Legend />
                      {/* Added reference line for irrigation threshold */}
                      <ReferenceLine y={IRRIGATION_THRESHOLD_S1} stroke="#ff6b6b" strokeDasharray="5 5" label="S1 Threshold" />
{irrigationSettings.sensorPriority !== 'sensor1' && (
  <ReferenceLine y={IRRIGATION_THRESHOLD_S2} stroke="#ff9999" strokeDasharray="3 3" label="S2 Threshold" />
)}
                      <Line 
                        type="monotone" 
                        dataKey="moisture1" 
                        name="Avg Soil Moisture Sensor 1" 
                        stroke="#00C49F" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="moisture2" 
                        name="Avg Soil Moisture Sensor 2" 
                        stroke="#FFBB28" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px]">
                    <p>No data available for this month</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
        
        {/* Irrigation Stats */}
        {/* Irrigation Stats */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Irrigation Status</CardTitle>
            <CardDescription>
  Smart irrigation based on {irrigationSettings.sensorPriority === 'both' ? 'both sensors' : 
  irrigationSettings.sensorPriority === 'sensor1' ? 'Soil Moisture Sensor 1' : 'Soil Moisture Sensor 2'}
</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Enhanced Irrigation Status Display */}
            <div className="space-y-4">
              {/* Current Status */}
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2 text-foreground">Current Status</h4>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Irrigation System:</span>
                  <Badge 
                    variant={isIrrigationActive ? "default" : "outline"}
                    className={isIrrigationActive ? "bg-green-600 text-white hover:bg-green-700" : ""}
                  >
                    {isIrrigationActive ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </div>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Sensor 1 Level:</span>
                    <span className={`font-medium ${sensorData.moisture1 < IRRIGATION_THRESHOLD_S1 ? "text-orange-500" : "text-green-500"}`}>
                      {sensorData.moisture1.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Sensor 2 Level:</span>
                    <span className={`font-medium ${sensorData.moisture2 < IRRIGATION_THRESHOLD_S2 ? "text-orange-500" : "text-green-500"}`}>
                      {sensorData.moisture2.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* System Thresholds */}
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium mb-2 text-foreground">System Thresholds</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sensor 1 Irrigation:</span>
                    <span className="font-medium text-orange-500">&lt; {IRRIGATION_THRESHOLD_S1}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sensor 2 Irrigation:</span>
                    <span className="font-medium text-orange-500">&lt; {IRRIGATION_THRESHOLD_S2}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sensor 1 Alert:</span>
                    <span className="font-medium text-red-500">&lt; {LOW_MOISTURE_THRESHOLD_S1}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sensor 2 Alert:</span>
                    <span className="font-medium text-red-500">&lt; {LOW_MOISTURE_THRESHOLD_S2}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sensor Priority:</span>
                    <span className="font-medium text-blue-500 capitalize">{irrigationSettings.sensorPriority}</span>
                  </div>
                </div>
              </div>

              {/* System Logic */}
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800">
                <h4 className="font-medium mb-2 text-foreground">Smart Logic</h4>
                <p className="text-sm text-muted-foreground">
                  Irrigation automatically activates based on {irrigationSettings.sensorPriority} priority. 
                  Duration: {irrigationSettings.duration} minutes. Re-irrigation delay: {irrigationSettings.reIrrigationDelay} minutes.
                  {irrigationSettings.weatherIntegration && " Weather integration enabled."}
                </p>
                {isIrrigationActive && (
                  <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 rounded text-sm">
                    <span className="font-medium text-green-800 dark:text-green-200">
                      🌱 Currently irrigating: 
                      {irrigationSettings.sensorPriority === 'sensor1' && ` Sensor 1 at ${sensorData.moisture1.toFixed(1)}% < ${IRRIGATION_THRESHOLD_S1}%`}
                      {irrigationSettings.sensorPriority === 'sensor2' && ` Sensor 2 at ${sensorData.moisture2.toFixed(1)}% < ${IRRIGATION_THRESHOLD_S2}%`}
                      {irrigationSettings.sensorPriority === 'both' && ` Multi-sensor trigger activated`}
                    </span>
                  </div>
                )}
              </div>

              {/* Next Action */}
              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-medium mb-2 text-foreground">Next Action</h4>
                <p className="text-sm">
                  {isIrrigationActive ? (
                    <span className="text-orange-600 dark:text-orange-400">
                      ⏳ System will stop irrigation in {irrigationSettings.duration} minutes or when moisture levels recover
                    </span>
                  ) : (
                    <span className="text-green-600 dark:text-green-400">
                      ✓ System monitoring {irrigationSettings.sensorPriority} sensor(s). Next check in 30 seconds.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;