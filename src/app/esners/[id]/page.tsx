'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthGate';
import { Profile, ProfileData } from '@/components/Profile';
import { Loader2 } from 'lucide-react';

interface EsnerData {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string;
  photoURL?: string;
  bio?: string;
  section?: string;
  nationality?: string;
  visible: boolean;
  unlockedCount?: number;
  starters?: string[];
  interests?: string[];
  socials?: {
    instagram?: string;
    linkedin?: string;
  };
}

interface UserData {
  unlockedProfiles: string[];
}

export default function EsnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userRole, loading: authLoading } = useAuth();
  const [esner, setEsner] = useState<ProfileData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const esnerId = params.id as string;

  useEffect(() => {
    // Wait for auth to complete loading
    if (authLoading) return;
    
    if (!user) {
      router.push('/signin');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get Firebase auth token
        const token = await user.getIdToken();
        
        // Buscar dados do ESNer
        const esnerResponse = await fetch(`/api/esners?id=${esnerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!esnerResponse.ok) {
          throw new Error('ESNer not found');
        }

        const esnerData = await esnerResponse.json();
        
        // The API `/api/esners` currently returns a list of profiles. Handle both
        // array and single-object responses: if an array is returned, try to find
        // the profile with the requested id; otherwise use the object directly.
        const rawEsner = Array.isArray(esnerData)
          ? (esnerData.find((p: any) => p.id === esnerId) || esnerData[0])
          : esnerData;

        if (!rawEsner) {
          throw new Error('ESNer not found');
        }

        // Convert to ProfileData format (be defensive with property names)
        const profileData: ProfileData = {
          id: rawEsner.id || esnerId,
          name: rawEsner.name || rawEsner.displayName || '',
          photoURL: rawEsner.photoURL || rawEsner.profilePicture || '',
          bio: rawEsner.bio || rawEsner.description || '',
          nationality: rawEsner.nationality || '',
          starters: rawEsner.starters || [],
          interests: rawEsner.interests || [],
          socials: rawEsner.socials || {},
          visible: rawEsner.visible ?? false,
          unlockedCount: rawEsner.unlockedCount
        };
        
        setEsner(profileData);

        // Buscar dados do usuário atual
        const userResponse = await fetch(`/api/users/${user.uid}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (userResponse.ok) {
          const currentUserData = await userResponse.json();
          console.log('Current user data:', currentUserData);
          console.log('ESNer ID we are looking for:', esnerId);
          console.log('Unlocked profiles:', currentUserData.unlockedProfiles);
          console.log('User role:', userRole);
          setUserData(currentUserData);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, esnerId, router, userRole]);

  // Show loading while auth is still loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !esner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The ESNer profile you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => router.push('/esners')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to ESNers
          </button>
        </div>
      </div>
    );
  }

  // Verificar se o perfil está desbloqueado
  const isUnlocked = userRole === 'esnner' || userData?.unlockedProfiles?.includes(esnerId) || false;
  
  console.log('Is unlocked check:', {
    esnerId,
    userRole,
    unlockedProfiles: userData?.unlockedProfiles,
    isUnlocked
  });

  if (!isUnlocked && esner) {
    return (
      <Profile 
        profile={esner}
        mode="locked"
        showBackButton={true}
        onBack={() => router.push('/esners')}
      />
    );
  }

  if (esner) {
    return (
      <Profile 
        profile={esner}
        mode="unlocked"
        showBackButton={true}
        onBack={() => router.push('/esners')}
      />
    );
  }

  return null;
}
