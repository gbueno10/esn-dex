import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const userDoc = await adminDb.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    // Update user's unlock count directly in the users collection
    const currentCount = userData?.unlockedCount || 0;
    await adminDb.collection('users').doc(userId).update({
      unlockedCount: currentCount + 1,
      lastUnlockedAt: new Date()
    });

    return NextResponse.json({
      uid: userDoc.id,
      ...userData,
      unlockedCount: currentCount + 1
    });
  } catch (error: any) {
    console.error('Get user by ID error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
