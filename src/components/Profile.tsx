'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Lock, 
  Unlock, 
  Instagram, 
  Linkedin, 
  MessageCircle, 
  Heart, 
  User, 
  Edit2, 
  Save, 
  ArrowLeft,
  Plus,
  X,
  Loader2,
  MapPin,
  Globe,
  QrCode
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import app, { } from '@/lib/firebase-client';
import { storage } from '@/lib/firebase-client';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  photoURL: z.string().optional().or(z.literal('')),
  bio: z.string().max(300, 'Bio is too long').optional(),
  nationality: z.string().max(50, 'Nationality is too long').optional(),
  starters: z.array(z.string().min(1).max(100)).min(1, 'At least one starter is required').max(3, 'Maximum 3 starters'),
  interests: z.array(z.string().min(1).max(30)).min(1, 'At least one interest is required'),
  instagram: z.string().max(50, 'Instagram is too long').optional(),
  linkedin: z.string().max(100, 'LinkedIn is too long').optional(),
  whatsapp: z.string().max(30, 'WhatsApp is too long').optional(),
  visible: z.boolean()
});

type ProfileForm = z.infer<typeof profileSchema>;

export interface ProfileData {
  id: string;
  name: string;
  photoURL?: string;
  bio?: string;
  nationality?: string;
  starters: string[];
  interests: string[];
  socials?: {
    instagram?: string;
    linkedin?: string;
    whatsapp?: string;
  };
  visible: boolean;
  unlockedCount?: number;
}

export interface ProfileProps {
  profile: ProfileData;
  mode: 'view' | 'edit' | 'locked' | 'unlocked';
  onSave?: (data: ProfileForm) => Promise<void>;
  onEdit?: () => void;
  onCancel?: () => void;
  saving?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function Profile({ 
  profile, 
  mode, 
  onSave, 
  onEdit, 
  onCancel, 
  saving = false,
  showBackButton = false,
  onBack 
}: ProfileProps) {
  const [localSaving, setLocalSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
    reset
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name || '',
      photoURL: profile.photoURL || '',
      bio: profile.bio || '',
      nationality: profile.nationality || '',
      starters: profile.starters?.length > 0 ? profile.starters : [''],
      interests: profile.interests?.length > 0 ? profile.interests : [''],
      instagram: profile.socials?.instagram || '',
      linkedin: profile.socials?.linkedin || '',
      whatsapp: profile.socials?.whatsapp || '',
      visible: profile.visible || false
    }
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.photoURL || null);

