import { adminDb } from '../lib/firebase-admin';
import seedData from './seed-example.json';

async function seed() {
  try {
    console.log('Starting seed...');

    // Seed users (ESNers)
    console.log('Seeding users (ESNers)...');
    for (const esner of seedData.esners) {
      const { id, ...data } = esner;
      await adminDb.collection('users').doc(id).set({
        ...data,
        role: 'esnner'
      });
      console.log(`Created ESNer: ${data.name}`);
    }

    // Seed challenges
    console.log('Seeding challenges...');
    for (const challenge of seedData.challenges) {
      const { id, ...data } = challenge;
      await adminDb.collection('challenges').doc(id).set(data);
      console.log(`Created challenge: ${data.title}`);
    }

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
