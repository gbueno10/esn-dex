'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthGate');
  }
  return context;
};

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);

        // Get or create user document via API
        const fetchUserWithRetry = async (retries = 3): Promise<void> => {
          try {
            const response = await fetch(`/api/users?uid=${authUser.uid}`);
            if (response.ok) {
              const userData = await response.json();
              setUserRole(userData.role);
            } else if (response.status === 404) {
              // New user - only anonymous participants are created automatically
              if (authUser.isAnonymous) {
                const createResponse = await fetch('/api/users', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    uid: authUser.uid,
                    email: authUser.email,
                    role: 'participant',
                  }),
                });
                
                if (createResponse.ok) {
                  setUserRole('participant');
                }
              } else {
                // For non-anonymous users, retry a few times in case user document is still being created
                if (retries > 0) {
                  console.log(`User document not found, retrying... (${retries} attempts left)`);
                  setTimeout(() => fetchUserWithRetry(retries - 1), 1000);
                  return;
                } else {
                  // ESNers must sign in via /login; they are not auto-created
                  console.log('ESNer needs to sign in properly');
                  setUserRole(null);
                }
              }
            }
          } catch (error) {
            console.error('Error managing user:', error);
            if (retries > 0) {
              setTimeout(() => fetchUserWithRetry(retries - 1), 1000);
            }
          }
        };

        await fetchUserWithRetry();
      } else {
        // No user - do NOT sign in anonymously automatically
        // Users will only be signed in anonymously when they click "Start Playing"
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
