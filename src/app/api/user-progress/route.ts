import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const progressDoc = await adminDb.collection('user-challenge-progress').doc(userId).get();
    
    if (progressDoc.exists) {
      const data = progressDoc.data();
      return NextResponse.json({
        success: true,
        progress: {
          userId,
          completedChallenges: data?.completedChallenges || [],
          completedAt: data?.completedAt || {},
          totalCompleted: data?.totalCompleted || 0,
          lastUpdated: data?.lastUpdated || new Date()
        }
      });
    } else {
      // Create new progress document
      const newProgress = {
        userId,
        completedChallenges: [],
        completedAt: {},
        totalCompleted: 0,
        lastUpdated: new Date()
      };
      
      await adminDb.collection('user-challenge-progress').doc(userId).set(newProgress);
      
      return NextResponse.json({
        success: true,
        progress: newProgress
      });
    }
  } catch (error: any) {
    console.error('Get user progress error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user progress' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, challengeId, action } = await request.json();
    
    if (!userId || !challengeId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const progressRef = adminDb.collection('user-challenge-progress').doc(userId);
    const progressDoc = await progressRef.get();
    
    let currentProgress: any = {
      completedChallenges: [],
      completedAt: {},
      totalCompleted: 0
    };
    
    if (progressDoc.exists) {
      currentProgress = progressDoc.data();
    }

    const now = new Date();
    
    if (action === 'complete') {
      // Add challenge to completed list
      if (!currentProgress.completedChallenges.includes(challengeId)) {
        currentProgress.completedChallenges.push(challengeId);
        currentProgress.completedAt[challengeId] = now;
        currentProgress.totalCompleted = currentProgress.completedChallenges.length;
        currentProgress.lastUpdated = now;
        
        await progressRef.set(currentProgress);
        
        return NextResponse.json({
          success: true,
          message: 'Challenge marked as completed'
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'Challenge already completed' },
          { status: 400 }
        );
      }
    } else if (action === 'uncomplete') {
      // Remove challenge from completed list
      const index = currentProgress.completedChallenges.indexOf(challengeId);
      if (index > -1) {
        currentProgress.completedChallenges.splice(index, 1);
        delete currentProgress.completedAt[challengeId];
        currentProgress.totalCompleted = currentProgress.completedChallenges.length;
        currentProgress.lastUpdated = now;
        
        await progressRef.set(currentProgress);
        
        return NextResponse.json({
          success: true,
          message: 'Challenge marked as incomplete'
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'Challenge not completed yet' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Update user progress error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user progress' },
      { status: 500 }
    );
  }
}
