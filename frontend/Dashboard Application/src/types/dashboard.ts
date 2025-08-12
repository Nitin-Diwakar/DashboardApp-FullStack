
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
  
  export interface MonthOption {
    id: string;
    name: string;
    month: number;
    year: number;
  }
  
  export interface WeekOption {
    id: string;
    name: string;
    weekNum: number;
    year: number;
  }
  
  export interface DayOption {
    id: string;
    name: string;
    timestamp: string;
    date: Date;
  }
  
  export interface MonthlyData {
    time: string;
    moisture1: number;
    moisture2: number;
    weekNum: number;
    monthWeek: number;
    year: number;
    month: number;
  }
  
  export interface DashboardState {
    selectedMonth: string;
    selectedWeek: string;
    selectedDay: string;
    availableMonths: MonthOption[];
    availableWeeks: WeekOption[];
    availableDays: DayOption[];
    filteredDailyData: FormattedSensorData[];
    filteredWeeklyData: FormattedSensorData[];
    filteredDayData: FormattedSensorData[];
  }
  
  export interface ChartDataProps {
    data: FormattedSensorData[] | MonthlyData[];
    isLoading?: boolean;
    isEmpty?: boolean;
  }
  
  export interface ThresholdValues {
    irrigation_s1: number;
    irrigation_s2: number;
    alert_s1: number;
    alert_s2: number;
  }