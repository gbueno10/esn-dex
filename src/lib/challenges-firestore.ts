import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

export interface CompletedChallenge {
  id: string;
  userId: string;
  challengeId: string;
  challengeTitle: string;
  challengeCategory: string;
  completedAt: Timestamp;
}

export const saveChallengeCompletion = async (
  userId: string, 
  challengeId: string, 
  challengeTitle: string,
  challengeCategory: string
): Promise<void> => {
  try {
    const completionId = `${userId}_${challengeId}`;
    const docRef = doc(db, 'esn-challenges', completionId);
    
    await setDoc(docRef, {
      id: completionId,
      userId,
      challengeId,
      challengeTitle,
      challengeCategory,
      completedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error saving challenge completion:', error);
    throw error;
  }
};

export const removeChallengeCompletion = async (
  userId: string, 
  challengeId: string
): Promise<void> => {
  try {
    const completionId = `${userId}_${challengeId}`;
    const docRef = doc(db, 'esn-challenges', completionId);
    
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error removing challenge completion:', error);
    throw error;
  }
};

export const getUserCompletedChallenges = async (userId: string): Promise<string[]> => {
  try {
    const q = query(
      collection(db, 'esn-challenges'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().challengeId);
  } catch (error) {
    console.error('Error fetching completed challenges:', error);
    return [];
  }
};

export const getAllUserStats = async (userId: string): Promise<{
  completed: CompletedChallenge[];
  totalCount: number;
  categoryCounts: Record<string, number>;
}> => {
  try {
    const q = query(
      collection(db, 'esn-challenges'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const completed = querySnapshot.docs.map(doc => doc.data() as CompletedChallenge);
    
    const categoryCounts: Record<string, number> = {};
    completed.forEach(challenge => {
      categoryCounts[challenge.challengeCategory] = (categoryCounts[challenge.challengeCategory] || 0) + 1;
    });
    
    return {
      completed,
      totalCount: completed.length,
      categoryCounts
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      completed: [],
      totalCount: 0,
      categoryCounts: {}
    };
  }
};
