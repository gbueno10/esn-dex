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

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await verifyAuthToken(authHeader);
    
    // Get URL search params
    const { searchParams } = new URL(request.url);
    const viewerId = searchParams.get('viewerId') || user?.uid;
    
    // Query for users with role 'esnner' and visible not false (includes null/undefined)
    const usersSnapshot = await adminDb
      .collection('users')
      .where('role', '==', 'esnner')
      .get();
    
    // Filter out users where visible is explicitly false
    const esners = usersSnapshot.docs
      .map(doc => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          ...data,
        };
      })
      .filter((esner: any) => esner.visible !== false);

    // If we have a viewer, check unlock status for each esner
    if (viewerId) {
      // Get viewer's unlocked profiles
      const viewerDoc = await adminDb.collection('users').doc(viewerId).get();
      const viewerData = viewerDoc.data();
      const unlockedProfiles = viewerData?.unlockedProfiles || [];

      const esnersWithUnlockStatus = esners.map(esner => ({
        ...esner,
        isUnlocked: unlockedProfiles.includes(esner.id)
      }));
      
      return NextResponse.json(esnersWithUnlockStatus);
    }

    return NextResponse.json(esners.map(esner => ({ ...esner, isUnlocked: false })));
  } catch (error: any) {
    console.error('Get esners error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch esners' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, userId, ...esnerData } = await request.json();

    if (!name || !userId) {
      return NextResponse.json(
        { error: 'Name and User ID are required' },
        { status: 400 }
      );
    }

    // Update user document with profile data
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await userRef.update({
      name,
      email,
      updatedAt: new Date(),
      ...esnerData,
    });

    // No longer need to create separate unlock document
    // Unlock info is now stored in the viewer's user document

    return NextResponse.json({
      id: userId,
      name,
      email,
      userId,
    });
  } catch (error: any) {
    console.error('Create esner error:', error);
    return NextResponse.json(
      { error: 'Failed to create esner' },
      { status: 500 }
    );
  }
}
