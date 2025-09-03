import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { MOCK_CHALLENGES, Challenge } from '@/lib/challenges';

export interface FirestoreChallenge extends Challenge {
  createdAt: Date;
  isActive: boolean;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting challenges upload to Firestore...');
    
    // Create a batch for atomic operation
    const batch = adminDb.batch();
    const challengesRef = adminDb.collection('esn-challenges');
    
    // Add all challenges to the batch
    for (const challenge of MOCK_CHALLENGES) {
      const challengeDocRef = challengesRef.doc(challenge.id);
      
      const firestoreChallenge: FirestoreChallenge = {
        ...challenge,
        createdAt: new Date(),
        isActive: true
      };
      
      batch.set(challengeDocRef, firestoreChallenge);
      console.log(`Added challenge to batch: ${challenge.id} - ${challenge.title}`);
    }
    
    // Commit the batch
    await batch.commit();
    
    console.log(`Successfully uploaded ${MOCK_CHALLENGES.length} challenges to Firestore!`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${MOCK_CHALLENGES.length} challenges to Firestore`,
      challenges: MOCK_CHALLENGES.map(c => ({ id: c.id, title: c.title, category: c.category }))
    });
    
  } catch (error) {
    console.error('Error uploading challenges:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload challenges',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const categories = Array.from(new Set(MOCK_CHALLENGES.map(c => c.category)));
  
  return NextResponse.json({
    message: 'Challenges Upload API',
    description: 'Use POST to upload all challenges to Firestore',
    totalChallenges: MOCK_CHALLENGES.length,
    categories: categories,
    endpoint: '/api/challenges/upload'
  });
}
