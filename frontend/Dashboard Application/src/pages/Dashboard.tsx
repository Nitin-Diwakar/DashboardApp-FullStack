import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropletIcon,
  ThermometerIcon,
  CloudIcon,
  PowerIcon,
  AlertTriangleIcon
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
  Legend
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
        setSensorData({
          moisture1: latest.sensor1,
          moisture2: latest.sensor2,
          temperature: weather.temperature,
          humidity: weather.humidity,
        });

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
        
        setIsIrrigationActive(Math.random() > 0.7);
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
        // Just update current sensor values, not historical data
        const weather = await fetchWeatherData();
        const sensors = await fetchSensorData();
        const latest = sensors[sensors.length - 1];
        
        setWeatherData(prev => ({ 
          ...weather
        }));
        
        setSensorData(prev => ({
          moisture1: latest.sensor1,
          moisture2: latest.sensor2, 
          temperature: weather.temperature,
          humidity: weather.humidity
        }));
        
        // Only update irrigation status
        setIsIrrigationActive(Math.random() > 0.7);
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
          <Badge variant={isIrrigationActive ? "default" : "outline"} className="py-1">
            <PowerIcon className={`h-3.5 w-3.5 mr-1 ${isIrrigationActive ? "text-green-400" : ""}`} />
            Irrigation {isIrrigationActive ? "Active" : "Inactive"}
          </Badge>
          {sensorData.moisture1 < 30 && (
            <Badge variant="destructive" className="py-1">
              <AlertTriangleIcon className="h-3.5 w-3.5 mr-1" />
              Low Moisture Alert
            </Badge>
          )}
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Soil Moisture Sensor 1 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Soil Moisture Sensor 1</CardTitle>
            <CardDescription>Depth Embedded</CardDescription>
          </CardHeader>
          <CardContent>
            <SensorGauge 
              value={sensorData.moisture1} 
              min={0} 
              max={100} 
              label="%" 
              threshold={30}
            />
          </CardContent>
        </Card>
        
        {/* Soil Moisture Sensor 2 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Soil Moisture Sensor 2</CardTitle>
            <CardDescription>Root Zone</CardDescription>
          </CardHeader>
          <CardContent>
            <SensorGauge 
              value={sensorData.moisture2} 
              min={0} 
              max={100} 
              label="%" 
              threshold={30}
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
            <CardTitle>Irrigation Statistics</CardTitle>
            {/* <CardDescription>Water usage patterns</CardDescription> */}
            
          </CardHeader>
          <CardDescription className='font-semibold text-center text-2xl' >Work in progress</CardDescription>
          {/* <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={waterUsageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {waterUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={WATER_COLORS[index % WATER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} liters`, 'Water Usage']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Last irrigation</p>
                <p className="font-medium">Today, 09:24 AM</p>
              </div>
              <div>
                <p className="text-muted-foreground">Water used today</p>
                <p className="font-medium">125 liters</p>
              </div>
              <div>
                <p className="text-muted-foreground">Irrigation events</p>
                <p className="font-medium">3 times today</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className={`font-medium ${isIrrigationActive ? "text-green-600" : "text-muted-foreground"}`}>
                  {isIrrigationActive ? "Running" : "Idle"}
                </p>
              </div>
            </div>
          </CardContent> */}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;