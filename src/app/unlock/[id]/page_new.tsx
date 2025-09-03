'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { UserProfileCard } from '@/components/UserProfileCard';

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
  const userId = params.id as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error('Profile not found or not accessible');
        }
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Could not load profile. It might be private or the link is invalid.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const handleStartConversation = () => {
    // Implementar lógica de iniciar conversa
    console.log('Starting conversation with:', profile?.name);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading profile...</p>
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
              <a href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Home
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <a href="/">
              <ArrowLeft className="h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Profile Card */}
        <UserProfileCard 
          profile={profile}
          variant="full"
          showShareButton={true}
          showStatsCard={true}
          onStartConversation={handleStartConversation}
        />

        {/* Footer */}
        <div className="text-center space-y-4">
          <Separator />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This profile was unlocked via QR code
            </p>
            <Button asChild className="w-full">
              <a href="/">
                Find More ESNners
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
