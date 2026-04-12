import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { authService } from '@/services/authService';

const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errs: typeof errors = {};
    if (!email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login(email, password);
      toast({ title: 'Welcome back!', description: 'You have been logged in successfully.' });
      navigate('/dashboard');
    } catch {
      toast({ title: 'Login failed', description: 'Invalid credentials. Please try again.', variant: 'destructive' });
    }
  };

  const handleGoogleSignIn = () => {
    window.location.assign(authService.getOAuthAuthorizeUrl());
  };

  return (
    <div className="min-h-screen flex">
      {/* Left hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent/30" />
        <div className="relative z-10 text-center max-w-md">
          <div className="flex justify-center mb-8">
            <div className="rounded-2xl bg-accent/20 p-5 backdrop-blur">
              <GraduationCap className="h-12 w-12 text-accent-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">Smart Campus<br />Operations Hub</h1>
          <p className="text-primary-foreground/80 text-lg">Manage campus resources, bookings, and maintenance tickets — all in one place.</p>
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            {[['8+', 'Facilities'], ['500+', 'Bookings/mo'], ['99.9%', 'Uptime']].map(([v, l]) => (
              <div key={l}>
                <p className="text-2xl font-bold text-accent-foreground">{v}</p>
                <p className="text-xs text-primary-foreground/60">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-6">
            <div className="rounded-xl bg-primary p-2.5">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Smart Campus Hub</span>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Sign in to your account to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@university.edu"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="pl-9 pr-9"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.password}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>

                <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                  Continue with Google
                </Button>

                <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
                  Default admin: <span className="font-medium text-foreground">admin@smartcampus.edu / Admin@123</span>
                </div>
              </form>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Sign up</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
