'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthGate';
import { getEsner, checkUnlock, Esner } from '@/lib/firestore';
import { ProfileLocked } from '@/components/ProfileLocked';
import { ProfileUnlocked } from '@/components/ProfileUnlocked';

export default function EsnerProfilePage() {
  const params = useParams();
  const { user } = useAuth();
  const [esner, setEsner] = useState<Esner | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = params.id as string;

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !userId) return;

      try {
        const [esnerData, unlocked] = await Promise.all([
          getEsner(userId),
          checkUnlock(user.uid, userId)
        ]);

        if (!esnerData) {
          setError('Profile not found');
          return;
        }

        if (!esnerData.visible) {
          setError('This profile is not available');
          return;
        }

        setEsner(esnerData);
        setIsUnlocked(unlocked);
      } catch (err) {
        setError('Failed to load profile');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
        <p className="text-gray-300">{error}</p>
        <a 
          href="/esners" 
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Profiles
        </a>
      </div>
    );
  }

  if (!esner) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-400 mb-4">Profile Not Found</h2>
        <a 
          href="/esners" 
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Profiles
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {isUnlocked ? (
        <ProfileUnlocked esner={esner} />
      ) : (
        <ProfileLocked esner={esner} />
      )}
    </div>
  );
}
