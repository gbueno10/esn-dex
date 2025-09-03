import { Challenge } from './challenges';

export interface UserChallengeProgress {
  userId: string;
  completedChallenges: string[];
  completedAt: { [challengeId: string]: Date };
  totalCompleted: number;
  lastUpdated: Date;
}

/**
 * Get all challenges from API
 */
export async function getChallengesFromAPI(): Promise<Challenge[]> {
  try {
    const response = await fetch('/api/challenges');
    const data = await response.json();
    
    if (data.success) {
      console.log(`API Client: Loaded ${data.challenges.length} challenges`);
      return data.challenges;
    } else {
      throw new Error(data.error || 'Failed to fetch challenges');
    }
  } catch (error) {
    console.error('Error fetching challenges from API:', error);
    throw error;
  }
}

/**
 * Get user progress from API
 */
export async function getUserProgressFromAPI(userId: string): Promise<UserChallengeProgress> {
  try {
    const response = await fetch(`/api/user-progress?userId=${userId}`);
    const data = await response.json();
    
    if (data.success) {
      return data.progress;
    } else {
      throw new Error(data.error || 'Failed to fetch user progress');
    }
  } catch (error) {
    console.error('Error fetching user progress from API:', error);
    throw error;
  }
}

/**
 * Mark challenge as completed via API
 */
export async function markChallengeCompletedAPI(userId: string, challengeId: string): Promise<void> {
  try {
    const response = await fetch('/api/user-progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        challengeId,
        action: 'complete'
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to mark challenge as completed');
    }
  } catch (error) {
    console.error('Error marking challenge as completed:', error);
    throw error;
  }
}

/**
 * Mark challenge as incomplete via API
 */
export async function markChallengeIncompleteAPI(userId: string, challengeId: string): Promise<void> {
  try {
    const response = await fetch('/api/user-progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        challengeId,
        action: 'uncomplete'
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to mark challenge as incomplete');
    }
  } catch (error) {
    console.error('Error marking challenge as incomplete:', error);
    throw error;
  }
}

/**
 * Get challenge statistics
 */
export async function getChallengeStatsAPI(userId: string): Promise<{
  totalChallenges: number;
  completedCount: number;
  progressPercentage: number;
  completedByCategory: { [category: string]: number };
}> {
  try {
    const [challenges, progress] = await Promise.all([
      getChallengesFromAPI(),
      getUserProgressFromAPI(userId)
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
