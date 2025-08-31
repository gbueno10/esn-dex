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
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, X, QrCode, User, Edit2, Save, ArrowLeft } from 'lucide-react';
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

interface EsnerProfileData {
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
  const [profile, setProfile] = useState<EsnerProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Redirect participants to the homepage
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
            setIsEditing(false);
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

    setSaving(true);
    setError(null);

    try {
      const profileData = {
        uid: user.uid,
        role: 'esnner',
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

      const result = await response.json();
      setProfile({ ...profileData, id: user.uid } as EsnerProfileData);
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
                    {profile.visible ? (
                      <Badge variant="default" className="ml-2">Visível</Badge>
                    ) : (
                      <Badge variant="secondary" className="ml-2">Oculto</Badge>
                    )}
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
                  <Edit2 className="mr-2 h-4 w-4" />
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
        </>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Edit Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Edit2 className="h-5 w-5" />
                    Editando Perfil
                  </CardTitle>
                  <CardDescription>
                    Atualize suas informações que serão visíveis para participantes Erasmus
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Salvar
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Seu nome completo"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Photo URL */}
              <div className="space-y-2">
                <Label htmlFor="photoURL">URL da Foto</Label>
                <Input
                  id="photoURL"
                  {...register('photoURL')}
                  placeholder="https://example.com/sua-foto.jpg"
                />
                {errors.photoURL && (
                  <p className="text-sm text-red-600">{errors.photoURL.message}</p>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  {...register('bio')}
                  placeholder="Conte um pouco sobre você..."
                  className="min-h-[100px]"
                />
                {errors.bio && (
                  <p className="text-sm text-red-600">{errors.bio.message}</p>
                )}
              </div>

              {/* Visibility */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="visible"
                  {...register('visible')}
                />
                <Label htmlFor="visible">
                  Tornar perfil visível para participantes Erasmus
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Conversation Starters */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation Starters</CardTitle>
              <CardDescription>
                Adicione até 3 tópicos para iniciar conversas (mínimo 1)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {watchedStarters.map((starter, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    {...register(`starters.${index}`)}
                    placeholder="Ex: Vamos tomar um café?"
                  />
                  {watchedStarters.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
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
                  onClick={addStarter}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Starter
                </Button>
              )}
              
              {errors.starters && (
                <p className="text-sm text-red-600">{errors.starters.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Interests */}
          <Card>
            <CardHeader>
              <CardTitle>Interesses</CardTitle>
              <CardDescription>
                Adicione seus hobbies e interesses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {watchedInterests.map((interest, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    {...register(`interests.${index}`)}
                    placeholder="Ex: Fotografia, Culinária, Esportes..."
                  />
                  {watchedInterests.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
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
                onClick={addInterest}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Interesse
              </Button>
              
              {errors.interests && (
                <p className="text-sm text-red-600">{errors.interests.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociais</CardTitle>
              <CardDescription>
                Adicione suas redes sociais para que participantes possam te seguir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  {...register('instagram')}
                  placeholder="@seuusuario ou URL completa"
                />
                {errors.instagram && (
                  <p className="text-sm text-red-600">{errors.instagram.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  {...register('linkedin')}
                  placeholder="URL do seu LinkedIn"
                />
                {errors.linkedin && (
                  <p className="text-sm text-red-600">{errors.linkedin.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
