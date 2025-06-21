'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Scale } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSignIn = () => {
    login();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Scale className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl">Tribunal Genesis</CardTitle>
          <CardDescription>
            Your AI-Powered Strategic Co-Counsel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            <p className="text-center text-sm text-muted-foreground">
              Click below to log in and access your dashboard.
            </p>
            <Button onClick={handleSignIn} className="w-full" size="lg">
              Log In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
