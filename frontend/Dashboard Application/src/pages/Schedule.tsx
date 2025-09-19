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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, X, Edit2, Check, Minimize2, CheckCircle2 } from 'lucide-react';
import { format, isBefore, isToday, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { notifyActivityCompleted, notifyActivityScheduled } from '@/lib/api';

interface IScheduleItem {
  id: string;
  title: string;
  description: string;
  date: Date;
  activity: string;
  isCompleted?: boolean;
  completedBy?: string;
  completedAt?: Date;
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
  },
  {
    id: '4',
    title: 'Harvest Tomatoes',
    description: 'Harvest ripe tomatoes from greenhouse section A',
    date: new Date(),
    activity: 'harvest',
    isCompleted: true,
    completedBy: 'John Farmer',
    completedAt: new Date()
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<IScheduleItem | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [expandedActivityIndex, setExpandedActivityIndex] = useState<number | null>(null);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);
  const [activityToComplete, setActivityToComplete] = useState<string | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [activity, setActivity] = useState('');
  
  // Completion form states
  const [farmerName, setFarmerName] = useState('');
  const [completionDateTime, setCompletionDateTime] = useState(new Date());
  
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
    setIsAddDialogOpen(false);
    resetForm();
    
    toast({
      title: 'Schedule added',
      description: `${title} has been scheduled for ${format(date, 'PPP')}`,
    });

    // Fire WhatsApp notification (best-effort)
    notifyActivityScheduled({
      activityName: title,
      activityType: activity,
      date,
      description,
      scheduledBy: 'Farmer',
    }).then((resp) => {
      if (!resp?.success && (resp?.twilioCode === 63016 || resp?.error === 'WHATSAPP_FREEFORM_WINDOW_CLOSED')) {
        toast({
          title: 'WhatsApp session not active',
          description: 'Open a 24h session by sending a message to the Twilio WhatsApp number, then try again. For Sandbox, send your join code in WhatsApp to the sandbox number.',
          variant: 'destructive',
        });
      }
    }).catch(() => {});
  };

  const handleEditSchedule = () => {
    if (!selectedActivity || !title || !activity || !date) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const updatedItems = scheduleItems.map(item => 
      item.id === selectedActivity.id 
        ? { ...item, title, description, date, activity }
        : item
    );

    setScheduleItems(updatedItems);
    setIsEditDialogOpen(false);
    setSelectedActivity(null);
    setExpandedActivityIndex(null);
    resetForm();
    
    toast({
      title: 'Schedule updated',
      description: 'The activity has been successfully updated',
    });
  };

  const handleDeleteSchedule = () => {
    if (!activityToDelete) return;
    
    setScheduleItems(scheduleItems.filter(item => item.id !== activityToDelete));
    setIsDeleteDialogOpen(false);
    setActivityToDelete(null);
    setSelectedActivity(null);
    setExpandedActivityIndex(null);
    
    toast({
      title: 'Schedule removed',
      description: 'The scheduled activity has been removed',
    });
  };

  const handleCompleteActivity = () => {
    if (!activityToComplete || !farmerName) {
      toast({
        title: 'Missing information',
        description: 'Please enter farmer name',
        variant: 'destructive',
      });
      return;
    }

    const updatedItems = scheduleItems.map(item => 
      item.id === activityToComplete 
        ? { 
            ...item, 
            isCompleted: true, 
            completedBy: farmerName, 
            completedAt: completionDateTime 
          }
        : item
    );

    setScheduleItems(updatedItems);
    setIsCompleteDialogOpen(false);
    setActivityToComplete(null);
    setSelectedActivity(null);
    setExpandedActivityIndex(null);
    setFarmerName('');
    setCompletionDateTime(new Date());
    
    toast({
      title: 'Activity completed',
      description: 'The activity has been marked as completed',
    });

    // Send completion notification (best-effort)
    const completed = scheduleItems.find(i => i.id === activityToComplete);
    if (completed) {
      notifyActivityCompleted({
        activityName: completed.title,
        completedBy: farmerName,
        completedTime: completionDateTime,
      }).then((resp) => {
        if (!resp?.success && (resp?.twilioCode === 63016 || resp?.error === 'WHATSAPP_FREEFORM_WINDOW_CLOSED')) {
          toast({
            title: 'WhatsApp session not active',
            description: 'Open a 24h session by sending a message to the Twilio WhatsApp number, then try again. For Sandbox, send your join code in WhatsApp to the sandbox number.',
            variant: 'destructive',
          });
        }
      }).catch(() => {});
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate(new Date());
    setActivity('');
  };

  const openEditDialog = (item: IScheduleItem) => {
    setSelectedActivity(item);
    setTitle(item.title);
    setDescription(item.description);
    setDate(item.date);
    setActivity(item.activity);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setActivityToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const openCompleteDialog = (id: string) => {
    setActivityToComplete(id);
    setIsCompleteDialogOpen(true);
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

  const getActivitiesForDate = (date: Date) => {
    return scheduleItems.filter(item => isSameDay(item.date, date));
  };

  const generateCalendarDays = () => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  };

  const calendarDays = generateCalendarDays();
  const activitiesForSelectedDate = selectedDate ? getActivitiesForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Farm Schedule</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSchedule}>Add Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar Timesheet View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Farm Activity Calendar</span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
              >
                Previous
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
              >
                Next
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dayActivities = getActivitiesForDate(day);
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              
              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[80px] p-1 border rounded cursor-pointer transition-colors",
                    isCurrentMonth ? "bg-background" : "bg-muted/30",
                    isSelected ? "ring-2 ring-primary" : "hover:bg-muted/50",
                    isToday(day) && "bg-primary/10 border-primary"
                  )}
                  onClick={() => {
                    setSelectedDate(day);
                    // Close any open activity card when selecting a different date
                    setSelectedActivity(null);
                    setExpandedActivityIndex(null);
                  }}
                >
                  <div className={cn(
                    "text-sm font-medium mb-1",
                    !isCurrentMonth && "text-muted-foreground",
                    isToday(day) && "text-primary font-bold"
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayActivities.slice(0, 2).map(activity => (
                      <div
                        key={activity.id}
                        className={cn(
                          "text-xs p-1 rounded text-center relative",
                          getActivityColor(activity.activity)
                        )}
                      >
                        {activity.isCompleted && (
                          <CheckCircle2 className="absolute -top-1 -right-1 h-3 w-3 text-green-600 bg-white rounded-full" />
                        )}
                        {activity.title.length > 15 ? `${activity.title.substring(0, 15)}...` : activity.title}
                      </div>
                    ))}
                    {dayActivities.length > 2 && (
                      <div className="text-xs text-center text-muted-foreground">
                        +{dayActivities.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Activities */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Activities for {format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSelectedDate(null);
                  setSelectedActivity(null);
                  setExpandedActivityIndex(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesForSelectedDate.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No activities scheduled for this date.
              </p>
            ) : (
              <div className="space-y-2">
                {activitiesForSelectedDate.map((activity, index) => (
                  <div key={activity.id}>
                    {/* Activity Title Row */}
                    <div
                      className={cn(
                        "p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors relative",
                        activity.isCompleted && "bg-green-50 border-green-200",
                        expandedActivityIndex === index && "border-primary border-2"
                      )}
                      onClick={() => {
                        if (expandedActivityIndex === index) {
                          // If clicking on the same activity, close it
                          setExpandedActivityIndex(null);
                          setSelectedActivity(null);
                        } else {
                          // Open this activity and close any other
                          setExpandedActivityIndex(index);
                          setSelectedActivity(activity);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {activity.isCompleted && (
                            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                              <CheckCircle2 className="h-3 w-3" />
                              Marked as Completed
                            </div>
                          )}
                          <span className="font-medium">{activity.title}</span>
                        </div>
                        <div className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          getActivityColor(activity.activity)
                        )}>
                          {getActivityLabel(activity.activity)}
                        </div>
                      </div>
                    </div>

                    {/* Activity Detail Card - Appears right below the clicked activity */}
                    {expandedActivityIndex === index && selectedActivity?.id === activity.id && (
                      <Card className="border-2 border-primary mt-2 shadow-lg">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {selectedActivity.isCompleted && (
                                  <div className="flex items-center gap-1 text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Marked as Completed
                                  </div>
                                )}
                                {selectedActivity.title}
                              </CardTitle>
                              <CardDescription>
                                {format(selectedActivity.date, "EEEE, MMMM d, yyyy")}
                                {isToday(selectedActivity.date) && " (Today)"}
                              </CardDescription>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedActivity(null);
                                setExpandedActivityIndex(null);
                              }}
                            >
                              <Minimize2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-1">Activity Type</h4>
                              <div className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                getActivityColor(selectedActivity.activity)
                              )}>
                                {getActivityLabel(selectedActivity.activity)}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-1">Description</h4>
                              <p className="text-sm text-muted-foreground">
                                {selectedActivity.description || 'No description provided'}
                              </p>
                            </div>

                            {selectedActivity.isCompleted && (
                              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                <h4 className="font-medium mb-2 text-green-800">Completion Details</h4>
                                <p className="text-sm text-green-700">
                                  <strong>Completed by:</strong> {selectedActivity.completedBy}
                                </p>
                                <p className="text-sm text-green-700">
                                  <strong>Completed at:</strong> {selectedActivity.completedAt ? format(selectedActivity.completedAt, 'PPP p') : 'N/A'}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(selectedActivity);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(selectedActivity.id);
                            }}
                            className="flex items-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            Delete
                          </Button>
                          {!selectedActivity.isCompleted && (
                            <Button 
                              onClick={(e) => {
                                e.stopPropagation();
                                openCompleteDialog(selectedActivity.id);
                              }}
                              className="flex items-center gap-2"
                            >
                              <Check className="h-4 w-4" />
                              Activity Done
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Activity Detail Card - Now removed since it's inline */}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>
              Make changes to your scheduled activity.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Activity title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-activity">Activity Type</Label>
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
              <Label htmlFor="edit-date">Date</Label>
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
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter details about this activity"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSchedule}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this activity?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the scheduled activity.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSchedule}>
              Delete Activity
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activity Completion Dialog */}
      <AlertDialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Activity as Completed</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this activity as completed? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="farmer-name">Farmer Name</Label>
              <Input
                id="farmer-name"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                placeholder="Enter farmer name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="completion-date">Completion Date & Time</Label>
              <Input
                id="completion-date"
                type="datetime-local"
                value={format(completionDateTime, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setCompletionDateTime(new Date(e.target.value))}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsCompleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteActivity}>
              Mark as Completed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Schedule;