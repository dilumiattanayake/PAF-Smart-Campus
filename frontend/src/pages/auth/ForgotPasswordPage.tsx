import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Mail, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-3 justify-center">
          <div className="rounded-xl bg-primary p-2.5"><GraduationCap className="h-6 w-6 text-primary-foreground" /></div>
          <span className="text-xl font-bold">Smart Campus Hub</span>
        </div>
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{sent ? 'Check your email' : 'Reset password'}</CardTitle>
            <CardDescription>{sent ? 'We sent a reset link to your email' : 'Enter your email to receive a reset link'}</CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center"><div className="rounded-full bg-success/10 p-3"><CheckCircle className="h-8 w-8 text-success" /></div></div>
                <p className="text-sm text-muted-foreground">If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.</p>
                <Link to="/login"><Button variant="outline" className="w-full"><ArrowLeft className="h-4 w-4 mr-2" />Back to login</Button></Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="you@university.edu" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} className="pl-9" />
                  </div>
                  {error && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{error}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</Button>
                <Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="inline h-3 w-3 mr-1" />Back to login</Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
