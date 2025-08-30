import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); // ESNner ID
    const viewerId = searchParams.get('viewerId'); // Participant ID

    if (!userId || !viewerId) {
      return NextResponse.json(
        { error: 'User ID and Viewer ID are required' },
        { status: 400 }
      );
    }

    // Check if the viewer has unlocked this user's profile
    // We'll store unlock info in the viewer's user document
    const viewerDoc = await adminDb.collection('users').doc(viewerId).get();

    if (!viewerDoc.exists) {
      return NextResponse.json([]);
    }

    const viewerData = viewerDoc.data();
    const unlockedUsers = viewerData?.unlockedUsers || [];

    // Check if this user is in the unlocked list
    const isUnlocked = unlockedUsers.includes(userId);

    return NextResponse.json([{
      id: `${viewerId}-${userId}`,
      userId,
      viewerId,
      unlocked: isUnlocked,
      unlockedAt: isUnlocked ? new Date() : null
    }]);
  } catch (error: any) {
    console.error('Get unlocks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unlocks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, viewerId, unlocked = true } = await request.json();

    if (!userId || !viewerId) {
      return NextResponse.json(
        { error: 'User ID and Viewer ID are required' },
        { status: 400 }
      );
    }

    // Update the viewer's unlocked users list
    const viewerRef = adminDb.collection('users').doc(viewerId);
    const viewerDoc = await viewerRef.get();

    if (!viewerDoc.exists) {
      return NextResponse.json(
        { error: 'Viewer not found' },
        { status: 404 }
      );
    }

    const viewerData = viewerDoc.data();
    const unlockedUsers = viewerData?.unlockedUsers || [];

    if (unlocked) {
      // Add to unlocked list if not already there
      if (!unlockedUsers.includes(userId)) {
        unlockedUsers.push(userId);
      }
    } else {
      // Remove from unlocked list
      const index = unlockedUsers.indexOf(userId);
      if (index > -1) {
        unlockedUsers.splice(index, 1);
      }
    }

    await viewerRef.update({
      unlockedUsers,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      id: `${viewerId}-${userId}`,
      userId,
      viewerId,
      unlocked,
    });
  } catch (error: any) {
    console.error('Update unlock error:', error);
    return NextResponse.json(
      { error: 'Failed to update unlock' },
      { status: 500 }
    );
  }
}
