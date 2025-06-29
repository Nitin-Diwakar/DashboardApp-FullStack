import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format, isBefore, isToday, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface IScheduleItem {
  id: string;
  title: string;
  description: string;
  date: Date;
  activity: string;
}

// Dummy initial data
const initialScheduleItems: IScheduleItem[] = [
  {
    id: '1',
    title: 'Apply Nitrogen Fertilizer',
    description: 'Apply 20kg/acre of nitrogen fertilizer to corn field',
    date: addDays(new Date(), 2),
    activity: 'fertilizer'
  },
  {
    id: '2',
    title: 'Pest Control Application',
    description: 'Apply organic pesticide to protect against aphids',
    date: addDays(new Date(), 5),
    activity: 'pestControl'
  },
  {
    id: '3',
    title: 'Irrigation System Maintenance',
    description: 'Check and clean all irrigation nozzles and filters',
    date: addDays(new Date(), 7),
    activity: 'maintenance'
  }
];

const activityTypes = [
  { value: 'fertilizer', label: 'Fertilizer Application' },
  { value: 'pestControl', label: 'Pest Control' },
  { value: 'harvest', label: 'Harvest' },
  { value: 'planting', label: 'Planting' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'other', label: 'Other' }
];

const Schedule = () => {
  const [scheduleItems, setScheduleItems] = useState<IScheduleItem[]>(initialScheduleItems);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [activity, setActivity] = useState('');
  const { toast } = useToast();

  const handleAddSchedule = () => {
    if (!title || !activity || !date) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const newSchedule: IScheduleItem = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      description,
      date,
      activity
    };

    setScheduleItems([...scheduleItems, newSchedule]);
    setIsDialogOpen(false);
    resetForm();
    
    toast({
      title: 'Schedule added',
      description: `${title} has been scheduled for ${format(date, 'PPP')}`,
    });
  };

  const handleDeleteSchedule = (id: string) => {
    setScheduleItems(scheduleItems.filter(item => item.id !== id));
    
    toast({
      title: 'Schedule removed',
      description: 'The scheduled activity has been removed',
    });
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate(new Date());
    setActivity('');
  };

  const getActivityColor = (activity: string) => {
    switch (activity) {
      case 'fertilizer':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pestControl':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'harvest':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'planting':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'maintenance':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getActivityLabel = (value: string) => {
    return activityTypes.find(type => type.value === value)?.label || 'Other';
  };

  const filteredScheduleItems = scheduleItems.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Schedule</DialogTitle>
              <DialogDescription>
                Create a new activity schedule for your farm.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Activity title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="activity">Activity Type</Label>
                <Select value={activity} onValueChange={setActivity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(day) => day && setDate(day)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter details about this activity"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSchedule}>Add Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredScheduleItems.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-muted p-3">
              <CalendarIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No scheduled activities</h3>
            <p className="mb-4 text-sm text-muted-foreground max-w-md">
              You haven't scheduled any farm activities yet. Add your first schedule to get started.
            </p>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Schedule
              </Button>
            </DialogTrigger>
          </div>
        ) : (
          filteredScheduleItems.map((item) => (
            <Card key={item.id} className={cn(
              isBefore(new Date(), item.date) ? "" : "opacity-60"
            )}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-medium">{item.title}</CardTitle>
                    <CardDescription>
                      {format(item.date, "EEEE, MMMM d, yyyy")}
                      {isToday(item.date) && " (Today)"}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => handleDeleteSchedule(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                <div className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", getActivityColor(item.activity))}>
                  {getActivityLabel(item.activity)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Schedule;