'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthGate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, X, QrCode, Instagram, Linkedin, MessageCircle, Heart, User, LogOut } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateProfileQRUrl, generateQRCodeImageUrl } from '@/lib/qr-utils';
import { EsnerProfile } from '@/components/EsnerProfile';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  photoURL: z.string().optional().or(z.literal('')),
  starters: z.array(z.string().min(1).max(100)).min(1, 'At least one starter required').max(3, 'Maximum 3 starters'),
  interests: z.array(z.string().min(1).max(30)).min(1, 'At least one interest required'),
  bio: z.string().max(300, 'Bio too long').optional(),
  instagram: z.string().max(50, 'Instagram handle too long').optional(),
  linkedin: z.string().max(100, 'LinkedIn URL too long').optional(),
  visible: z.boolean()
});

type ProfileForm = z.infer<typeof profileSchema>;

interface EsnerProfile {
  id: string;
  name: string;
  photoURL?: string;
  starters: string[];
  interests: string[];
  bio?: string;
  socials?: {
    instagram?: string;
    linkedin?: string;
  };
  visible: boolean;
}

export default function MePage() {
  const router = useRouter();
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<EsnerProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Redirecionar participantes para a homepage
  useEffect(() => {
    if (userRole === 'participant') {
      router.push('/');
      return;
    }
  }, [userRole, router]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      photoURL: '',
      starters: [''],
      interests: [''],
      bio: '',
      instagram: '',
      linkedin: '',
      visible: false
    }
  });

  const watchedStarters = watch('starters');
  const watchedInterests = watch('interests');
  const watchedVisible = watch('visible');

  useEffect(() => {
    if (!user || userRole !== 'esnner') return;

    const loadProfile = async () => {
      try {
        const response = await fetch(`/api/users?uid=${user.uid}`);
        if (response.ok) {
          const userData = await response.json();
          if (userData) {
            setValue('name', userData.name || '');
            setValue('photoURL', userData.photoURL || '');
            setValue('starters', userData.starters?.length > 0 ? userData.starters : ['']);
            setValue('interests', userData.interests?.length > 0 ? userData.interests : ['']);
            setValue('bio', userData.bio || '');
            setValue('instagram', userData.socials?.instagram || '');
            setValue('linkedin', userData.socials?.linkedin || '');
            setValue('visible', userData.visible || false);

            setProfile(userData);
            setIsEditing(false); // Fechar modo de edição quando carregar perfil
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
  }, [user, userRole, setValue]);

  const onSubmit = async (data: ProfileForm) => {
    if (!user) {
      console.error('No user found');
      return;
    }

    console.log('Starting profile save...', { user: user.uid, data });
    setSaving(true);
    setError(null);

    try {
      const profileData = {
        uid: user.uid,
        role: 'esnner', // Sempre definir como esnner ao salvar perfil
        name: data.name,
        photoURL: data.photoURL || '',
        starters: data.starters.filter(s => s.trim() !== ''),
        interests: data.interests.filter(i => i.trim() !== ''),
        bio: data.bio || '',
        socials: {
          instagram: data.instagram || '',
          linkedin: data.linkedin || ''
        },
        visible: data.visible
      };

      console.log('Sending profile data:', profileData);

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to save profile: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Profile saved successfully:', result);

      setProfile({ ...profileData, id: user.uid } as EsnerProfile);
      setSuccess(true);
      setIsEditing(false); // Sair do modo de edição após salvar
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setError(`Failed to save profile: ${error?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const addStarter = () => {
    if (watchedStarters.length < 3) {
      setValue('starters', [...watchedStarters, '']);
    }
  };

  const removeStarter = (index: number) => {
    const newStarters = watchedStarters.filter((_, i) => i !== index);
    setValue('starters', newStarters.length > 0 ? newStarters : ['']);
  };

  const addInterest = () => {
    setValue('interests', [...watchedInterests, '']);
  };

  const removeInterest = (index: number) => {
    const newInterests = watchedInterests.filter((_, i) => i !== index);
    setValue('interests', newInterests.length > 0 ? newInterests : ['']);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            Profile updated successfully!
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

      {/* Profile View Mode */}
      {!isEditing && profile && (
        <>
          {/* Profile Header with Edit Button */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Meu Perfil
                  </CardTitle>
                  <CardDescription>
                    Este é como os participantes Erasmus veem seu perfil
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="ml-4"
                >
                  Editar Perfil
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Full Profile Display using EsnerProfile component */}
          <Card>
            <CardContent className="p-0">
              <EsnerProfile 
                esner={{
                  id: profile.id,
                  name: profile.name,
                  photoURL: profile.photoURL,
                  starters: profile.starters,
                  interests: profile.interests,
                  bio: profile.bio,
                  socials: profile.socials,
                  visible: profile.visible
                }}
                isUnlocked={true}
              />
            </CardContent>
          </Card>

          {/* QR Code Section */}
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
            <CardContent className="text-center space-y-4">
              {user && (
                <div className="bg-white p-6 rounded-lg inline-block shadow-sm border">
                  <img
                    src={generateQRCodeImageUrl(generateProfileQRUrl(user.uid))}
                    alt="Profile QR Code"
                    className="w-56 h-56"
                    onLoad={() => {
                      console.log('QR Code generated for user ID:', user.uid);
                      console.log('QR URL:', generateProfileQRUrl(user.uid));
                    }}
                  />
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Participantes Erasmus podem escanear este código para desbloquear e visualizar seu perfil
                </p>
                <div className="flex gap-2 justify-center">
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
                    Compartilhar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Preview
              {watchedVisible ? (
                <Badge variant="default" className="ml-auto">Visible</Badge>
              ) : (
                <Badge variant="secondary" className="ml-auto">Hidden</Badge>
              )}
            </CardTitle>
            <CardDescription>
              This is how participants will see your profile {watchedVisible ? '' : '(currently hidden)'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.photoURL || undefined} alt={profile.name || 'Profile'} />
                <AvatarFallback>
                  {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{profile.name || 'Anonymous User'}</h3>
                <p className="text-sm text-muted-foreground">ESN Volunteer</p>
              </div>
            </div>

            {profile.bio && (
              <p className="text-sm text-muted-foreground">{profile.bio}</p>
            )}

            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Conversation Starters
              </h4>
              <div className="space-y-1">
                {profile.starters && profile.starters.length > 0 ? profile.starters.map((starter, index) => (
                  <p key={index} className="text-sm bg-muted p-2 rounded">
                    💬 {starter}
                  </p>
                )) : (
                  <p className="text-sm text-muted-foreground">No conversation starters set</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Interests
              </h4>
              <div className="flex flex-wrap gap-2">
                {profile.interests && profile.interests.length > 0 ? profile.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary">
                    {interest}
                  </Badge>
                )) : (
                  <p className="text-sm text-muted-foreground">No interests set</p>
                )}
              </div>
            </div>

            {(profile.socials?.instagram || profile.socials?.linkedin) && (
              <div className="flex gap-4 pt-2">
                {profile.socials?.instagram && (
                  <a
                    href={`https://instagram.com/${profile.socials.instagram?.replace('@', '') || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Instagram className="h-4 w-4" />
                    {profile.socials.instagram || 'Instagram'}
                  </a>
                )}
                {profile.socials?.linkedin && (
                  <a
                    href={profile.socials.linkedin || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>
            Update your information to help participants get to know you better
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4">
              <AlertDescription>Profile saved successfully!</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Your full name"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Photo URL */}
            <div className="space-y-2">
              <Label htmlFor="photoURL">Photo URL</Label>
              <Input
                id="photoURL"
                type="url"
                {...register('photoURL')}
                placeholder="https://example.com/your-photo.jpg"
              />
              {errors.photoURL && (
                <p className="text-sm text-destructive">{errors.photoURL.message}</p>
              )}
            </div>

            {/* Conversation Starters */}
            <div className="space-y-2">
              <Label>Conversation Starters * (1-3)</Label>
              {watchedStarters.map((starter, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    {...register(`starters.${index}`)}
                    placeholder="e.g., Ask me about my favorite travel destination"
                    className="flex-1"
                  />
                  {watchedStarters.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeStarter(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {watchedStarters.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStarter}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add another starter
                </Button>
              )}
              {errors.starters && (
                <p className="text-sm text-destructive">{errors.starters.message}</p>
              )}
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <Label>Interests *</Label>
              {watchedInterests.map((interest, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    {...register(`interests.${index}`)}
                    placeholder="e.g., Photography, Hiking, Cooking"
                    className="flex-1"
                  />
                  {watchedInterests.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeInterest(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addInterest}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add another interest
              </Button>
              {errors.interests && (
                <p className="text-sm text-destructive">{errors.interests.message}</p>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                {...register('bio')}
                placeholder="Tell people about yourself..."
                rows={3}
              />
              {errors.bio && (
                <p className="text-sm text-destructive">{errors.bio.message}</p>
              )}
            </div>

            {/* Social Media */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram Handle</Label>
                <Input
                  id="instagram"
                  {...register('instagram')}
                  placeholder="@username"
                />
                {errors.instagram && (
                  <p className="text-sm text-destructive">{errors.instagram.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  type="url"
                  {...register('linkedin')}
                  placeholder="https://linkedin.com/in/username"
                />
                {errors.linkedin && (
                  <p className="text-sm text-destructive">{errors.linkedin.message}</p>
                )}
              </div>
            </div>

            {/* Visibility */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="visible"
                checked={watchedVisible}
                onCheckedChange={(checked) => setValue('visible', checked as boolean)}
              />
              <Label htmlFor="visible" className="text-sm">
                Make my profile visible to participants
              </Label>
            </div>

            <Separator />

            {/* Submit */}
            <Button
              type="submit"
              disabled={saving}
              className="w-full"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Save Profile'
              )}
            </Button>

            {/* Sign Out Button */}
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                try {
                  const { signOut } = await import('firebase/auth');
                  const { auth } = await import('@/lib/firebase-client');
                  await signOut(auth);
                  router.push('/');
                } catch (error) {
                  console.error('Error signing out:', error);
                }
              }}
              className="w-full mt-2"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Profile Preview Section */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Preview
            </CardTitle>
            <CardDescription>
              This is how participants will see your profile when unlocked
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EsnerProfile
              esner={{
                id: user?.uid || '',
                name: profile.name,
                photoURL: profile.photoURL,
                starters: profile.starters,
                interests: profile.interests,
                bio: profile.bio,
                socials: profile.socials,
                visible: profile.visible,
              }}
              isUnlocked={true}
              isOwnProfile={true}
              showBackButton={false}
            />
          </CardContent>
        </Card>
      )}

      {/* QR Code Section */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Your QR Code
            </CardTitle>
            <CardDescription>
              Share this QR code with Erasmus participants to let them unlock your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {user && (
              <div className="bg-white p-4 rounded-lg inline-block">
                <img
                  src={generateQRCodeImageUrl(generateProfileQRUrl(user.uid))}
                  alt="Profile QR Code"
                  className="w-48 h-48"
                  onLoad={() => {
                    console.log('QR Code generated for user ID:', user.uid);
                    console.log('QR URL:', generateProfileQRUrl(user.uid));
                  }}
                />
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Erasmus participants can scan this to unlock and view your profile
            </p>
            <Button
              variant="outline"
              onClick={() => router.push('/me/qr')}
              className="w-full"
            >
              <QrCode className="mr-2 h-4 w-4" />
              View Full Screen QR
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
