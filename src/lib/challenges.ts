export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'icebreaker' | 'drinking' | 'fun' | 'general';
  emoji: string;
}

export const MOCK_CHALLENGES: Challenge[] = [
  // Icebreaker Challenges
  {
    id: 'find-twin',
    title: 'Find Your Twin',
    description: 'Find someone from the same country as you.',
    category: 'icebreaker',
    emoji: '👯‍♂️'
  },
  {
    id: 'continental-swap',
    title: 'Continental Swap',
    description: 'Meet someone from a different continent.',
    category: 'icebreaker',
    emoji: '🌍'
  },
  {
    id: 'same-letter-crew',
    title: 'Same Letter Crew',
    description: 'Find someone whose name starts with the same letter as yours.',
    category: 'icebreaker',
    emoji: '🔤'
  },
  {
    id: 'birthday-match',
    title: 'Birthday Match',
    description: 'Find someone with the same birthday month as you.',
    category: 'icebreaker',
    emoji: '🎂'
  },
  {
    id: 'language-buddy',
    title: 'Language Buddy',
    description: 'Teach a word in your language to someone new.',
    category: 'icebreaker',
    emoji: '🗣️'
  },
  {
    id: 'hidden-talent',
    title: 'Hidden Talent',
    description: 'Ask someone to show a funny talent (accent, dance move, trick).',
    category: 'icebreaker',
    emoji: '🎭'
  },
  {
    id: 'travel-dream',
    title: 'Travel Dream',
    description: 'Find someone who has visited your dream destination.',
    category: 'icebreaker',
    emoji: '✈️'
  },
  {
    id: 'foodie-match',
    title: 'Foodie Match',
    description: 'Find someone who loves the same food as you.',
    category: 'icebreaker',
    emoji: '🍕'
  },
  {
    id: 'guess-major',
    title: 'Guess My Major',
    description: 'Let someone guess your study field – if they fail, they drink.',
    category: 'icebreaker',
    emoji: '🎓'
  },
  {
    id: 'two-truths-lie',
    title: 'Two Truths, One Lie',
    description: 'Share with a stranger and let them guess.',
    category: 'icebreaker',
    emoji: '🤔'
  },

  // Drinking Challenges
  {
    id: 'cheers-language',
    title: 'Cheers in My Language',
    description: 'Teach someone "cheers" in your language and drink together.',
    category: 'drinking',
    emoji: '🍻'
  },
  {
    id: 'flip-coin',
    title: 'Flip a Coin',
    description: 'Heads → you drink, Tails → they drink.',
    category: 'drinking',
    emoji: '🪙'
  },
  {
    id: 'random-toast',
    title: 'Random Toast',
    description: 'Make a toast about something random (cats, socks, Monday).',
    category: 'drinking',
    emoji: '🥂'
  },
  {
    id: 'group-shot',
    title: 'Group Shot',
    description: 'Form a group of 4 people and all drink together.',
    category: 'drinking',
    emoji: '👥'
  },
  {
    id: 'left-hand-cheers',
    title: 'Left-Hand Cheers',
    description: 'Cheers using your left hand only.',
    category: 'drinking',
    emoji: '🤚'
  },
  {
    id: 'accented-cheers',
    title: 'Accented Cheers',
    description: 'Do a toast with a fake accent.',
    category: 'drinking',
    emoji: '🎪'
  },
  {
    id: 'mimic-drink',
    title: 'Mimic & Drink',
    description: 'Copy someone\'s dance move before drinking.',
    category: 'drinking',
    emoji: '💃'
  },
  {
    id: 'challenge-swap',
    title: 'Challenge Swap',
    description: 'Exchange your drink with someone else for one round.',
    category: 'drinking',
    emoji: '🔄'
  },
  {
    id: 'one-breath-toast',
    title: 'One Breath Toast',
    description: 'Make a toast without breathing in the middle. Fail → drink twice.',
    category: 'drinking',
    emoji: '💨'
  },
  {
    id: 'beer-buddy',
    title: 'Beer Buddy',
    description: 'Share a sip with someone you just met.',
    category: 'drinking',
    emoji: '🍺'
  },

  // Spicy / Funny Challenges
  {
    id: 'pickup-line',
    title: 'Pick-Up Line',
    description: 'Say a cheesy pick-up line to someone.',
    category: 'fun',
    emoji: '😏'
  },
  {
    id: 'truth-or-drink',
    title: 'Truth or Drink',
    description: 'Ask a daring question – if they don\'t answer, they drink.',
    category: 'fun',
    emoji: '🍷'
  },
  {
    id: 'selfie-dare',
    title: 'Selfie Dare',
    description: 'Take a selfie with someone you just met and post it tagging ESN.',
    category: 'fun',
    emoji: '📸'
  },
  {
    id: 'dance-dare',
    title: 'Dance Dare',
    description: 'Teach someone a dance move from your country.',
    category: 'fun',
    emoji: '🕺'
  },
  {
    id: 'hug-hunt',
    title: 'Hug Hunt',
    description: 'Hug someone wearing the same color as you.',
    category: 'fun',
    emoji: '🤗'
  },
  {
    id: 'switch-accessories',
    title: 'Switch Accessories',
    description: 'Swap an accessory (hat, bracelet, scarf) with someone.',
    category: 'fun',
    emoji: '👑'
  },
  {
    id: 'funny-walk',
    title: 'Funny Walk',
    description: 'Walk across the bar in a funny way.',
    category: 'fun',
    emoji: '🚶‍♂️'
  },
  {
    id: 'karaoke-dare',
    title: 'Karaoke Dare',
    description: 'Sing one line of a song out loud.',
    category: 'fun',
    emoji: '🎤'
  },
  {
    id: 'secret-whisper',
    title: 'Secret Whisper',
    description: 'Whisper something funny in a stranger\'s ear.',
    category: 'fun',
    emoji: '🤫'
  },
  {
    id: 'emoji-challenge',
    title: 'Emoji Challenge',
    description: 'Express yourself only with emojis (gestures) for 1 min.',
    category: 'fun',
    emoji: '😄'
  },

  // General Challenges
  {
    id: 'silly-handshake',
    title: 'Silly Handshake',
    description: 'Invent a silly handshake with someone new.',
    category: 'general',
    emoji: '🤝'
  },
  {
    id: 'rock-paper-scissors',
    title: 'Rock Paper Scissors',
    description: 'Play rock-paper-scissors against 5 people in a row. Try to win 3 - losers drink.',
    category: 'general',
    emoji: '✂️'
  },
  {
    id: 'silly-superpower',
    title: 'Silly Superpower',
    description: 'Tell the group what silly superpower you wish you had.',
    category: 'general',
    emoji: '🦸‍♂️'
  },
  {
    id: 'bucket-list',
    title: 'Bucket List',
    description: 'Reveal one thing on your bucket list.',
    category: 'general',
    emoji: '📝'
  },
  {
    id: 'hidden-gem-porto',
    title: 'Hidden Gem Porto',
    description: 'Tell a secret "hidden gem" spot in Porto, then hear one back.',
    category: 'general',
    emoji: '💎'
  },
  {
    id: 'portuguese-word',
    title: 'Portuguese Challenge',
    description: 'Try to pronounce "Paralelepípedo" (classic tricky Portuguese word).',
    category: 'general',
    emoji: '🇵🇹'
  }
];

export const getChallengesByCategory = (category: Challenge['category']): Challenge[] => {
  return MOCK_CHALLENGES.filter(challenge => challenge.category === category);
};

export const getRandomChallenge = (): Challenge => {
  return MOCK_CHALLENGES[Math.floor(Math.random() * MOCK_CHALLENGES.length)];
};

export const getRandomChallenges = (count: number): Challenge[] => {
  const shuffled = [...MOCK_CHALLENGES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
