import { Esner } from '@/lib/firestore';

interface ProfileLockedProps {
  esner: Esner;
}

export function ProfileLocked({ esner }: ProfileLockedProps) {
  const displayStarter = esner.starters?.[0] || 'Say hi!';

  return (
    <div className="bg-gray-900 rounded-lg p-8">
      <div className="text-center mb-8">
        <div className="relative inline-block">
          {esner.photoURL ? (
            <img
              src={esner.photoURL}
              alt={esner.name}
              className="w-32 h-32 rounded-full object-cover profile-locked mx-auto"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center profile-locked mx-auto">
              <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-70 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-white mt-4">{esner.name}</h1>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Conversation Starter</h3>
        <p className="text-gray-300">💬 {displayStarter}</p>
      </div>

      <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-yellow-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <h3 className="text-lg font-semibold text-yellow-400 mb-2">Profile Locked</h3>
        <p className="text-yellow-200 mb-4">
          This ESNner&apos;s full profile is locked. Ask them to show you their QR code or share their unlock link to see their complete profile!
        </p>
        <div className="text-sm text-yellow-300">
          <p>Unlock to see:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Full photo</li>
            <li>Interests & hobbies</li>
            <li>Bio & background</li>
            <li>Social media links</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 text-center">
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
