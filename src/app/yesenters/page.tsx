'use client';

import { useEffect, useState } from 'react';
import { YesenterCard } from '@/components/YesenterCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Yesenter {
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

export default function YesentersPage() {
  const [yesenters, setYesenters] = useState<Yesenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchYesenters = async () => {
      try {
        const response = await fetch('/api/esners');
        if (!response.ok) {
          throw new Error('Failed to fetch yesenters');
        }
        const data = await response.json();
        setYesenters(data);
      } catch (err) {
        setError('Failed to load profiles');
        console.error('Error fetching yesenters:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchYesenters();
  }, []);

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
          Discover our amazing ESN volunteers. Get their QR code to unlock their full profile!
        </p>
      </div>

      {/* Content */}
      {yesenters.length === 0 ? (
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
          {yesenters.map((yesenter) => (
            <YesenterCard
              key={yesenter.id}
              yesenter={yesenter}
              id={yesenter.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
