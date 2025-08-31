'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthGate';
import { RequireAuth } from '@/components/RequireAuth';
import { getAllChallenges, getChallengeProgress, updateChallengeProgress, Challenge, ChallengeProgress } from '@/lib/firestore';
import { ChallengeItem } from '@/components/ChallengeItem';

function ChallengesPageContent() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [progress, setProgress] = useState<ChallengeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const [challengesData, progressData] = await Promise.all([
          getAllChallenges(),
          getChallengeProgress(user.uid)
        ]);

        setChallenges(challengesData);
        setProgress(progressData);
      } catch (err) {
        setError('Failed to load challenges');
        console.error('Error fetching challenges:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleToggleChallenge = async (challengeId: string, done: boolean) => {
    if (!user) return;

    try {
      await updateChallengeProgress(user.uid, challengeId, done);
      
      // Update local state
      setProgress(prev => {
        const existing = prev.find(p => p.challengeId === challengeId);
        if (existing) {
          return prev.map(p => 
            p.challengeId === challengeId ? { ...p, done } : p
          );
        } else {
          return [...prev, {
            participantId: user.uid,
            challengeId,
            done,
            updatedAt: new Date()
          }];
        }
      });
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  };

  const getProgress = (challengeId: string) => {
    return progress.find(p => p.challengeId === challengeId)?.done || false;
  };

  const completedCount = progress.filter(p => p.done).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Challenges</h1>
        <p className="text-gray-400 mb-4">
          Complete these fun challenges during the event!
        </p>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-white">
              Progress: {completedCount} / {challenges.length}
            </span>
            <div className="w-48 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: challenges.length > 0 ? `${(completedCount / challenges.length) * 100}%` : '0%' 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {challenges.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-400 mb-4">No Challenges Available</h2>
          <p className="text-gray-500">Check back later for exciting challenges!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <ChallengeItem
              key={challenge.id}
              challenge={challenge}
              completed={getProgress(challenge.id)}
              onToggle={(done) => handleToggleChallenge(challenge.id, done)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChallengesPage() {
  return (
    <RequireAuth allowAnonymous={true}>
      <ChallengesPageContent />
    </RequireAuth>
  );
}
