import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

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
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const userDoc = await adminDb.collection('users').doc(userId).get();

    console.log('User document exists:', userDoc.exists);

    if (!userDoc.exists) {
      console.log('User not found in Firestore for ID:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    // Only increment unlock count if specifically requested
    if (incrementUnlock) {
      const currentCount = userData?.unlockedCount || 0;
      await adminDb.collection('users').doc(userId).update({
        unlockedCount: currentCount + 1,
        lastUnlockedAt: new Date()
      });
      
      return NextResponse.json({
        id: userDoc.id,
        ...userData,
        unlockedCount: currentCount + 1
      });
    }

    return NextResponse.json({
      id: userDoc.id,
      ...userData,
    });
  } catch (error: any) {
    console.error('Get user by ID error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await verifyAuthToken(authHeader);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;
    const updateData = await request.json();
    
    // Verify user can only update their own profile
    if (user.uid !== userId) {
      return NextResponse.json(
        { error: 'You can only update your own profile' },
        { status: 403 }
      );
    }

    // Remove any sensitive fields that shouldn't be updated via this endpoint
    const allowedFields = [
      'name', 'photoURL', 'starters', 'interests', 'bio', 
      'socials', 'visible', 'updatedAt'
    ];
    
    const filteredData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    // Add timestamp
    filteredData.updatedAt = new Date();

    // Update user document
    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update(filteredData);

    // Return updated user data
    const updatedDoc = await userRef.get();
    return NextResponse.json({
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
