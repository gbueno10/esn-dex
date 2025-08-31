'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Lock, Unlock, Instagram, Linkedin, MessageCircle, Heart, User, QrCode, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EsnerProfileProps {
  esner: {
    id: string;
    name: string;
    email?: string;
    userId?: string;
    photoURL?: string;
    starters?: string[];
    interests?: string[];
    bio?: string;
    socials?: {
      instagram?: string;
      linkedin?: string;
    };
    visible?: boolean;
    createdAt?: any;
    updatedAt?: any;
  };
  isUnlocked: boolean;
  isOwnProfile?: boolean;
  showBackButton?: boolean;
  onUnlockRequest?: () => void;
  className?: string;
}

export function EsnerProfile({ 
  esner, 
  isUnlocked, 
  isOwnProfile = false,
  showBackButton = true,
  onUnlockRequest,
  className = ""
}: EsnerProfileProps) {
  const [imageError, setImageError] = useState(false);

  // For own profile or unlocked profiles, show everything
  const showFullProfile = isOwnProfile || isUnlocked;
  
  // Accessible content (visible even when locked)
  const displayStarter = esner.starters?.[0] || 'Say hi!';
  const profileImage = imageError ? null : esner.photoURL;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Profile Image Section */}
          <div className="relative">
            <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Avatar className={`w-32 h-32 border-4 border-background ${!showFullProfile ? 'grayscale brightness-75' : ''}`}>
                <AvatarImage 
                  src={profileImage || undefined} 
                  alt={esner.name}
                  onError={() => setImageError(true)}
                />
                <AvatarFallback className="text-2xl">
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Lock Overlay for locked profiles */}
            {!showFullProfile && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-16 h-16 bg-background/80 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold">Profile Locked</p>
                  <p className="text-xs opacity-90 mt-1">Scan QR to unlock</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Profile Info */}
          <div className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">{esner.name}</h1>
            
            {/* Status Badge */}
            <div className="flex justify-center mb-4">
              {showFullProfile ? (
                <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
                  <Unlock className="w-3 h-3 mr-1" />
                  {isOwnProfile ? 'Your Profile' : 'Unlocked'}
                </Badge>
              ) : (
                <Badge variant="secondary" className="border-primary/20">
                  <Lock className="w-3 h-3 mr-1" />
                  Locked
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Always Visible: Conversation Starter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-primary" />
            Conversation Starter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">💬 {displayStarter}</p>
        </CardContent>
      </Card>

      {/* Locked Content Warning */}
      {!showFullProfile && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardContent className="p-6 text-center">
            <QrCode className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-300 mb-2">
              Want to see more?
            </h3>
            <p className="text-amber-600 dark:text-amber-400 mb-4 text-sm">
              Ask {esner.name} to show you their QR code to unlock their full profile!
            </p>
            
            <div className="text-xs text-amber-600 dark:text-amber-400">
              <p className="font-medium mb-2">Unlock to see:</p>
              <div className="grid grid-cols-2 gap-2 text-left">
                <div className="flex items-center">
                  <Heart className="w-3 h-3 mr-1" />
                  <span>Interests & hobbies</span>
                </div>
                <div className="flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  <span>Bio & background</span>
                </div>
                <div className="flex items-center">
                  <Instagram className="w-3 h-3 mr-1" />
                  <span>Social media</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  <span>More conversation starters</span>
                </div>
              </div>
            </div>
            
            {onUnlockRequest && (
              <Button 
                onClick={onUnlockRequest}
                className="mt-4"
                variant="outline"
                size="sm"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Request QR Code
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Full Profile Content (only visible when unlocked or own profile) */}
      {showFullProfile && (
        <>
          {/* All Conversation Starters */}
          {esner.starters && esner.starters.length > 1 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-primary" />
                  All Conversation Starters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {esner.starters.map((starter, index) => (
                    <p key={index} className="text-muted-foreground">💬 {starter}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interests */}
          {esner.interests && esner.interests.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-primary" />
                  Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {esner.interests.map((interest, index) => (
                    <Badge key={index} variant="outline">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bio */}
          {esner.bio && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{esner.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Social Media */}
          {(esner.socials?.instagram || esner.socials?.linkedin) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Connect</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {esner.socials?.instagram && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-pink-200 hover:bg-pink-50 dark:border-pink-800 dark:hover:bg-pink-950"
                    >
                      <a 
                        href={`https://instagram.com/${esner.socials.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Instagram className="w-4 h-4 mr-2 text-pink-500" />
                        Instagram
                      </a>
                    </Button>
                  )}
                  
                  {esner.socials?.linkedin && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950"
                    >
                      <a 
                        href={esner.socials.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="w-4 h-4 mr-2 text-blue-600" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Back Button */}
      {showBackButton && (
        <div className="flex justify-center pt-6">
          <Button asChild variant="outline">
            <Link href="/esners">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profiles
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
