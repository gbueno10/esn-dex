'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { UserProfileCard } from '@/components/UserProfileCard';
import { useAuth } from '@/components/AuthGate';
import confetti from 'canvas-confetti';

interface UserProfile {
  uid: string;
  name: string;
  email?: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  interests?: string[];
  starters?: string[];
  socials?: {
    instagram?: string;
    linkedin?: string;
  };
  visible?: boolean;
  role?: string;
  createdAt?: any;
  unlockedCount?: number;
}

export default function UnlockPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const userId = params.id as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileAndUnlock = async () => {
      if (!user || !userId) return;

      try {
        // Fetch profile
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error('Profile not found or not accessible');
        }
        const profileData = await response.json();
        setProfile(profileData);

        // Perform unlock
        setUnlocking(true);
        const unlockResponse = await fetch('/api/unlock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await user.getIdToken()}`
          },
          body: JSON.stringify({ esnerUid: userId })
        });

        if (unlockResponse.ok) {
          // Show confetti animation
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });

          // Wait a bit for the confetti, then navigate
          setTimeout(() => {
            router.push(`/esners/${userId}`);
          }, 2000);
        } else {
          throw new Error('Failed to unlock profile');
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'Could not load profile');
      } finally {
        setLoading(false);
        setUnlocking(false);
      }
    };

    fetchProfileAndUnlock();
  }, [user, userId, router]);

  if (loading || unlocking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">
            {unlocking ? 'Unlocking profile...' : 'Loading profile...'}
          </p>
          {unlocking && (
            <p className="text-sm text-muted-foreground">
              🎉 Preparing your access to {profile?.name}'s profile!
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Profile Not Available</CardTitle>
            <CardDescription>
              {error || 'This profile could not be loaded.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button asChild>
              <a href="/esners">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Profiles
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-green-600">🎉 Profile Unlocked!</h2>
        <p className="text-muted-foreground">
          You now have access to {profile?.name}'s full profile.
        </p>
        <p className="text-sm text-muted-foreground">
          Redirecting to their profile...
        </p>
      </div>
    </div>
  );
}
