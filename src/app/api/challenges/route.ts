import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const challengesSnapshot = await adminDb.collection('challenges').get();
    const challenges = challengesSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(challenges);
  } catch (error: any) {
    console.error('Get challenges error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, type, points, esnnerId, ...challengeData } = await request.json();

    if (!title || !esnnerId) {
      return NextResponse.json(
        { error: 'Title and ESNner ID are required' },
        { status: 400 }
      );
    }

    const challengeRef = adminDb.collection('challenges').doc();
    const challengeId = challengeRef.id;

    await challengeRef.set({
      title,
      description,
      type: type || 'social',
      points: points || 10,
      esnnerId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...challengeData,
    });

    return NextResponse.json({
      id: challengeId,
      title,
      description,
      type,
      points,
      esnnerId,
    });
  } catch (error: any) {
    console.error('Create challenge error:', error);
    return NextResponse.json(
      { error: 'Failed to create challenge' },
      { status: 500 }
    );
  }
}
