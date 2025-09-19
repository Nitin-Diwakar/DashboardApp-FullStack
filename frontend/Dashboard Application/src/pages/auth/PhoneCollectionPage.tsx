import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth0Profile } from '@/hooks/useAuth0Profile';
import { Loader2, Phone, MessageSquare, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const phoneSchema = z.object({
  phoneNumber: z.string()
    .min(10, { message: 'Phone number must be at least 10 digits' })
    .max(20, { message: 'Phone number is too long' })
    .refine((val) => {
      // Remove all non-digits and check if we have at least 10 digits
      const digits = val.replace(/\D/g, '');
      return digits.length >= 10;
    }, { message: 'Please enter a valid phone number with at least 10 digits' }),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;

const PhoneCollectionPage = () => {
  const { updatePhoneNumber, isUpdating, profile } = useAuth0Profile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<'input' | 'verify'>('input');

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: profile?.phone_number || '',
    },
  });

  const onSubmit = async (data: PhoneFormValues) => {
    console.log('Submitting phone number:', data.phoneNumber);
    try {
      const success = await updatePhoneNumber(data.phoneNumber);
      console.log('Update result:', success);
      if (success) {
        toast({
          title: 'Phone number updated',
          description: 'Your phone number has been saved successfully.',
        });
        setStep('verify');
        
        // For now, just navigate to dashboard after a short delay
        // In a real implementation, you would implement SMS verification
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      } else {
        toast({
          title: 'Update failed',
          description: 'There was an error saving your phone number. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Phone update error:', error);
      toast({
        title: 'Update failed',
        description: 'There was an error saving your phone number. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSkip = () => {
    console.log('Skipping phone number collection');
    // For demo purposes, allow skipping phone number collection
    // In production, you might want to make this mandatory
    
    // Mark as skipped in localStorage to prevent infinite redirects
    if (profile?.id) {
      localStorage.setItem(`phone_skipped_${profile.id}`, 'true');
    }
    
    navigate('/', { replace: true });
  };

  if (step === 'verify') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Phone Number Added!</CardTitle>
            <CardDescription>
              Your phone number {getValues('phoneNumber')} has been saved.
              You'll now receive SMS alerts for irrigation updates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Redirecting to dashboard...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle>Add Your Phone Number</CardTitle>
          <CardDescription>
            We'll use your phone number to send SMS alerts for irrigation schedules,
            soil condition updates, and system notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your phone number will be used exclusively for irrigation system alerts.
              We respect your privacy and won't share your information.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+1 (555) 123-4567"
                {...register('phoneNumber')}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Save Phone Number
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                disabled={isUpdating}
              >
                Skip for now
              </Button>
            </div>
          </form>

          <div className="text-xs text-center text-muted-foreground">
            You can always add or update your phone number later in Settings
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhoneCollectionPage;