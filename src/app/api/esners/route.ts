import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
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

    return NextResponse.json(esners);
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
