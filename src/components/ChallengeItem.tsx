import { Challenge } from '@/lib/firestore';

interface ChallengeItemProps {
  challenge: Challenge;
  completed: boolean;
  onToggle: (completed: boolean) => void;
}

export function ChallengeItem({ challenge, completed, onToggle }: ChallengeItemProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-6 flex items-start space-x-4">
      <div className="flex-shrink-0 pt-1">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) => onToggle(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
            completed 
              ? 'bg-green-600 border-green-600' 
              : 'border-gray-600 hover:border-gray-500'
          }`}>
            {completed && (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </label>
      </div>
      
      <div className="flex-1">
        <h3 className={`font-semibold mb-2 transition-colors ${
          completed ? 'text-green-400 line-through' : 'text-white'
        }`}>
          {challenge.title}
        </h3>
        
        {challenge.description && (
          <p className="text-gray-400 text-sm">
            {challenge.description}
          </p>
        )}
        
        {completed && (
          <div className="mt-2 inline-flex items-center text-green-400 text-sm">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Completed!
          </div>
        )}
      </div>
    </div>
  );
}
