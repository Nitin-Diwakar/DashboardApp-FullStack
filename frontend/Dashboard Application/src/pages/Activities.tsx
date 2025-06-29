import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, subDays } from 'date-fns';
import { 
  DropletIcon, 
  CalendarIcon, 
  InfoIcon, 
  AlertTriangleIcon, 
  CheckIcon,
  CloudIcon,
  PowerIcon,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for activity logs
interface ActivityLog {
  id: string;
  type: 'irrigation' | 'alert' | 'schedule' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  status?: 'success' | 'warning' | 'error' | 'info';
}

// Mock activity data
const generateMockActivities = (): ActivityLog[] => {
  const now = new Date();
  return [
    {
      id: '1',
      type: 'irrigation',
      title: 'Irrigation Activated',
      description: 'Field Section A irrigation started automatically due to low moisture levels.',
      timestamp: subDays(now, 0),
      status: 'success'
    },
    {
      id: '2',
      type: 'alert',
      title: 'Low Battery Warning',
      description: 'Soil Moisture Sensor 2 battery level is below 20%. Please replace soon.',
      timestamp: subDays(now, 0),
      status: 'warning'
    },
    {
      id: '3',
      type: 'schedule',
      title: 'Scheduled Fertilization',
      description: 'Reminder: Apply nitrogen fertilizer to corn field tomorrow.',
      timestamp: subDays(now, 1),
      status: 'info'
    },
    {
      id: '4',
      type: 'irrigation',
      title: 'Irrigation Completed',
      description: 'Field Section B irrigation completed. Duration: 45 minutes.',
      timestamp: subDays(now, 1),
      status: 'success'
    },
    {
      id: '5',
      type: 'alert',
      title: 'Sensor Malfunction',
      description: 'Temperature and humidity sensor not responding. Check connection.',
      timestamp: subDays(now, 2),
      status: 'error'
    },
    {
      id: '6',
      type: 'info',
      title: 'System Update',
      description: 'Irrigation system firmware updated to version 2.1.4',
      timestamp: subDays(now, 3),
      status: 'info'
    },
    {
      id: '7',
      type: 'irrigation',
      title: 'Irrigation Skipped',
      description: 'Scheduled irrigation skipped due to rainfall detection.',
      timestamp: subDays(now, 4),
      status: 'info'
    },
  ];
};

// Stats data for cards
interface StatsData {
  waterUsed: number;
  irrigationEvents: number;
  currentTemperature: number;
  motorStatus: boolean;
}

const Activities = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  const [statsData, setStatsData] = useState<StatsData>({
    waterUsed: 0,
    irrigationEvents: 0,
    currentTemperature: 0,
    motorStatus: false
  });
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    // Load mock data
    const mockActivities = generateMockActivities();
    setActivities(mockActivities);
    setFilteredActivities(mockActivities);
    
    // Set mock stats
    setStatsData({
      waterUsed: 450,
      irrigationEvents: 3,
      currentTemperature: 24,
      motorStatus: Math.random() > 0.7 // randomly set motor status
    });
  }, []);
  
  // Filter activities based on tab
  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredActivities(activities);
    } else {
      setFilteredActivities(activities.filter(activity => activity.type === activeTab));
    }
  }, [activeTab, activities]);

  // Get icon based on activity type
  const getActivityIcon = (type: string, status?: string) => {
    switch (type) {
      case 'irrigation':
        return <DropletIcon className={cn("h-4 w-4", status === 'success' ? "text-blue-500" : "text-gray-500")} />;
      case 'alert':
        return <AlertTriangleIcon className={cn("h-4 w-4", status === 'error' ? "text-red-500" : "text-yellow-500")} />;
      case 'schedule':
        return <CalendarIcon className="h-4 w-4 text-indigo-500" />;
      case 'info':
      default:
        return <InfoIcon className="h-4 w-4 text-gray-500" />;
    }
  };
  return(
    <div className="flex space-y-6  ">
      <div className='w-auto '>
        <h1 className='bg-slate-300 m-60 px-10 py-10 '>Work in progress</h1>
      </div>
    </div>
  );

  // return (
  //   <div className="space-y-6">
  //     <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
      
  //     Stats Cards
  //     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  //       {/* Water Usage Card */}
  //       <Card>
  //         <CardHeader className="pb-2">
  //           <CardTitle className="text-sm font-medium">Water Used (Today)</CardTitle>
  //         </CardHeader>
  //         <CardContent>
  //           <div className="flex items-center">
  //             <DropletIcon className="h-5 w-5 text-blue-500 mr-2" />
  //             <div className="text-2xl font-bold">{statsData.waterUsed} L</div>
  //           </div>
  //         </CardContent>
  //       </Card>
        
  //       {/* Irrigation Events Card */}
  //       <Card>
  //         <CardHeader className="pb-2">
  //           <CardTitle className="text-sm font-medium">Irrigation Events</CardTitle>
  //         </CardHeader>
  //         <CardContent>
  //           <div className="flex items-center">
  //             <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
  //             <div className="text-2xl font-bold">{statsData.irrigationEvents} today</div>
  //           </div>
  //         </CardContent>
  //       </Card>
        
  //       {/* Current Temperature Card */}
  //       <Card>
  //         <CardHeader className="pb-2">
  //           <CardTitle className="text-sm font-medium">Current Temperature</CardTitle>
  //         </CardHeader>
  //         <CardContent>
  //           <div className="flex items-center">
  //             <CloudIcon className="h-5 w-5 text-orange-500 mr-2" />
  //             <div className="text-2xl font-bold">{statsData.currentTemperature}°C</div>
  //           </div>
  //         </CardContent>
  //       </Card>
        
  //       {/* Motor Status Card */}
  //       <Card>
  //         <CardHeader className="pb-2">
  //           <CardTitle className="text-sm font-medium">Irrigation Motor</CardTitle>
  //         </CardHeader>
  //         <CardContent>
  //           <div className="flex items-center">
  //             <PowerIcon className={cn("h-5 w-5 mr-2", statsData.motorStatus ? "text-green-500" : "text-gray-500")} />
  //             <div className="text-2xl font-bold">{statsData.motorStatus ? "ON" : "OFF"}</div>
  //           </div>
  //         </CardContent>
  //       </Card>
  //     </div>
      
  //     {/* Activity Log */}
  //     <Card>
  //       <CardHeader className="pb-2">
  //         <div className="flex justify-between items-center">
  //           <CardTitle>Activity Log</CardTitle>
  //           <Button variant="outline" size="sm">
  //             <Download className="h-4 w-4 mr-2" />
  //             Export
  //           </Button>
  //         </div>
  //         <CardDescription>
  //           Recent farm activities and notifications
  //         </CardDescription>
  //       </CardHeader>
  //       <CardContent>
  //         <Tabs defaultValue="all" onValueChange={setActiveTab}>
  //           <TabsList className="mb-4">
  //             <TabsTrigger value="all">All Activities</TabsTrigger>
  //             <TabsTrigger value="irrigation">Irrigation</TabsTrigger>
  //             <TabsTrigger value="alert">Alerts</TabsTrigger>
  //             <TabsTrigger value="schedule">Schedules</TabsTrigger>
  //           </TabsList>
  //           <TabsContent value={activeTab} className="m-0">
  //             <ul className="space-y-4">
  //               {filteredActivities.length === 0 ? (
  //                 <li className="text-center py-4 text-muted-foreground">
  //                   No activities found
  //                 </li>
  //               ) : (
  //                 filteredActivities.map((activity) => (
  //                   <li 
  //                     key={activity.id}
  //                     className="flex items-start gap-4 rounded-lg border p-4"
  //                   >
  //                     <div className={cn(
  //                       "flex h-9 w-9 items-center justify-center rounded-full",
  //                       activity.status === 'success' ? "bg-green-100 dark:bg-green-900" :
  //                       activity.status === 'warning' ? "bg-yellow-100 dark:bg-yellow-900" :
  //                       activity.status === 'error' ? "bg-red-100 dark:bg-red-900" :
  //                       "bg-blue-100 dark:bg-blue-900"
  //                     )}>
  //                       {getActivityIcon(activity.type, activity.status)}
  //                     </div>
  //                     <div className="flex-1">
  //                       <h4 className="text-sm font-semibold">{activity.title}</h4>
  //                       <p className="text-sm text-muted-foreground mt-1">
  //                         {activity.description}
  //                       </p>
  //                       <p className="text-xs text-muted-foreground mt-2">
  //                         {format(activity.timestamp, "MMM dd, yyyy 'at' h:mm a")}
  //                       </p>
  //                     </div>
  //                     <Badge 
  //                       variant={
  //                         activity.status === 'success' ? "default" :
  //                         activity.status === 'warning' ? "outline" :
  //                         activity.status === 'error' ? "destructive" :
  //                         "secondary"
  //                       }
  //                     >
  //                       {activity.status}
  //                     </Badge>
  //                   </li>
  //                 ))
  //               )}
  //             </ul>
  //           </TabsContent>
  //         </Tabs>
  //       </CardContent>
  //     </Card>
  //   </div>
  // );
};

export default Activities;