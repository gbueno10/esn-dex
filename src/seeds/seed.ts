import { adminDb } from '../lib/firebase-admin';
import seedData from './seed-example.json';

async function seed() {
  try {
    console.log('Starting seed...');

    // Seed yesenters
    console.log('Seeding yesenters...');
    for (const yesenter of seedData.yesenters) {
      const { id, ...data } = yesenter;
      await adminDb.collection('yesenters').doc(id).set(data);
      console.log(`Created yesenter: ${data.name}`);
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
