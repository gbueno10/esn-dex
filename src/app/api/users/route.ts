import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

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
      // Get specific user
      const userDoc = await adminDb.collection('users').doc(uid).get();

      if (!userDoc.exists) {
        return createErrorResponse('User not found', 404, 'USER_NOT_FOUND');
      }

      return NextResponse.json({
        uid: userDoc.id,
        ...userDoc.data(),
      });
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

/**
 * POST /api/users - Create new user document (initial setup only)
 * For updates, use PATCH /api/users/[id]
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('API /users POST received:', body);

    const { uid, email, name, role = 'participant' } = body;

    if (!uid) {
      return createErrorResponse('User ID is required', 400, 'MISSING_UID');
    }

    if (!email || !name) {
      return createErrorResponse('Email and name are required', 400, 'MISSING_REQUIRED_FIELDS');
    }

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
      email,
      name,
      role,
      visible: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await adminDb.collection('users').doc(uid).set(newUserData);

    console.log('User created successfully:', uid);

    return NextResponse.json({
      success: true,
      user: {
        uid,
        ...newUserData
      },
      message: 'User created successfully'
    }, { status: 201 });

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
