'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/AuthGate';
import { useRouter } from 'next/navigation';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';

interface RequireAuthProps {
  children: React.ReactNode;
  allowAnonymous?: boolean;
}

export function RequireAuth({ children, allowAnonymous = true }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      if (!loading && !user) {
        if (allowAnonymous) {
          // Sign in anonymously if no user
          try {
            await signInAnonymously(auth);
          } catch (error) {
            console.error('Anonymous sign-in failed:', error);
            router.push('/');
          }
        } else {
          // Redirect to login if auth is required and no user
          router.push('/login');
        }
      }
    };

    handleAuth();
  }, [user, loading, allowAnonymous, router]);

  // Show loading while auth is being handled
  if (loading || (!user && allowAnonymous)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is required but not present
  if (!user && !allowAnonymous) {
    return null;
  }

  return <>{children}</>;
}
