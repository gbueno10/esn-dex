'use client';

import { useAuth } from './AuthGate';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lock, QrCode, User, UserCheck, Globe } from 'lucide-react';
import Link from 'next/link';

interface Profile {
  id: string;
  name: string;
  email?: string;
  userId: string;
  photoURL?: string;
  nationality?: string;
  bio?: string;
  starters?: string[];
  interests?: string[];
  visible?: boolean;
  role?: string;
  isUnlocked?: boolean;
  createdAt: any;
  updatedAt: any;
}

interface EsnerCardProps {
  esner: Profile;
  id: string;
}

export function EsnerCard({ esner, id }: EsnerCardProps) {
  const { user, userRole } = useAuth();
  const [imageError, setImageError] = useState(false);

  // Use the isUnlocked status from the API if available
  // ESNers always see profiles as unlocked
  const isUnlocked = userRole === 'esnner' || esner.isUnlocked || false;
  const isEsner = esner.role === 'esnner';
  const isParticipant = esner.role === 'participant';

  // For participants, show a generic message since they don't have starters
  const displayText = isEsner
    ? (esner.bio || esner.starters?.[0] || 'Say hi!')
    : 'Erasmus Participant';

  const profileImage = imageError ? null : esner.photoURL;

  return (
    <Link href={`/esners/${id}`}>
      <Card className="group cursor-pointer transition-all duration-200 hover:shadow-md">
        <CardContent className="p-0">
          {/* Profile Image Section */}
          <div className="relative h-48 flex items-center justify-center">
            <Avatar className={`w-32 h-32 transition-all duration-200 group-hover:scale-105 ${!isUnlocked && isEsner && userRole !== 'esnner' ? 'blur-sm brightness-75' : ''}`}>
              <AvatarImage
                src={profileImage || undefined}
                alt={esner.name}
                className="object-cover"
                onError={() => setImageError(true)}
              />
              <AvatarFallback>
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>

            {/* Status badge overlay */}
            <div className="absolute top-3 right-3">
              <Badge variant={isEsner ? "default" : "secondary"} className="text-xs">
                {isEsner ? (
                  <>
                    <UserCheck className="w-3 h-3 mr-1" />
                    ESNer
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3 mr-1" />
                    Participant
                  </>
                )}
              </Badge>
            </div>

            {/* Lock/Unlock indicator */}
            <div className="absolute bottom-3 left-3">
              {!isUnlocked && isEsner && userRole !== 'esnner' ? (
                <Badge variant="secondary" className="text-xs">
                  <Lock className="w-3 h-3 mr-1" />
                  Locked
                </Badge>
              ) : isEsner ? (
                <Badge variant="outline" className="text-xs">
                  <Lock className="w-3 h-3 mr-1" />
                  Unlocked
                </Badge>
              ) : null}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3 mt-4">
            <div>
              <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                {esner.name}
              </h3>
              
              <p className="text-foreground text-sm mt-1 line-clamp-2">
                {displayText}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground">
                <Globe className="w-4 h-4" />
                <span className="text-sm">?????</span>
              </div>

              <div className="text-xs">
                {isEsner && !(isUnlocked || userRole === 'esnner') && (
                  <Badge variant="outline" className="text-xs">
                    Unlock
                  </Badge>
                )}
                {isEsner && (isUnlocked || userRole === 'esnner') && (
                  <Badge variant="outline" className="text-xs">
                    Open
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
 }
