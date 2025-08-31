import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

// Firebase config for client-side fallback
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // Add other config if needed
};

// Initialize client-side Firebase as fallback
const clientApp = getApps().length === 0 ? initializeApp(firebaseConfig, 'admin-fallback') : getApps()[0];
const clientDb = getFirestore(clientApp);

// Helper function to create standardized error responses
function createErrorResponse(message: string, status: number, code?: string) {
  return NextResponse.json(
    { 
      error: message, 
      code: code || `ERROR_${status}`,
      timestamp: new Date().toISOString()
    },
    { status }
  );
}

// Helper function to verify auth token
async function verifyAuthToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.substring(7);
    return await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (uid) {
      // Try admin SDK first, fallback to client SDK
      try {
        const userDoc = await adminDb.collection('users').doc(uid).get();
        
        if (!userDoc.exists) {
          return createErrorResponse('User not found', 404, 'USER_NOT_FOUND');
        }

        return NextResponse.json({
          uid: userDoc.id,
          ...userDoc.data(),
        });
      } catch (adminError) {
        console.log('Admin SDK failed, using client fallback:', adminError);
        
        // Fallback to client SDK
        try {
          const userDocRef = doc(clientDb, 'users', uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (!userDocSnap.exists()) {
            return createErrorResponse('User not found', 404, 'USER_NOT_FOUND');
          }

          return NextResponse.json({
            uid: userDocSnap.id,
            ...userDocSnap.data(),
          });
        } catch (clientError) {
          console.error('Both admin and client SDK failed:', clientError);
          return createErrorResponse('Database access failed', 500, 'DB_ACCESS_ERROR');
        }
      }
    } else {
      // Get all users (admin only)
      const decodedToken = await verifyAuthToken(request);
      
      if (!decodedToken) {
        return createErrorResponse('Authentication required', 401, 'AUTH_REQUIRED');
      }

      // Check if user has admin role
      const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
      const userData = userDoc.data();
      
      if (userData?.role !== 'admin') {
        return createErrorResponse('Admin access required', 403, 'ADMIN_REQUIRED');
      }

      const usersSnapshot = await adminDb.collection('users').get();
      const users = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
      }));

      return NextResponse.json({
        users,
        total: users.length,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error: any) {
    console.error('Get users error:', error);
    return createErrorResponse(
      'Failed to fetch users. Please try again later.',
      500,
      'FETCH_USERS_ERROR'
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('API /users POST received:', body);

    const { uid, email, role = 'participant' } = body;

    if (!uid) {
      return createErrorResponse('User ID is required', 400, 'MISSING_UID');
    }

    // Try admin SDK first, fallback to client SDK
    try {
      // Check if user already exists
      const existingUser = await adminDb.collection('users').doc(uid).get();
      
      if (existingUser.exists) {
        return createErrorResponse(
          'User already exists. Use PATCH /api/users/[id] to update.',
          409,
          'USER_EXISTS'
        );
      }

      // Create new user document
      const newUserData = {
        email: email || null,
        role,
        visible: role === 'participant' ? false : true, // Anonymous users are not visible by default
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await adminDb.collection('users').doc(uid).set(newUserData);

      console.log('User created successfully with Admin SDK:', uid);

      return NextResponse.json({
        success: true,
        user: {
          uid,
          ...newUserData
        },
        message: 'User created successfully'
      }, { status: 201 });

    } catch (adminError) {
      console.log('Admin SDK failed, using client fallback for POST:', adminError);
      
      // Fallback to client SDK
      try {
        // Check if user already exists
        const userDocRef = doc(clientDb, 'users', uid);
        const existingUser = await getDoc(userDocRef);
        
        if (existingUser.exists()) {
          return createErrorResponse(
            'User already exists. Use PATCH /api/users/[id] to update.',
            409,
            'USER_EXISTS'
          );
        }

        // Create new user document
        const newUserData = {
          email: email || null,
          role,
          visible: role === 'participant' ? false : true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(userDocRef, newUserData);

        console.log('User created successfully with Client SDK:', uid);

        return NextResponse.json({
          success: true,
          user: {
            uid,
            ...newUserData
          },
          message: 'User created successfully'
        }, { status: 201 });

      } catch (clientError) {
        console.error('Both admin and client SDK failed for POST:', clientError);
        return createErrorResponse('Failed to create user', 500, 'CREATE_USER_ERROR');
      }
    }

  } catch (error: any) {
    console.error('Create user error:', error);
    
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      return createErrorResponse(
        'Permission denied. Please check your authentication.',
        403,
        'PERMISSION_DENIED'
      );
    }
    
    return createErrorResponse(
      'Failed to create user. Please try again later.',
      500,
      'CREATE_USER_ERROR'
    );
  }
}
