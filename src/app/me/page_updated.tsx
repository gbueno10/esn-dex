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
                linkedin: userData.socials?.linkedin || ''
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
          linkedin: data.linkedin || ''
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
          linkedin: data.linkedin
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
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Perfil não encontrado</h2>
            <p className="text-muted-foreground mb-6">
              Não foi possível carregar seu perfil. Tente novamente.
            </p>
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            Perfil atualizado com sucesso!
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Component */}
      <Profile
        profile={profile}
        mode={isEditing ? 'edit' : 'view'}
        onSave={handleSave}
        onEdit={() => setIsEditing(true)}
        onCancel={() => setIsEditing(false)}
        saving={saving}
      />

      {/* QR Code Section - only show in view mode */}
      {!isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Seu QR Code
            </CardTitle>
            <CardDescription>
              Compartilhe este QR code com participantes Erasmus para que eles possam desbloquear seu perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {user && (
              <div className="bg-white p-6 rounded-lg inline-block shadow-sm border">
                <img
                  src={generateQRCodeImageUrl(generateProfileQRUrl(user.uid))}
                  alt="Profile QR Code"
                  className="w-56 h-56"
                />
              </div>
            )}
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Participantes Erasmus podem escanear este código para desbloquear e visualizar seu perfil
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => router.push('/me/qr')}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Ver QR em Tela Cheia
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Meu Perfil ESN',
                        text: 'Escaneie este QR code para desbloquear meu perfil!',
                        url: generateProfileQRUrl(user?.uid || '')
                      });
                    } else {
                      navigator.clipboard.writeText(generateProfileQRUrl(user?.uid || ''));
                    }
                  }}
                >
                  Compartilhar Link
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
