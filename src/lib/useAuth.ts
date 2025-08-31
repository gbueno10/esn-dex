import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';

export interface UserProfile {
  uid: string;
  email: string | null;
  role: string;
  name?: string;
  unlockedProfiles?: string[];
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Fetch user profile from API
          const response = await fetch(`/api/users?uid=${firebaseUser.uid}`);
          if (response.ok) {
            const profile = await response.json();
            setUserProfile(profile);
          } else {
            // If no profile exists, create one
            const createResponse = await fetch('/api/users', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                role: 'participant', // Default role
              }),
            });

            if (createResponse.ok) {
              const profile = await createResponse.json();
              setUserProfile(profile);
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
    isEsnner: userProfile?.role === 'esnner',
  };
}
