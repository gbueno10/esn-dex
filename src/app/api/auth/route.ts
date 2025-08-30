import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { email, password, isRegister } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    let userRecord;

    try {
      if (isRegister) {
        // Create new user
        userRecord = await adminAuth.createUser({
          email,
          password,
          emailVerified: false,
        });
      } else {
        // Verify user exists (we'll handle sign in on client side)
        try {
          userRecord = await adminAuth.getUserByEmail(email);
        } catch (error) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }
      }

      // Update user role in Firestore
      const userRef = adminDb.collection('users').doc(userRecord.uid);
      await userRef.set({
        email: userRecord.email,
        role: 'esnner',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, { merge: true });

      return NextResponse.json({
        uid: userRecord.uid,
        email: userRecord.email,
        role: 'esnner',
      });
    } catch (adminError: any) {
      // If Admin SDK fails, return a message to use client-side auth
      console.warn('Admin SDK failed, falling back to client-side auth:', adminError.message);

      return NextResponse.json({
        useClientAuth: true,
        message: 'Using client-side authentication due to permission issues',
        email,
        isRegister,
      });
    }

  } catch (error: any) {
    console.error('Auth API error:', error);

    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    if (error.code === 'auth/invalid-email') {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (error.code === 'auth/weak-password') {
      return NextResponse.json(
        { error: 'Password is too weak' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
