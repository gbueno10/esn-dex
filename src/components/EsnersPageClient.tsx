'use client';

import { EsnerCard } from '@/components/EsnerCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck } from 'lucide-react';
import { EsnerProfile } from '@/lib/server-data';

interface EsnersPageClientProps {
  esners: EsnerProfile[];
  userRole?: string;
}

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

export function EsnersPageClient({ esners, userRole }: EsnersPageClientProps) {
  // Determine what the user can see based on their role
  const isEsner = userRole === 'esnner';

  // Convert EsnerProfile to Profile format for EsnerCard compatibility
  const profiles: Profile[] = esners.map(esner => ({
    id: esner.id,
    name: esner.name,
    email: esner.email,
    userId: esner.userId,
    photoURL: esner.photoURL,
    starters: esner.starters,
    interests: esner.interests,
    visible: esner.visible,
    role: esner.role,
    isUnlocked: false, // This would need to be determined based on user's unlocks
    createdAt: esner.createdAt,
    updatedAt: esner.updatedAt,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {isEsner ? 'ESNer Profiles' : 'ESNer Profiles'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isEsner
            ? "Connect with other ESN volunteers on the platform!"
            : "Discover our amazing ESN volunteers. Get their QR code to unlock their full profile!"
          }
        </p>
      </div>

      {/* Content */}
      {profiles.length === 0 ? (
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle className="text-center">No Profiles Available</CardTitle>
            <CardDescription className="text-center">
              Come back later to see the profiles.
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
                  ESN Volunteers
                  {isEsner && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({profiles.length})
                    </span>
                  )}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
