import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase-client';

export type UserRole = 'participant' | 'esnner' | 'admin';

export interface User {
  role: UserRole;
  createdAt: any;
}

export interface Esner {
  name: string;
  photoURL: string;
  starters?: string[];
  interests?: string[];
  bio?: string;
  socials?: {
    instagram?: string;
    linkedin?: string;
  };
  visible: boolean;
}

export interface Unlock {
  participantId: string;
  userId: string;
  createdAt: any;
  eventId?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  active: boolean;
}

export interface ChallengeProgress {
  participantId: string;
  challengeId: string;
  done: boolean;
  updatedAt: any;
}

// User operations
export async function createUser(uid: string, role: UserRole) {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    role,
    createdAt: serverTimestamp(),
  });
}

export async function getUser(uid: string): Promise<User | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as User;
  }
  return null;
}

export async function updateUserRole(uid: string, role: UserRole) {
  const userRef = doc(db, 'users', uid);
  try {
    // Use set with merge to create the doc if it doesn't exist (safer than update)
    await setDoc(userRef, { role, createdAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.error('Failed to update user role:', err);
    throw err;
  }
}

// Esner operations (using users collection)
export async function getEsner(uid: string): Promise<Esner | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data();
    // Return only profile-related data
    return {
      name: userData.name || '',
      photoURL: userData.photoURL || '',
      starters: userData.starters || [],
      interests: userData.interests || [],
      bio: userData.bio || '',
      socials: userData.socials || {},
      visible: userData.visible !== false
    } as Esner;
  }
  return null;
}

export async function getAllEsners(): Promise<Array<Esner & { id: string }>> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('visible', '!=', false), where('role', '==', 'esnner'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name || '',
    photoURL: doc.data().photoURL || '',
    starters: doc.data().starters || [],
    interests: doc.data().interests || [],
    bio: doc.data().bio || '',
    socials: doc.data().socials || {},
    visible: doc.data().visible !== false
  })) as Array<Esner & { id: string }>;
}

export async function createOrUpdateEsner(uid: string, data: Partial<Esner>) {
  const userRef = doc(db, 'users', uid);
  const existing = await getDoc(userRef);
  
  if (existing.exists()) {
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } else {
    await setDoc(userRef, {
      ...data,
      role: 'esnner',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
}

// Challenge operations
export async function getAllChallenges(): Promise<Challenge[]> {
  const challengesRef = collection(db, 'challenges');
  const q = query(challengesRef, where('active', '==', true));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as Omit<Challenge, 'id'>
  }));
}

export async function getChallengeProgress(participantId: string): Promise<ChallengeProgress[]> {
  const progressRef = collection(db, 'challenge_progress');
  const q = query(progressRef, where('participantId', '==', participantId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => doc.data() as ChallengeProgress);
}

export async function updateChallengeProgress(participantId: string, challengeId: string, done: boolean) {
  const progressRef = collection(db, 'challenge_progress');
  const q = query(
    progressRef,
    where('participantId', '==', participantId),
    where('challengeId', '==', challengeId),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    await addDoc(progressRef, {
      participantId,
      challengeId,
      done,
      updatedAt: serverTimestamp(),
    });
  } else {
    const docRef = querySnapshot.docs[0].ref;
    await updateDoc(docRef, {
      done,
      updatedAt: serverTimestamp(),
    });
  }
}
