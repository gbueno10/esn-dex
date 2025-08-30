import { Esner } from '@/lib/firestore';

interface ProfileUnlockedProps {
  esner: Esner;
}

export function ProfileUnlocked({ esner }: ProfileUnlockedProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-8">
      <div className="text-center mb-8">
        {esner.photoURL ? (
          <img
            src={esner.photoURL}
            alt={esner.name}
            className="w-32 h-32 rounded-full object-cover mx-auto profile-unlocked"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center mx-auto">
            <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        <h1 className="text-2xl font-bold text-white mt-4">{esner.name}</h1>
        
        <div className="inline-flex items-center bg-green-900/30 border border-green-600 rounded-full px-3 py-1 mt-2">
          <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-green-400 text-sm font-medium">Unlocked</span>
        </div>
      </div>

      {/* Conversation Starters */}
      {esner.starters && esner.starters.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Conversation Starters</h3>
          <div className="space-y-2">
            {esner.starters.map((starter, index) => (
              <p key={index} className="text-gray-300">💬 {starter}</p>
            ))}
          </div>
        </div>
      )}

      {/* Interests */}
      {esner.interests && esner.interests.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {esner.interests.map((interest, index) => (
              <span 
                key={index} 
                className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bio */}
      {esner.bio && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">About</h3>
          <p className="text-gray-300 whitespace-pre-wrap">{esner.bio}</p>
        </div>
      )}

      {/* Social Media */}
      {(esner.socials?.instagram || esner.socials?.linkedin) && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Connect</h3>
          <div className="flex space-x-4">
            {esner.socials?.instagram && (
              <a 
                href={`https://instagram.com/${esner.socials.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.611-3.197-1.559-.187-.237-.318-.503-.391-.787-.073-.284-.088-.581-.044-.875.044-.294.14-.577.284-.834.287-.513.713-.94 1.226-1.227.257-.144.54-.24.834-.284.294-.044.591-.029.875.044.284.073.55.204.787.391.948.749 1.559 1.9 1.559 3.197 0 1.093-.445 2.084-1.162 2.801-.717.717-1.708 1.162-2.801 1.162zm6.152-7.161c-.686 0-1.31-.28-1.762-.732-.452-.452-.732-1.076-.732-1.762s.28-1.31.732-1.762c.452-.452 1.076-.732 1.762-.732s1.31.28 1.762.732c.452.452.732 1.076.732 1.762s-.28 1.31-.732 1.762c-.452.452-1.076.732-1.762.732z"/>
                </svg>
                Instagram
              </a>
            )}
            
            {esner.socials?.linkedin && (
              <a 
                href={esner.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
            )}
          </div>
        </div>
      )}

      <div className="text-center">
        <a 
          href="/esners" 
          className="inline-block px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
        >
          ← Back to Profiles
        </a>
      </div>
    </div>
  );
}