  const handleFileUpload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      // show local preview immediately
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);

      // Use a fixed filename per profile so new uploads replace the old one in Storage
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `profiles/${profile.id}/profile.${ext}`;
      const ref = storageRef(storage, path);

      // upload bytes
      await uploadBytes(ref, file);

      // get download url
      const downloadUrl = await getDownloadURL(ref);

      // set form field to download url
      setValue('photoURL', downloadUrl);
      setPreviewUrl(downloadUrl);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleFileChangeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    void handleFileUpload(file);
  };

  const watchedStarters = watch('starters');
  const watchedInterests = watch('interests');

  const handleSave = async (data: ProfileForm) => {
    if (!onSave) return;
    
    setLocalSaving(true);
    try {
      await onSave(data);
      reset(data); // Reset form with new data
    } finally {
      setLocalSaving(false);
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

  // Modo Locked (perfil bloqueado)
  if (mode === 'locked') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            {/* Header Section - Similar to unlocked */}
            <div className="flex flex-col md:flex-row gap-6 mb-8 items-center">
              <Avatar className="w-36 h-36 mx-auto md:mx-0 shadow-sm">
                <AvatarImage 
                  src={profile.photoURL} 
                  alt={profile.name}
                  className="object-cover blur-md brightness-75"
                />
                <AvatarFallback className="text-3xl">
                  {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center">
                <h1 className="text-4xl font-extrabold mb-1 text-foreground">
                  {profile.name}
                </h1>

                {/* Nationality hidden */}
                <p className="text-lg font-medium text-muted-foreground mb-4 flex items-center justify-center gap-2">
                  <span className="text-2xl">🌍</span>
                  <span>?????</span>
                </p>

                {/* Bio shown but marked as preview */}
                {profile.bio && (
                  <>
                    <p className="text-base font-medium text-foreground leading-relaxed mb-4">{profile.bio}</p>
                    <Separator className="my-6" />
                  </>
                )}

                {/* Social media hidden */}
                <div className="mb-4 flex justify-center">
                  <div className="flex gap-4">
                    <Badge variant="secondary" className="px-4 py-2">
                      <Instagram className="w-4 h-4 mr-2" />
                      Hidden
                    </Badge>
                    <Badge variant="secondary" className="px-4 py-2">
                      <Linkedin className="w-4 h-4 mr-2" />
                      Hidden
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Lock indicator */}
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="gap-1">
                  <Lock className="w-4 h-4" />
                  Locked
                </Badge>
              </div>
            </div>

            {/* Content sections with same styling as unlocked */}
            <div className="space-y-8">
              {/* Conversation Starters */}
              {profile.starters && profile.starters.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <MessageCircle className="w-6 h-6 text-primary" />
                    <h3 className="text-2xl font-semibold text-foreground">Conversation Starters</h3>
                  </div>
                  <div className="space-y-4">
                    {profile.starters.map((starter, index) => (
                      <div key={index} className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
                        <p className="text-foreground font-medium flex items-start gap-2">
                          <MessageCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          {starter}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests hidden */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="w-6 h-6 text-primary" />
                  <h3 className="text-2xl font-semibold text-foreground">Interests</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="px-3 py-1 text-sm">🔒 Hidden</Badge>
                  <Badge variant="secondary" className="px-3 py-1 text-sm">🔒 Hidden</Badge>
                  <Badge variant="secondary" className="px-3 py-1 text-sm">🔒 Hidden</Badge>
                </div>
              </div>

              {/* Unlock CTA */}
              <div className="text-center bg-muted/5 rounded-xl p-6 border border-dashed">
                <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Want to see more?</h3>
                <p className="text-muted-foreground mb-4">
                  Find <span className="font-semibold text-foreground">{profile.name}</span> and ask them to show you their QR code to unlock their full profile!
                </p>
                
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-3">🔓 Unlock to discover:</p>
                  <div className="grid grid-cols-2 gap-2 text-left max-w-sm mx-auto">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-muted rounded-full"></span>
                      <span>Nationality</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-muted rounded-full"></span>
                      <span>All interests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-muted rounded-full"></span>
                      <span>Social media</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-muted rounded-full"></span>
                      <span>Full photo access</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {showBackButton && (
              <div className="mt-8 text-center">
                <Button 
                  variant="outline"
                  onClick={onBack}
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Profiles
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Modo Edit (edição)
  if (mode === 'edit') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6">
        <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
          {/* Edit Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Edit2 className="h-5 w-5" />
                    Editing Profile
                  </CardTitle>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="w-full sm:w-auto"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving || localSaving}
                    className="w-full sm:w-auto"
                  >
                    {(saving || localSaving) ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Photo upload card - placed first for better UX */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                {previewUrl ? (
                  <img src={previewUrl} alt="preview" className="w-36 h-36 rounded-full object-cover shadow-md" />
                ) : (
                  <div className="w-36 h-36 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">U</div>
                )}

                <div className="flex gap-2">
                  <label className="inline-flex items-center px-4 py-2 bg-slate-800 text-white rounded-md cursor-pointer">
                    <input id="photoUploadTop" type="file" accept="image/*" onChange={handleFileChangeUpload} className="hidden" />
                    {uploading ? 'Uploading...' : 'Upload photo'}
                  </label>
                  <button type="button" className="px-4 py-2 border rounded-md" onClick={() => { setPreviewUrl(null); setValue('photoURL', ''); }}>
                    Remove
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">Recommended: JPG or PNG, max 2MB</p>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Your full name"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  {...register('nationality')}
                  placeholder="e.g. Brazil, Portugal, Spain..."
                />
                {errors.nationality && (
                  <p className="text-sm text-red-600">{errors.nationality.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  {...register('bio')}
                  placeholder="Tell us a bit about yourself..."
                  className="min-h-[100px]"
                />
                {errors.bio && (
                  <p className="text-sm text-red-600">{errors.bio.message}</p>
                )}
              </div>

              {/* Social inputs moved to the 'Socials' card below to avoid duplicates */}
            </CardContent>
          </Card>

          {/* Conversation Starters */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation Starters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {watchedStarters.map((starter, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    {...register(`starters.${index}`)}
                    placeholder="e.g. Want to grab a coffee?"
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
                  Add Starter
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
              <CardTitle>Interests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {watchedInterests.map((interest, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    {...register(`interests.${index}`)}
                    placeholder="e.g. Photography, Cooking, Sports..."
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
                Add Interest
              </Button>
              
              {errors.interests && (
                <p className="text-sm text-red-600">{errors.interests.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Socials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={watch('instagram') || ''}
                  onChange={(e) => setValue('instagram', e.target.value)}
                  placeholder="@yourhandle or full URL"
                />
                {errors.instagram && (
                  <p className="text-sm text-red-600">{errors.instagram.message}</p>
                )}
              </div>
 
               <div className="space-y-2">
                 <Label htmlFor="linkedin">LinkedIn</Label>
                 <Input
                   id="linkedin"
                   value={watch('linkedin') || ''}
                   onChange={(e) => setValue('linkedin', e.target.value)}
                   placeholder="Your LinkedIn URL"
                 />
                 {errors.linkedin && (
                   <p className="text-sm text-red-600">{errors.linkedin.message}</p>
                 )}
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="whatsapp">WhatsApp</Label>
                 <Input
                   id="whatsapp"
                   value={watch('whatsapp') || ''}
                   onChange={(e) => setValue('whatsapp', e.target.value)}
                   placeholder="e.g. +351912345678"
                 />
                 {errors.whatsapp && (
                   <p className="text-sm text-red-600">{errors.whatsapp.message}</p>
                 )}
               </div>
            </CardContent>
          </Card>
          
          {/* Visible checkbox controlled via Controller to sync with RHF and Radix Checkbox */}
          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                control={control}
                name="visible"
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox id="visible" checked={!!field.value} onCheckedChange={(val) => field.onChange(val)} />
                    <Label htmlFor="visible">Make profile visible to Erasmus participants</Label>
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </form>
      </div>
    );
  }

  // Modo View/Unlocked (visualização completa)
  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6">
      {/* Header with Edit Button (only in view mode) */}
      {mode === 'view' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  <User className="h-5 w-5" />
                  {mode === 'view' ? 'My Profile' : 'ESNer Profile'}
                  {profile.visible ? (
                    <Badge variant="default" className="ml-2">Visible</Badge>
                  ) : (
                    <Badge variant="secondary" className="ml-2">Hidden</Badge>
                  )}
                </CardTitle>
              </div>
              {onEdit && (
                <Button 
                  onClick={onEdit}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Profile Content */}
      <Card className="shadow-lg">
        <CardContent className="p-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row gap-6 mb-8 items-center">
            <Avatar className="w-36 h-36 mx-auto md:mx-0 shadow-sm">
              <AvatarImage src={profile.photoURL} alt={profile.name} />
              <AvatarFallback className="text-3xl">
                {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-extrabold mb-1 text-foreground">
                {profile.name}
              </h1>

              {profile.nationality && (
                <p className="text-lg font-medium text-muted-foreground mb-4 flex items-center justify-center gap-2">
                  <span className="text-2xl">🌍</span>
                  <span>{profile.nationality}</span>
                </p>
              )}

              {/* Bio first */}
              {profile.bio && (
                <>
                  <p className="text-base font-medium text-foreground leading-relaxed mb-4">{profile.bio}</p>
                  <Separator className="my-6" />
                </>
              )}

              {/* Socials next (centered, no heading) */}
              {(profile.socials?.instagram || profile.socials?.linkedin || profile.socials?.whatsapp) && (
                <div className="mb-4 flex justify-center">
                  <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
                    {profile.socials?.instagram && (
                      <Button
                        variant="default"
                        size="sm"
                        asChild
                        className="px-3 py-2 font-medium text-xs sm:text-sm flex-shrink-0"
                      >
                        <a
                          href={`https://instagram.com/${profile.socials.instagram?.replace('@', '') || ''}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 sm:gap-2"
                        >
                          <Instagram className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">{profile.socials.instagram}</span>
                          <span className="sm:hidden">IG</span>
                        </a>
                      </Button>
                    )}

                    {profile.socials?.linkedin && (
                      <Button
                        variant="default"
                        size="sm"
                        asChild
                        className="px-3 py-2 font-medium text-xs sm:text-sm flex-shrink-0"
                      >
                        <a
                          href={profile.socials.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 sm:gap-2"
                        >
                          <Linkedin className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">LinkedIn</span>
                          <span className="sm:hidden">IN</span>
                        </a>
                      </Button>
                    )}

                    {profile.socials?.whatsapp && (
                      <Button
                        variant="default"
                        size="sm"
                        asChild
                        className="px-3 py-2 font-medium text-xs sm:text-sm flex-shrink-0"
                      >
                        <a
                          href={`https://wa.me/${String(profile.socials.whatsapp).replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 sm:gap-2"
                        >
                          <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">WhatsApp</span>
                          <span className="sm:hidden">WA</span>
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Interests next (centered) */}
              {profile.interests && profile.interests.length > 0 && (
                <div className="mb-4 flex flex-col items-center">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 justify-center">
                    <Heart className="w-5 h-5" />
                    Interests
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {profile.interests.map((interest, index) => (
                      <Badge key={index} variant="default" className="text-sm py-1.5 px-4 font-medium">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversation Starters last */}
              {profile.starters && profile.starters.length > 0 && (
                <div className="mb-8 w-full">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 justify-center">
                    <MessageCircle className="w-5 h-5" />
                    Conversation Starters
                  </h3>
                  <div className="grid gap-3">
                    {profile.starters.map((starter, index) => (
                      <div key={index} className="bg-muted/40 rounded-lg p-4">
                        <p className="text-sm font-medium">💬 {starter}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile.unlockedCount !== undefined && (
                <Badge variant="outline" className="mt-3 font-medium">
                  Unlocked {profile.unlockedCount} {profile.unlockedCount === 1 ? 'time' : 'times'}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
