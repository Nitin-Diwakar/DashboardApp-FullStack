// src/pages/auth/RegisterPage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSignUp, useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';

const registerSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  contactNumber: z.string().min(10, { message: 'Contact number must be at least 10 digits' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  userType: z.enum(['farmer', 'non-farmer'], { message: 'Please select a user type' }),
});

type RegisterValues = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      contactNumber: '',
      password: '',
      userType: undefined,
    },
  });

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      navigate('/');
    }
  }, [isSignedIn, navigate]);

  const onSubmit = async (data: RegisterValues) => {
    if (!isLoaded || !signUp) return;

    setIsLoading(true);
    try {
      const result = await signUp.create({
        first_name: data.firstName,
        last_name: data.lastName,
        email_address: data.email,
        password: data.password,
        unsafe_metadata: {
          userType: data.userType,
          contactNumber: data.contactNumber,
        }
      });

      // Send the email verification code
      await result.prepareEmailAddressVerification({ strategy: 'email_code' });

      setVerifying(true);
      toast({
        title: 'Verification email sent',
        description: 'Please check your email for a verification code.',
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      toast({
        title: 'Registration failed',
        description: err.errors?.[0]?.message || 'There was an error creating your account.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setIsLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        toast({
          title: 'Registration successful',
          description: 'Welcome to Agri NextGen!',
        });
        navigate('/');
      } else {
        console.error('Verification incomplete:', completeSignUp);
      }
    } catch (err: any) {
      toast({
        title: 'Verification failed',
        description: err.errors?.[0]?.message || 'Invalid verification code.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  // Show verification form if verifying
  if (verifying) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Verify your email</h1>
          <p className="text-sm text-muted-foreground">
            Enter the verification code sent to your email
          </p>
        </div>
        <form onSubmit={handleVerification} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </Button>
        </form>
        <div className="text-center text-sm">
          <Button variant="link" onClick={() => setVerifying(false)}>
            Back to registration
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your information to get started with agriculture monitoring
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="John"
              {...register('firstName')}
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              {...register('lastName')}
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contactNumber">Contact Number</Label>
          <Input
            id="contactNumber"
            placeholder="+1234567890"
            {...register('contactNumber')}
          />
          {errors.contactNumber && (
            <p className="text-sm text-destructive">{errors.contactNumber.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="userType">User Type</Label>
          <Select onValueChange={(value) => setValue('userType', value as 'farmer' | 'non-farmer')}>
            <SelectTrigger>
              <SelectValue placeholder="Select user type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="farmer">Farmer</SelectItem>
              <SelectItem value="non-farmer">Non-Farmer</SelectItem>
            </SelectContent>
          </Select>
          {errors.userType && (
            <p className="text-sm text-destructive">{errors.userType.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading || !isLoaded}>
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
      <div className="text-center text-sm">
        Already have an account?{' '}
        <Link to="/login" className="underline underline-offset-4 hover:text-primary">
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;