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
        try {
          const response = await fetch(`/api/users?uid=${authUser.uid}`);
          if (response.ok) {
            const userData = await response.json();
            setUserRole(userData.role);
          } else if (response.status === 404) {
            // New user - apenas participantes anônimos são criados automaticamente
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
              // ESNers devem fazer login via /signin, não são criados automaticamente
              console.log('ESNer needs to sign in properly');
              setUserRole(null);
            }
          }
        } catch (error) {
          console.error('Error managing user:', error);
        }
      } else {
        // No user - sign in anonymously
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error('Anonymous sign-in failed:', error);
        }
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
