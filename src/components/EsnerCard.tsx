'use client';

import { useAuth } from './AuthGate';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, QrCode } from 'lucide-react';

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

interface EsnerCardProps {
  esner: Esner;
  id: string;
}

export function EsnerCard({ esner, id }: EsnerCardProps) {
  const { user } = useAuth();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUnlockStatus = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/unlocks?userId=${id}&viewerId=${user.uid}`);
        if (response.ok) {
          const unlocks = await response.json();
          setIsUnlocked(unlocks.length > 0 && unlocks[0].unlocked);
        }
      } catch (error) {
        console.error('Error checking unlock status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUnlockStatus();
  }, [user, id]);

  const displayStarter = esner.starters?.[0] || 'Say hi!';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border-border hover:border-primary/20">
      <div className="relative">
        {esner.photoURL ? (
          <img
            src={esner.photoURL}
            alt={esner.name}
            className={`w-full h-48 object-cover ${isUnlocked ? 'brightness-110 saturate-110' : 'grayscale brightness-75'}`}
          />
        ) : (
          <div className={`w-full h-48 bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center ${isUnlocked ? 'brightness-110 saturate-110' : 'grayscale brightness-75'}`}>
            <svg className="w-12 h-12 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {!isUnlocked && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-12 h-12 bg-background/80 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
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
        {!isUnlocked && (
          <Badge variant="secondary" className="text-xs">
            <QrCode className="w-3 h-3 mr-1" />
            Scan QR to unlock
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
