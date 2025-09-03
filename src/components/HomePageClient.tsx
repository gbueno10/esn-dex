'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, QrCode, Heart, Play } from 'lucide-react';
import { useAuth } from '@/components/AuthGate';
import { useRouter } from 'next/navigation';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';

interface HomePageClientProps {
  featuredEsners: any[]; // Keep for compatibility but won't be used
}

export function HomePageClient({ featuredEsners }: HomePageClientProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleStartPlaying = async () => {
    try {
      // Simplesmente navegar para /esners - o RequireAuth vai lidar com a auth
      router.push('/esners');
    } catch (error) {
      console.error('Error starting:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col -mx-4 -my-4 -mb-20">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center space-y-8 max-w-2xl w-full">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center">
              <Users className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>

          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Meet Your
              <br />
              ESNers
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Connect with amazing ESN volunteers, unlock their profiles by scanning QR codes, and make unforgettable memories!
            </p>
          </div>

          {/* Start Playing Button */}
          <div className="pt-4">
            <Button 
              onClick={handleStartPlaying}
              size="lg" 
              className="px-8 py-6 text-lg h-auto font-semibold"
            >
              <Play className="mr-3 h-6 w-6" />
              Start Playing
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Discover ESNers</h3>
                <p className="text-sm text-muted-foreground">Browse amazing volunteers from your local ESN section</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Scan & Unlock</h3>
                <p className="text-sm text-muted-foreground">Use QR codes to unlock profiles and see full details</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Make Connections</h3>
                <p className="text-sm text-muted-foreground">Start conversations and create lasting friendships</p>
              </CardContent>
            </Card>
          </div>

          {/* Terms Notice */}
          <div className="pt-6">
            <p className="text-xs text-muted-foreground/60 text-center">
              By using this app, you agree to our{' '}
              <a 
                href="/terms" 
                className="text-primary/60 hover:text-primary underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
