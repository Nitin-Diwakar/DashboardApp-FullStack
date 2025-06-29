import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plane as Plant } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type RegisterValues = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterValues) => {
    setIsLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
      toast({
        title: 'Registration successful',
        description: 'Welcome to Agri NextGen!',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: 'There was an error creating your account.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <div className="mx-auto">
          {/* <Plant className="h-10 w-10 text-green-600" /> */}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your information to create an account
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="John Doe"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
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
        <Button type="submit" className="w-full" disabled={isLoading}>
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