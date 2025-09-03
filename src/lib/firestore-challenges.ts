import { db } from './firebase-client';
import { collection, doc, getDocs, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, query, where } from 'firebase/firestore';
import { Challenge, MOCK_CHALLENGES } from './challenges';

// Types for Firestore
export interface UserChallengeProgress {
  userId: string;
  completedChallenges: string[]; // Array of challenge IDs
  completedAt: { [challengeId: string]: Date };
  totalCompleted: number;
  lastUpdated: Date;
}

export interface FirestoreChallenge extends Challenge {
  createdAt: Date;
  isActive: boolean;
}

// Collection references
const CHALLENGES_COLLECTION = 'esn-challenges';
const USER_PROGRESS_COLLECTION = 'user-challenge-progress';

/**
 * Initialize challenges in Firestore (run once)
 */
export async function initializeChallengesInFirestore(): Promise<void> {
  try {
    console.log('Initializing challenges in Firestore...');
    
    for (const challenge of MOCK_CHALLENGES) {
      const challengeRef = doc(db, CHALLENGES_COLLECTION, challenge.id);
      const challengeDoc = await getDoc(challengeRef);
      
      if (!challengeDoc.exists()) {
        const firestoreChallenge: FirestoreChallenge = {
          ...challenge,
          createdAt: new Date(),
          isActive: true
        };
        
        await setDoc(challengeRef, firestoreChallenge);
        console.log(`Challenge ${challenge.id} added to Firestore`);
      }
    }
    
    console.log('Challenges initialization completed!');
  } catch (error) {
    console.error('Error initializing challenges:', error);
    throw error;
  }
}

/**
 * Get all challenges from Firestore
 */
export async function getChallengesFromFirestore(): Promise<Challenge[]> {
  try {
    const challengesRef = collection(db, CHALLENGES_COLLECTION);
    const querySnapshot = await getDocs(query(challengesRef, where('isActive', '==', true)));
    
    const challenges: Challenge[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirestoreChallenge;
      challenges.push({
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        emoji: data.emoji
      });
    });
    
    console.log(`Loaded ${challenges.length} challenges from Firestore`);
    return challenges;
  } catch (error) {
    console.error('Error fetching challenges from Firestore:', error);
    console.log('Falling back to mock data');
    // Fallback to mock data if Firestore fails
    return MOCK_CHALLENGES;
  }
}

/**
 * Get user's challenge progress
 */
export async function getUserChallengeProgress(userId: string): Promise<UserChallengeProgress> {
  try {
    const progressRef = doc(db, USER_PROGRESS_COLLECTION, userId);
    const progressDoc = await getDoc(progressRef);
    
    if (progressDoc.exists()) {
      const data = progressDoc.data();
      return {
        userId,
        completedChallenges: data.completedChallenges || [],
        completedAt: data.completedAt || {},
        totalCompleted: data.totalCompleted || 0,
        lastUpdated: data.lastUpdated?.toDate() || new Date()
      };
    } else {
      // Create new progress document
      const newProgress: UserChallengeProgress = {
        userId,
        completedChallenges: [],
        completedAt: {},
        totalCompleted: 0,
        lastUpdated: new Date()
      };
      
      await setDoc(progressRef, {
        ...newProgress,
        lastUpdated: new Date()
      });
      
      return newProgress;
    }
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
}

/**
 * Mark challenge as completed for user
 */
export async function markChallengeCompleted(userId: string, challengeId: string): Promise<void> {
  try {
    const progressRef = doc(db, USER_PROGRESS_COLLECTION, userId);
    const now = new Date();
    
    // Get current progress
    const currentProgress = await getUserChallengeProgress(userId);
    
    // Check if already completed
    if (currentProgress.completedChallenges.includes(challengeId)) {
      throw new Error('Challenge already completed');
    }
    
    // Update progress
    await updateDoc(progressRef, {
      completedChallenges: arrayUnion(challengeId),
      [`completedAt.${challengeId}`]: now,
      totalCompleted: currentProgress.completedChallenges.length + 1,
      lastUpdated: now
    });
    
    console.log(`Challenge ${challengeId} marked as completed for user ${userId}`);
  } catch (error) {
    console.error('Error marking challenge as completed:', error);
    throw error;
  }
}

/**
 * Mark challenge as incomplete for user
 */
export async function markChallengeIncomplete(userId: string, challengeId: string): Promise<void> {
  try {
    const progressRef = doc(db, USER_PROGRESS_COLLECTION, userId);
    const now = new Date();
    
    // Get current progress
    const currentProgress = await getUserChallengeProgress(userId);
    
    // Check if actually completed
    if (!currentProgress.completedChallenges.includes(challengeId)) {
      throw new Error('Challenge not completed yet');
    }
    
    // Remove from completed
    const updatedCompletedAt = { ...currentProgress.completedAt };
    delete updatedCompletedAt[challengeId];
    
    await updateDoc(progressRef, {
      completedChallenges: arrayRemove(challengeId),
      completedAt: updatedCompletedAt,
      totalCompleted: Math.max(0, currentProgress.completedChallenges.length - 1),
      lastUpdated: now
    });
    
    console.log(`Challenge ${challengeId} marked as incomplete for user ${userId}`);
  } catch (error) {
    console.error('Error marking challenge as incomplete:', error);
    throw error;
  }
}

/**
 * Get challenge completion stats
 */
export async function getChallengeStats(userId: string): Promise<{
  totalChallenges: number;
  completedCount: number;
  progressPercentage: number;
  completedByCategory: { [category: string]: number };
}> {
  try {
    const [challenges, progress] = await Promise.all([
      getChallengesFromFirestore(),
      getUserChallengeProgress(userId)
    ]);
    
    const totalChallenges = challenges.length;
    const completedCount = progress.completedChallenges.length;
    const progressPercentage = totalChallenges > 0 ? (completedCount / totalChallenges) * 100 : 0;
    
    // Count by category
    const completedByCategory: { [category: string]: number } = {};
    const completedChallengeObjects = challenges.filter(c => progress.completedChallenges.includes(c.id));
    
    completedChallengeObjects.forEach(challenge => {
      completedByCategory[challenge.category] = (completedByCategory[challenge.category] || 0) + 1;
    });
    
    return {
      totalChallenges,
      completedCount,
      progressPercentage,
      completedByCategory
    };
  } catch (error) {
    console.error('Error getting challenge stats:', error);
    throw error;
  }
}
