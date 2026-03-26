import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserRole } from '@/types';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<UserRole>('USER');

  const validate = () => {
    const fullName = nameRef.current?.value?.trim() || '';
    const email = emailRef.current?.value || '';
    const password = passwordRef.current?.value || '';
    const confirm = confirmRef.current?.value || '';
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.name = 'Name is required';
    if (!email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Min 6 characters';
    if (password !== confirm) errs.confirm = 'Passwords do not match';
    if (!role) errs.role = 'Select a role';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        fullName: nameRef.current?.value?.trim() || '',
        email: emailRef.current?.value || '',
        password: passwordRef.current?.value || '',
        role,
      };
      await authService.register(payload);
      toast({ title: 'Account created!', description: 'Please sign in with your credentials.' });
      navigate('/login');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Registration failed. Please try again.';
      toast({ title: 'Registration failed', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ id, label, type = 'text', icon: Icon, inputRef, autoComplete }: any) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id={id}
          type={type}
          ref={inputRef}
          autoComplete={autoComplete}
          spellCheck={false}
          className="pl-9"
        />
      </div>
      {errors[id] && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors[id]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-3 justify-center">
          <div className="rounded-xl bg-primary p-2.5"><GraduationCap className="h-6 w-6 text-primary-foreground" /></div>
          <span className="text-xl font-bold">Smart Campus Hub</span>
        </div>
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create account</CardTitle>
            <CardDescription>Join the campus management platform</CardDescription>
          </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
              <Field id="name" label="Full Name" icon={User} inputRef={nameRef} autoComplete="name" />
              <Field id="email" label="Email" type="email" icon={Mail} inputRef={emailRef} autoComplete="email" />
              <Field id="password" label="Password" type="password" icon={Lock} inputRef={passwordRef} autoComplete="new-password" />
              <Field id="confirm" label="Confirm Password" type="password" icon={Lock} inputRef={confirmRef} autoComplete="new-password" />
              <div className="space-y-2">
                <Label htmlFor="role">Account Type</Label>
                <Select value={role} onValueChange={v => setRole(v as UserRole)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="TECHNICIAN">Technician</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.role}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</Button>
              </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
