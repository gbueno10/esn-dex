import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Check for challenges in the new esn-challenges collection
    const challengesSnapshot = await adminDb.collection('esn-challenges').where('isActive', '==', true).get();
    
    const challenges = challengesSnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        emoji: data.emoji
      };
    });

    console.log(`API: Loaded ${challenges.length} challenges from Firestore`);
    return NextResponse.json({ success: true, challenges });
  } catch (error: any) {
    console.error('Get challenges error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch challenges' },
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
