'use client';

import { useEffect, useState } from 'react';
import { EsnerCard } from '@/components/EsnerCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/AuthGate';

interface Esner {
  id: string;
  name: string;
  email?: string;
  userId: string;
  photoURL?: string;
  starters?: string[];
  interests?: string[];
  visible?: boolean;
  createdAt: any;
  updatedAt: any;
}

export default function EsnersPage() {
  const [esners, setEsners] = useState<Esner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userRole } = useAuth();
  
  // Assume que qualquer usuário que não seja explicitamente ESNer é participante
  const isEsner = userRole === 'esnner';
  const isParticipant = !isEsner;

  useEffect(() => {
    const fetchEsners = async () => {
      try {
        const headers: HeadersInit = {};
        
        // Add authorization header if user is authenticated
        if (user) {
          try {
            const token = await user.getIdToken();
            headers['Authorization'] = `Bearer ${token}`;
          } catch (error) {
            console.error('Error getting token:', error);
          }
        }
        
        // Add viewer ID as query parameter
        const url = user?.uid 
          ? `/api/esners?viewerId=${user.uid}`
          : '/api/esners';
          
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
          throw new Error('Failed to fetch esners');
        }
        const data = await response.json();
        setEsners(data);
      } catch (err) {
        setError('Failed to load profiles');
        console.error('Error fetching esners:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEsners();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">ESNner Profiles</h1>
        <p className="text-muted-foreground text-sm">
          {isEsner 
            ? "Connect with fellow ESN volunteers from around the network!"
            : "Discover our amazing ESN volunteers. Get their QR code to unlock their full profile!"
          }
        </p>
      </div>

      {/* Content */}
      {esners.length === 0 ? (
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle className="text-center">No Profiles Available</CardTitle>
            <CardDescription className="text-center">
              Check back later for ESNner profiles.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {esners.map((esner) => (
            <EsnerCard
              key={esner.id}
              esner={esner}
              id={esner.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
