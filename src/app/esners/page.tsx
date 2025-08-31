'use client';

import { useEffect, useState } from 'react';
import { EsnerCard } from '@/components/EsnerCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/AuthGate';
import { UserCheck } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  email?: string;
  userId: string;
  photoURL?: string;
  starters?: string[];
  interests?: string[];
  visible?: boolean;
  role?: string;
  isUnlocked?: boolean;
  createdAt: any;
  updatedAt: any;
}

export default function EsnersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userRole, loading: authLoading } = useAuth();

  // Determine what the user can see based on their role
  const isEsner = userRole === 'esnner';
  const isParticipant = !isEsner;

  useEffect(() => {
    if (authLoading) return; // wait for auth to settle before fetching

    const fetchProfiles = async () => {
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
          throw new Error('Failed to fetch profiles');
        }
        const data = await response.json();
        console.log('API Response:', data);
        console.log('Number of profiles:', data.length);
        setProfiles(data);
      } catch (err) {
        setError('Failed to load profiles');
        console.error('Error fetching profiles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [user, authLoading]);

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
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {isEsner ? 'Perfis ESNer' : 'Perfis ESNer'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isEsner
            ? "Conecte-se com outros voluntários ESN da plataforma!"
            : "Descubra nossos incríveis voluntários ESN. Pegue o QR code deles para desbloquear o perfil completo!"
          }
        </p>
      </div>

      {/* Content */}
      {profiles.length === 0 ? (
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Nenhum Perfil Disponível</CardTitle>
            <CardDescription className="text-center">
              Volte mais tarde para ver os perfis.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* ESNers Section */}
          {profiles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">
                  Voluntários ESN
                  {isEsner && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({profiles.length})
                    </span>
                  )}
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {profiles.map((profile) => (
                  <EsnerCard
                    key={profile.id}
                    esner={profile}
                    id={profile.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
