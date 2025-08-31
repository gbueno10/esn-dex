'use client';

import { useEffect, useState } from 'react';
import { UserProfileCard } from '@/components/UserProfileCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, QrCode, Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Esner {
  id: string;
  name: string;
  email?: string;
  userId: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  starters?: string[];
  interests?: string[];
  socials?: {
    instagram?: string;
    linkedin?: string;
  };
  visible?: boolean;
  role?: string;
  createdAt: any;
  updatedAt: any;
  unlockedCount?: number;
}

export default function HomePage() {
  const [featuredEsners, setFeaturedEsners] = useState<Esner[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFeaturedEsners = async () => {
      try {
        const response = await fetch('/api/esners');
        if (response.ok) {
          const data = await response.json();
          // Mostrar apenas os primeiros 3 ESNers em destaque
          setFeaturedEsners(data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching featured esners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEsners();
  }, []);

  const handleProfileClick = (esner: Esner) => {
    router.push(`/unlock/${esner.userId}`);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
          <Heart className="h-4 w-4" />
          Welcome to Meet Your ESNers
        </div>
        <h1 className="text-4xl font-bold text-foreground">
          Connect with Amazing ESN Volunteers
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover our incredible ESN volunteers and unlock their profiles by scanning QR codes. 
          Start conversations, make friends, and enrich your Erasmus experience!
        </p>
      </div>

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            How it Works
          </CardTitle>
          <CardDescription>
            Simple steps to connect with ESNers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="font-semibold">Find ESNers</h3>
              <p className="text-sm text-muted-foreground">Browse through our amazing ESN volunteers</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <QrCode className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Scan QR Code</h3>
              <p className="text-sm text-muted-foreground">Use your camera to scan their unique QR code</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Start Connecting</h3>
              <p className="text-sm text-muted-foreground">View their full profile and start a conversation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured ESNers */}
      {!loading && featuredEsners.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Featured ESNers</h2>
              <p className="text-muted-foreground">Get to know some of our amazing volunteers</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/esners">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEsners.map((esner) => (
              <div 
                key={esner.id}
                onClick={() => handleProfileClick(esner)}
                className="cursor-pointer"
              >
                <UserProfileCard
                  profile={{
                    uid: esner.userId,
                    name: esner.name,
                    email: esner.email,
                    photoURL: esner.photoURL,
                    bio: esner.bio,
                    location: esner.location,
                    interests: esner.interests,
                    starters: esner.starters,
                    socials: esner.socials,
                    visible: esner.visible,
                    role: esner.role,
                    createdAt: esner.createdAt,
                    unlockedCount: esner.unlockedCount
                  }}
                  variant="compact"
                  showShareButton={false}
                  showStatsCard={false}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-0">
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Ready to Meet Amazing People?</h3>
          <p className="text-muted-foreground mb-6">
            Explore all our ESN volunteers and start making connections today!
          </p>
          <Button asChild size="lg">
            <Link href="/esners">
              Explore All ESNers <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
