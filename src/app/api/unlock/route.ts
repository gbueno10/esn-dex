import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/auth-server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await verifyIdToken(authHeader);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { esnnerId } = await request.json();
    
    if (!esnnerId) {
      return NextResponse.json({ error: 'ESNner ID is required' }, { status: 400 });
    }

    // Check if ESNner exists and is visible
    const userDoc = await adminDb.collection('users').doc(esnnerId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'ESNner not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    if (userData?.role !== 'esnner' || userData?.visible === false) {
      return NextResponse.json({ error: 'ESNner not available' }, { status: 404 });
    }

    // Check if unlock already exists (idempotent)
    const existingUnlock = await adminDb
      .collection('unlocks')
      .where('participantId', '==', user.uid)
      .where('esnnerId', '==', esnnerId)
      .limit(1)
      .get();

    if (existingUnlock.empty) {
      // Create new unlock
      await adminDb.collection('unlocks').add({
        participantId: user.uid,
        esnnerId: esnnerId,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unlock API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
