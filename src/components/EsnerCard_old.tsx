'use client';

import { useAuth } from './AuthGate';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lock, QrCode, User } from 'lucide-react';
import Link from 'next/link';

interface Esner {
  id: string;
  name: string;
  email?: string;
  userId: string;
  photoURL?: string;
  starters?: string[];
  interests?: string[];
  visible?: boolean;
  isUnlocked?: boolean;
  createdAt: any;
  updatedAt: any;
}

interface EsnerCardProps {
  esner: Esner;
  id: string;
}

export function EsnerCard({ esner, id }: EsnerCardProps) {
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);

  // Use the isUnlocked status from the API if available
  const isUnlocked = esner.isUnlocked || false;
  const displayStarter = esner.starters?.[0] || 'Say hi!';
  const profileImage = imageError ? null : esner.photoURL;

  return (
    <Link href={`/esners/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border-border hover:border-primary/20 cursor-pointer">
        <div className="relative">
          {/* Profile Image */}
          <div className="h-48 bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
            <Avatar className={`w-24 h-24 border-2 border-background ${!isUnlocked ? 'grayscale brightness-75' : ''}`}>
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

          {/* Lock Overlay for locked profiles */}
          {!isUnlocked && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-12 h-12 bg-background/80 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold">Locked</p>
                <p className="text-xs opacity-90 mt-1">Scan QR to unlock</p>
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-foreground mb-2">{esner.name}</h3>
          <p className="text-muted-foreground text-sm mb-3">
            💬 {displayStarter}
          </p>
          
          <div className="flex justify-between items-center">
            {isUnlocked ? (
              <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
                Unlocked
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                <QrCode className="w-3 h-3 mr-1" />
                Scan QR to unlock
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}