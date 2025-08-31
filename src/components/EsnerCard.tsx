'use client';

import { useAuth } from './AuthGate';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lock, QrCode, User, UserCheck } from 'lucide-react';
import Link from 'next/link';

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
  const displayStarter = isEsner
    ? (esner.starters?.[0] || 'Say hi!')
    : 'Participante Erasmus';

  const profileImage = imageError ? null : esner.photoURL;

  return (
    <Link href={`/esners/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border-border hover:border-primary/20 cursor-pointer">
        <div className="relative">
          {/* Profile Image */}
          <div className="h-48 bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
            <Avatar className={`w-24 h-24 border-2 border-background ${!isUnlocked && isEsner && userRole !== 'esnner' ? 'grayscale brightness-75' : ''}`}>
              <AvatarImage
                src={profileImage || undefined}
                alt={esner.name}
                onError={() => setImageError(true)}
              />
              <AvatarFallback>
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Lock Overlay for locked ESNer profiles (only for participants) */}
          {!isUnlocked && isEsner && userRole !== 'esnner' && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-12 h-12 bg-background/80 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold">Bloqueado</p>
                <p className="text-xs opacity-90 mt-1">Escaneie QR para desbloquear</p>
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-foreground">{esner.name}</h3>
            <Badge
              variant={isEsner ? "default" : "secondary"}
              className={isEsner ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : ""}
            >
              {isEsner ? (
                <>
                  <UserCheck className="w-3 h-3 mr-1" />
                  ESNer
                </>
              ) : (
                <>
                  <User className="w-3 h-3 mr-1" />
                  Participante
                </>
              )}
            </Badge>
          </div>

          <p className="text-muted-foreground text-sm mb-3">
            💬 {displayStarter}
          </p>

          <div className="flex justify-between items-center">
            {isEsner ? (
              (isUnlocked || userRole === 'esnner') ? (
                <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
                  Desbloqueado
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  <QrCode className="w-3 h-3 mr-1" />
                  Escaneie QR para desbloquear
                </Badge>
              )
            ) : (
              <Badge variant="outline" className="text-xs">
                <User className="w-3 h-3 mr-1" />
                Participante
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
