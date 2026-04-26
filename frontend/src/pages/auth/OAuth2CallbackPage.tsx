import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const OAuth2CallbackPage = () => {
  const [searchParams] = useSearchParams();
  const { completeOAuthLogin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      toast({
        title: 'OAuth failed',
        description: 'No access token received from provider.',
        variant: 'destructive',
      });
      navigate('/login', { replace: true });
      return;
    }

    (async () => {
      try {
        await completeOAuthLogin(token);
        toast({ title: 'Signed in successfully' });
        navigate('/dashboard', { replace: true });
      } catch {
        localStorage.removeItem('campus_token');
        localStorage.removeItem('campus_user');
        toast({
          title: 'OAuth failed',
          description: 'Could not complete sign-in. Please try again.',
          variant: 'destructive',
        });
        navigate('/login', { replace: true });
      }
    })();
  }, [completeOAuthLogin, navigate, searchParams, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle>Completing sign-in</CardTitle>
          <CardDescription>Please wait while we verify your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-2 w-full overflow-hidden rounded bg-muted">
            <div className="h-full w-1/2 animate-pulse bg-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuth2CallbackPage;
