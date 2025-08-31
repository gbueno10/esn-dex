'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Heart, MapPin, Users, Star, Share2, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  uid: string;
  name: string;
  email?: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  interests?: string[];
  starters?: string[];
  socials?: {
    instagram?: string;
    linkedin?: string;
  };
  visible?: boolean;
  role?: string;
  createdAt?: any;
  unlockedCount?: number;
}

interface UserProfileCardProps {
  profile: UserProfile;
  variant?: 'full' | 'compact' | 'mini';
  showShareButton?: boolean;
  showStatsCard?: boolean;
  onStartConversation?: () => void;
  className?: string;
}

export function UserProfileCard({ 
  profile, 
  variant = 'full', 
  showShareButton = false,
  showStatsCard = true,
  onStartConversation,
  className = ""
}: UserProfileCardProps) {
  const { toast } = useToast();

  const shareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.name}'s ESN Profile`,
          text: `Check out ${profile?.name}'s profile on Meet Your ESNners!`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Profile link has been copied to your clipboard.",
        });
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  const getDaysActive = () => {
    if (!profile.createdAt) return 0;
    return Math.floor((new Date().getTime() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  };

  // Mini variant - for grids/lists
  if (variant === 'mini') {
    return (
      <Card className={`hover:shadow-md transition-shadow cursor-pointer ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={profile.photoURL} alt={profile.name} />
              <AvatarFallback>
                {profile.name?.charAt(0)?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{profile.name}</h3>
              <p className="text-xs text-muted-foreground truncate">
                {profile.location || 'ESN Volunteer'}
              </p>
              {profile.interests && profile.interests.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {profile.interests.slice(0, 2).map((interest, index) => (
                    <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                      {interest}
                    </Badge>
                  ))}
                  {profile.interests.length > 2 && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      +{profile.interests.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact variant - for previews
  if (variant === 'compact') {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-20"></div>
        <CardContent className="relative -mt-10 pb-4">
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
              <AvatarImage src={profile.photoURL} alt={profile.name} />
              <AvatarFallback className="text-lg">
                {profile.name?.charAt(0)?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold">{profile.name}</h3>
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="text-xs">{profile.location || 'Location not set'}</span>
              </div>
            </div>

            {profile.bio && (
              <p className="text-center text-muted-foreground text-sm max-w-xs overflow-hidden" style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {profile.bio}
              </p>
            )}

            {profile.interests && profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center max-w-xs">
                {profile.interests.slice(0, 3).map((interest, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
                {profile.interests.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{profile.interests.length - 3}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {onStartConversation && (
                <Button size="sm" onClick={onStartConversation}>
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Chat
                </Button>
              )}
              {showShareButton && (
                <Button variant="outline" size="sm" onClick={shareProfile}>
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant - complete profile view
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Profile Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
        <CardContent className="relative -mt-16 pb-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src={profile.photoURL} alt={profile.name} />
              <AvatarFallback className="text-2xl">
                {profile.name?.charAt(0)?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>

            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{profile.location || 'Location not set'}</span>
              </div>
            </div>

            {profile.bio && (
              <p className="text-center text-muted-foreground max-w-sm">
                {profile.bio}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              {onStartConversation && (
                <Button onClick={onStartConversation}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Conversation
                </Button>
              )}
              {showShareButton && (
                <Button variant="outline" onClick={shareProfile}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interests */}
      {profile.interests && profile.interests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Interests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, index) => (
                <Badge key={index} variant="secondary">
                  {interest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversation Starters */}
      {profile.starters && profile.starters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Conversation Starters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.starters.map((starter, index) => (
              <div key={index} className="p-3 bg-muted rounded-lg">
                <p className="text-sm">{starter}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {showStatsCard && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Profile Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {profile.unlockedCount || 0}
                </div>
                <div className="text-sm text-muted-foreground">Profile Views</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {getDaysActive()}
                </div>
                <div className="text-sm text-muted-foreground">Days Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
