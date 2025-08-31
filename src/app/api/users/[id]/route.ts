import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

// Firebase config for client-side fallback
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Initialize client-side Firebase as fallback
const clientApp = getApps().length === 0 ? initializeApp(firebaseConfig, 'admin-fallback') : getApps()[0];
const clientDb = getFirestore(clientApp);

// Helper function to create standardized error responses
function createErrorResponse(message: string, status: number, code?: string, retryable: boolean = false) {
  return NextResponse.json(
    { 
      error: message, 
      code: code || `ERROR_${status}`,
      retryable,
      timestamp: new Date().toISOString()
    },
    { status }
  );
}

// Helper function to verify token from header
async function verifyAuthToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const { searchParams } = new URL(request.url);
    const incrementUnlock = searchParams.get('incrementUnlock') === 'true';

    console.log('Fetching user profile for ID:', userId);

    if (!userId) {
      return createErrorResponse('User ID is required', 400, 'MISSING_USER_ID');
    }

    // Try admin SDK first, fallback to client SDK
    try {
      const userDoc = await adminDb.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        return createErrorResponse('User not found', 404, 'USER_NOT_FOUND');
      }

      const userData = userDoc.data();

      // Handle unlock increment if requested
      if (incrementUnlock && userData && userData.role === 'esnner') {
        const currentUnlocks = userData.unlockedCount || 0;
        await adminDb.collection('users').doc(userId).update({
          unlockedCount: currentUnlocks + 1,
          updatedAt: new Date()
        });
        userData.unlockedCount = currentUnlocks + 1;
      }

      return NextResponse.json({
        uid: userDoc.id,
        ...userData,
      });

    } catch (adminError) {
      console.log('Admin SDK failed, using client fallback for GET:', adminError);
      
      // Fallback to client SDK
      try {
        const userDocRef = doc(clientDb, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
          return createErrorResponse('User not found', 404, 'USER_NOT_FOUND');
        }

        const userData = userDocSnap.data();

        // Handle unlock increment if requested
        if (incrementUnlock && userData && userData.role === 'esnner') {
          const currentUnlocks = userData.unlockedCount || 0;
          await updateDoc(userDocRef, {
            unlockedCount: currentUnlocks + 1,
            updatedAt: new Date()
          });
          userData.unlockedCount = currentUnlocks + 1;
        }

        return NextResponse.json({
          uid: userDocSnap.id,
          ...userData,
        });

      } catch (clientError) {
        console.error('Both admin and client SDK failed for GET:', clientError);
        return createErrorResponse('Database access failed', 500, 'DB_ACCESS_ERROR');
      }
    }

  } catch (error: any) {
    console.error('Get user error:', error);
    
    if (error.code === 'permission-denied') {
      return createErrorResponse(
        'You do not have permission to access this user profile',
        403,
        'PERMISSION_DENIED'
      );
    }
    
    return createErrorResponse(
      'Failed to load user profile. Please try again.',
      500,
      'FETCH_USER_ERROR',
      true
    );
  }
}

/**
 * PATCH /api/users/[id] - Update existing user profile
 * Recommended method for profile updates
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const authHeader = request.headers.get('authorization');
    const updateData = await request.json();

    console.log('PATCH user profile for ID:', userId);

    if (!userId) {
      return createErrorResponse('User ID is required', 400, 'MISSING_USER_ID');
    }

    // Verify authentication
    const decodedToken = await verifyAuthToken(authHeader);
    if (!decodedToken) {
      return createErrorResponse(
        'Authentication required to update profile',
        401,
        'AUTH_REQUIRED'
      );
    }

    // Check if user is updating their own profile or is admin
    const isOwnProfile = decodedToken.uid === userId;
    let isAdmin = false;

    if (!isOwnProfile) {
      const adminDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
      const adminData = adminDoc.data();
      isAdmin = adminData?.role === 'admin';
    }

    if (!isOwnProfile && !isAdmin) {
      return createErrorResponse(
        'You can only update your own profile',
        403,
        'FORBIDDEN'
      );
    }

    // Check if user exists
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return createErrorResponse(
        'User not found',
        404,
        'USER_NOT_FOUND'
      );
    }

    // Define allowed fields based on user type
    const allowedFields = isAdmin 
      ? ['name', 'photoURL', 'starters', 'interests', 'bio', 'socials', 'visible', 'role', 'unlockedCount']
      : ['name', 'photoURL', 'starters', 'interests', 'bio', 'socials', 'visible'];
    
    // Filter and validate update data
    const filteredData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    // Validate required fields if they're being updated
    if (filteredData.name !== undefined && (!filteredData.name || filteredData.name.trim() === '')) {
      return createErrorResponse(
        'Name cannot be empty',
        400,
        'INVALID_NAME'
      );
    }

    // Add timestamp
    filteredData.updatedAt = new Date();

    // Update user document
    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update(filteredData);

    // Return updated user data
    const updatedDoc = await userRef.get();
    
    console.log('User profile updated successfully:', userId);
    
    return NextResponse.json({
      success: true,
      user: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
      message: 'Profile updated successfully'
    });

  } catch (error: any) {
    console.error('Update user error:', error);
    
    if (error.code === 'permission-denied') {
      return createErrorResponse(
        'Permission denied. Please check your authentication.',
        403,
        'PERMISSION_DENIED'
      );
    }
    
    if (error.code === 'not-found') {
      return createErrorResponse(
        'User not found',
        404,
        'USER_NOT_FOUND'
      );
    }
    
    return createErrorResponse(
      'Failed to update profile. Please try again.',
      500,
      'UPDATE_USER_ERROR',
      true
    );
  }
}
