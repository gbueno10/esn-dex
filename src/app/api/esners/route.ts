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

    let profiles = [];

    // Get viewer's role to determine what they can see
    let viewerRole = 'participant'; // default
    if (viewerId) {
      const viewerDoc = await adminDb.collection('users').doc(viewerId).get();
      const viewerData = viewerDoc.data();
      viewerRole = viewerData?.role || 'participant';
      console.log('Viewer role:', viewerRole);
      console.log('Viewer data:', viewerData);
    }

    // Fetch ESNer profiles (only users with role == 'esnner')
    const esnersSnapshot = await adminDb
      .collection('users')
      .where('role', '==', 'esnner')
      .get();

    profiles = esnersSnapshot.docs
      .map(doc => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          ...data,
        };
      });

    // If the viewer is a participant, only show visible profiles
    if (viewerRole !== 'esnner') {
      profiles = profiles.filter((esner: any) => esner.visible !== false);
    }

    // If we have a viewer, check unlock status for each profile
    if (viewerId) {
      // Get viewer's unlocked profiles
      const viewerDoc = await adminDb.collection('users').doc(viewerId).get();
      const viewerData = viewerDoc.data();
      const unlockedProfiles = viewerData?.unlockedProfiles || [];

      const profilesWithUnlockStatus = profiles.map(profile => ({
        ...profile,
        // ESNers always see profiles as unlocked
        isUnlocked: viewerRole === 'esnner' || unlockedProfiles.includes(profile.id)
      }));

      return NextResponse.json(profilesWithUnlockStatus);
    }

    // No viewer provided: default to locked for participants, unlocked for ESNers
    return NextResponse.json(profiles.map(profile => ({ 
      ...profile, 
      isUnlocked: viewerRole === 'esnner' 
    })));
  } catch (error: any) {
    console.error('Get profiles error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, userId, ...profileData } = await request.json();

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
      ...profileData,
    });

    return NextResponse.json({
      id: userId,
      name,
      email,
      userId,
    });
  } catch (error: any) {
    console.error('Create profile error:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}
