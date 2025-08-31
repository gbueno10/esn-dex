'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthGate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, QrCode } from 'lucide-react';
import { generateProfileQRUrl, generateQRCodeImageUrl } from '@/lib/qr-utils';
import { Profile, ProfileData } from '@/components/Profile';

type ProfileForm = {
  name: string;
  photoURL?: string;
  bio?: string;
  nationality?: string;
  starters: string[];
  interests: string[];
  instagram?: string;
  linkedin?: string;
  whatsapp?: string; // added
  visible: boolean;
};

export default function MePage() {
  const router = useRouter();
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Redirecionar participantes para a homepage
  useEffect(() => {
    if (userRole === 'participant') {
      router.push('/');
      return;
    }
  }, [userRole, router]);

  useEffect(() => {
    if (!user || userRole !== 'esnner') return;

    const loadProfile = async () => {
      try {
        const response = await fetch(`/api/users?uid=${user.uid}`);
        if (response.ok) {
          const userData = await response.json();
          if (userData) {
            setProfile({
              id: user.uid,
              name: userData.name || '',
              photoURL: userData.photoURL || '',
              bio: userData.bio || '',
              nationality: userData.nationality || '',
              starters: userData.starters?.length > 0 ? userData.starters : [''],
              interests: userData.interests?.length > 0 ? userData.interests : [''],
              socials: {
                instagram: userData.socials?.instagram || '',
                linkedin: userData.socials?.linkedin || '',
                whatsapp: userData.socials?.whatsapp || ''
              },
              visible: userData.visible || false
            });
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, userRole]);

  const handleSave = async (data: ProfileForm) => {
    if (!user) {
      console.error('No user found');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const profileData = {
        uid: user.uid,
        role: 'esnner',
        name: data.name,
        photoURL: data.photoURL || '',
        bio: data.bio || '',
        nationality: data.nationality || '',
        starters: data.starters.filter(s => s.trim() !== ''),
        interests: data.interests.filter(i => i.trim() !== ''),
        socials: {
          instagram: data.instagram || '',
          linkedin: data.linkedin || '',
          whatsapp: data.whatsapp || ''
        },
        visible: data.visible
      };

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save profile: ${response.status} ${errorText}`);
      }

      // Update local profile state
      setProfile({
        id: user.uid,
        name: data.name,
        photoURL: data.photoURL,
        bio: data.bio,
        nationality: data.nationality,
        starters: data.starters.filter(s => s.trim() !== ''),
        interests: data.interests.filter(i => i.trim() !== ''),
        socials: {
          instagram: data.instagram,
          linkedin: data.linkedin,
          whatsapp: data.whatsapp
        },
        visible: data.visible
      });

      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setError(`Failed to save profile: ${error?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border rounded-full flex items-center justify-center mx-auto">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <p className="text-foreground font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 border rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">😕</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
            <p className="text-muted-foreground mb-8">
              We couldn't load your profile. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* Success/Error Messages */}
      {success && (
        <Alert>
          <AlertDescription>
            ✅ Profile updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert>
          <AlertDescription>
            ❌ {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Component */}
      <Card>
        <Profile
          profile={profile}
          mode={isEditing ? 'edit' : 'view'}
          onSave={handleSave}
          onEdit={() => setIsEditing(true)}
          onCancel={() => setIsEditing(false)}
          saving={saving}
        />
      </Card>

      {/* QR Code Section - only show in view mode */}
      {!isEditing && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-3 text-2xl">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              Your QR Code
            </CardTitle>
            <CardDescription className="text-lg">
              Share this QR code with Erasmus participants so they can unlock your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-8">
            {user && (
              <div className="bg-white p-8 rounded-2xl inline-block shadow-lg border-4 border-white dark:border-slate-800 dark:bg-slate-800">
                <img
                  src={generateQRCodeImageUrl(generateProfileQRUrl(user.uid))}
                  alt="Profile QR Code"
                  className="w-64 h-64"
                />
              </div>
            )}
            <div className="space-y-6">
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                Erasmus participants can scan this code to unlock and view your complete profile with all your information
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  variant="default"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg"
                  onClick={() => router.push('/me/qr')}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  View Fullscreen QR
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/20"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'My ESN Profile',
                        text: 'Scan this QR code to unlock my profile!',
                        url: generateProfileQRUrl(user?.uid || '')
                      });
                    } else {
                      navigator.clipboard.writeText(generateProfileQRUrl(user?.uid || ''));
                    }
                  }}
                >
                  Share Profile Link
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
