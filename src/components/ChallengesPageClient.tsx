'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shuffle, Target, Users, Sparkles, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { Challenge, getRandomChallenge } from '@/lib/challenges';
import { 
  getChallengesFromAPI, 
  getUserProgressFromAPI, 
  markChallengeCompletedAPI, 
  markChallengeIncompleteAPI,
  getChallengeStatsAPI
} from '@/lib/api-challenges';
import { useAuth } from '@/lib/useAuth';
import { fireConfetti } from '@/lib/confetti';
import { useToast } from '@/hooks/use-toast';

const categoryIcons = {
  icebreaker: Users,
  drinking: Sparkles,
  fun: Target,
  general: Shuffle
};

export function ChallengesPageClient() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedCategory, setSelectedCategory] = useState<Challenge['category'] | 'all'>('all');
  const [randomChallenge, setRandomChallenge] = useState<Challenge | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalChallenges: 0,
    completedCount: 0,
    progressPercentage: 0,
    completedByCategory: {}
  });

  // Initialize challenges and load user progress
  useEffect(() => {
    const initializeData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Load challenges and user progress (no auto-initialization)
        const [challengesData, userProgress, challengeStats] = await Promise.all([
          getChallengesFromAPI(),
          getUserProgressFromAPI(user.uid),
          getChallengeStatsAPI(user.uid)
        ]);
        
        setChallenges(challengesData);
        setCompletedChallenges(new Set(userProgress.completedChallenges));
        setStats(challengeStats);
        
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Failed to load challenges. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [user, toast]);

  const categories = [
    { key: 'all', label: 'All', icon: Shuffle },
    { key: 'icebreaker', label: 'Icebreaker', icon: Users },
    { key: 'drinking', label: 'Drinking', icon: Sparkles },
    { key: 'fun', label: 'Fun', icon: Target },
    { key: 'general', label: 'General', icon: Shuffle }
  ] as const;

  const filteredChallenges = selectedCategory === 'all' 
    ? challenges 
    : challenges.filter(challenge => challenge.category === selectedCategory);

  const handleRandomChallenge = () => {
    if (challenges.length > 0) {
      const randomIndex = Math.floor(Math.random() * challenges.length);
      setRandomChallenge(challenges[randomIndex]);
    }
  };

  const toggleChallengeComplete = async (challengeId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to track your progress.",
        variant: "destructive"
      });
      return;
    }

    const isCompleted = completedChallenges.has(challengeId);
    
    try {
      if (isCompleted) {
        await markChallengeIncompleteAPI(user.uid, challengeId);
        setCompletedChallenges(prev => {
          const newSet = new Set(prev);
          newSet.delete(challengeId);
          return newSet;
        });
        
        toast({
          title: "Challenge Unmarked",
          description: "Challenge removed from completed list.",
        });
      } else {
        await markChallengeCompletedAPI(user.uid, challengeId);
        setCompletedChallenges(prev => {
          const newSet = new Set(prev);
          newSet.add(challengeId);
          return newSet;
        });
        
        // Fire confetti animation!
        fireConfetti();
        
        toast({
          title: "🎉 Challenge Completed!",
          description: "Great job! Keep going!",
        });
      }
      
      // Update stats
      const newStats = await getChallengeStatsAPI(user.uid);
      setStats(newStats);
      
    } catch (error) {
      console.error('Error updating challenge:', error);
      toast({
        title: "Error",
        description: "Failed to update challenge. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            <span>Loading challenges...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground">Please log in to access challenges and track your progress.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center justify-center gap-2 sm:gap-3">
            <Target className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            ESN Challenges
          </CardTitle>
          <p className="text-sm sm:text-base text-muted-foreground">
            Break the ice and connect with fellow Erasmus students!
          </p>
        </CardHeader>
      </Card>

      {/* Progress Section */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold">Your Progress</h3>
              <Badge variant="outline" className="text-xs sm:text-sm">
                {stats.completedCount} / {stats.totalChallenges}
              </Badge>
            </div>
            <Progress value={stats.progressPercentage} className="h-2 sm:h-3" />
            <p className="text-xs sm:text-sm text-muted-foreground">
              {stats.completedCount === 0 
                ? "Start your first challenge!" 
                : stats.completedCount === stats.totalChallenges 
                ? "🎉 All challenges completed!" 
                : `${stats.totalChallenges - stats.completedCount} challenges remaining`
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Random Challenge Generator */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="text-center space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-xl font-semibold">Need a Random Challenge?</h3>
            <Button 
              onClick={handleRandomChallenge}
              size="lg"
              className="w-full sm:w-auto font-semibold"
            >
              <Shuffle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Get Random Challenge
            </Button>
            
            {randomChallenge && (
              <Card className="mt-3 sm:mt-4">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3 mb-2">
                    <span className="text-xl sm:text-2xl">{randomChallenge.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm sm:text-lg leading-tight">{randomChallenge.title}</h4>
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          {randomChallenge.category}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{randomChallenge.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleChallengeComplete(randomChallenge.id)}
                      className="flex-shrink-0 p-1"
                    >
                      {completedChallenges.has(randomChallenge.id) ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.key;
              
              return (
                <Button
                  key={category.key}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.key)}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {filteredChallenges.map((challenge) => {
          const isCompleted = completedChallenges.has(challenge.id);
          
          return (
            <Card 
              key={challenge.id} 
              className={`transition-all duration-200 ${isCompleted ? 'bg-muted/30' : 'hover:shadow-md'}`}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className={`text-lg sm:text-2xl ${isCompleted ? 'opacity-50' : ''}`}>
                    {challenge.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold text-sm sm:text-base leading-tight ${isCompleted ? 'line-through opacity-50' : ''}`}>
                        {challenge.title}
                      </h3>
                      <Badge 
                        variant="secondary" 
                        className="text-xs flex-shrink-0"
                      >
                        {challenge.category}
                      </Badge>
                    </div>
                    <p className={`text-xs sm:text-sm text-muted-foreground leading-relaxed ${isCompleted ? 'opacity-50' : ''}`}>
                      {challenge.description}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleChallengeComplete(challenge.id)}
                    className="flex-shrink-0 p-1"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="p-3 sm:p-4 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Showing <span className="font-semibold">{filteredChallenges.length}</span> challenges
            {selectedCategory !== 'all' && (
              <span> in <span className="font-semibold">{selectedCategory}</span> category</span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Terms Footer */}
      <Card className="mt-6 border-amber-200 bg-amber-50/50">
        <CardContent className="p-3 sm:p-4 text-center">
          <p className="text-xs text-amber-700 mb-2">
            ⚠️ Ao participar dos challenges, você assume total responsabilidade por suas ações
          </p>
          <a 
            href="/terms" 
            className="text-xs text-amber-600 hover:text-amber-800 underline font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            Leia nossos Termos de Serviço
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
