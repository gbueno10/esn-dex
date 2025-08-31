'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase-client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function EsnerSignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log('Starting signup process for:', email);
      
      // Prefer server-side creation via admin API
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, isRegister: true }),
      });

      const data = await response.json().catch(() => ({}));
      console.log('API /auth response:', { status: response.status, data });

      if (response.ok && !data?.useClientAuth) {
        // Created by admin SDK
        console.log('User created successfully via admin SDK');
        router.push('/me');
        return;
      }

      // If API indicates we should use client-side auth, fall back
      if (response.ok && data?.useClientAuth) {
        console.log('Falling back to client-side auth');
        try {
          const { createUserWithEmailAndPassword } = await import('firebase/auth');
          console.log('Creating user with Firebase Auth...');
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          console.log('Firebase Auth response:', userCredential);

          if (userCredential?.user) {
            console.log('User created via client SDK:', userCredential.user.uid);
            console.log('User email:', userCredential.user.email);
            
            try {
              console.log('Creating user document in Firestore...');
              const userResponse = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  uid: userCredential.user.uid, 
                  email: userCredential.user.email, 
                  role: 'esnner' 
                }),
              });
              
              const userData = await userResponse.json().catch(() => ({}));
              console.log('User document creation response:', { status: userResponse.status, data: userData });
              
              if (!userResponse.ok) {
                console.warn('Failed to create user document, but auth user was created');
                console.warn('Response data:', userData);
              } else {
                console.log('User document created successfully!');
              }
            } catch (apiError: any) {
              console.error('Failed to create user in Firestore after client create:', apiError);
            }

            console.log('Redirecting to /me');
            setSuccess(true);
            // Add longer delay to ensure user document is created and auth state is updated
            setTimeout(() => {
              router.push('/me');
            }, 2000);
          } else {
            throw new Error('Failed to create user with client SDK - no user returned');
          }
        } catch (authError: any) {
          console.error('Firebase Auth error:', authError);
          throw authError;
        }
      } else {
        // If API returned an error, show it
        throw new Error(data?.error || 'Failed to create account');
      }

    } catch (error: any) {
      console.error('Signup error:', error);

      if (error.code === 'auth/email-already-in-use' || error.message?.includes('already')) {
        setError('Email already exists. Try signing in instead.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else {
        setError(error.message || 'Signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-4 py-4 bg-muted/50">
        <h1 className="text-xl font-bold text-primary text-center">ESNer Sign Up</h1>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <Card className="w-full max-w-sm shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Create ESNer account</CardTitle>
            <CardDescription className="text-center">
              Only ESNers should register here. Your account will be created with the role &quot;esnner&quot;.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>Account created successfully! Redirecting to your profile...</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 6 chars)"
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" disabled={loading || success || !email || !password} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : success ? 'Redirecting...' : 'Create ESNer account'}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account? <a href="/login" className="text-primary underline">Sign in</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
