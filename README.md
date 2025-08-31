# Meet Your ESNners

A Next.js app for ESN events where participants can unlock ESNner profiles through QR codes/links.

## Setup

1. Clone and install dependencies:
```bash
npm install
```

2. Configure Firebase:
   - Create a Firebase project
   - Enable Authentication (Anonymous, Google, Email Link)
   - Enable Firestore
   - Copy `.env.local.example` to `.env.local` and fill in your Firebase credentials

3. Set up Firestore security rules (see firestore.rules)

4. Run the development server:
```bash
npm run dev
```

5. Optional: Seed sample data:
```bash
npm run seed
```

## Features

- Anonymous authentication for participants
- Google/Email Link auth for ESNners
- Profile unlocking via QR codes/links
- Challenge system for participants
- Profile management for ESNners

## Routes

- `/` - Redirects to /esners
- `/esners` - ESNer profiles grid  
- `/esners/[id]` - Individual profile view
- `/unlock/[esnerId]` - Unlock profile page
- `/challenges` - Challenges list
- `/signin` - ESNner authentication
- `/me` - ESNner profile editor
- `/me/qr` - QR code display
