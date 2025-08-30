import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (uid) {
      // Get specific user
      const userDoc = await adminDb.collection('users').doc(uid).get();

      if (!userDoc.exists) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        uid: userDoc.id,
        ...userDoc.data(),
      });
    } else {
      // Get all users
      const usersSnapshot = await adminDb.collection('users').get();
      const users = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
      }));

      return NextResponse.json(users);
    }
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('API /users received:', body);

    const { uid, role, ...userData } = body;

    if (!uid) {
      console.error('No UID provided');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('Updating user:', uid, 'with data:', userData);

    const userRef = adminDb.collection('users').doc(uid);
    await userRef.set({
      ...userData,
      role: role || 'participant',
      updatedAt: new Date(),
    }, { merge: true });

    console.log('User updated successfully');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    );
  }
}
