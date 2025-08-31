import { adminDb } from '@/lib/firebase-admin';

export interface EsnerProfile {
  id: string;
  uid: string;
  name: string;
  email?: string;
  userId: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  nationality?: string;
  starters?: string[];
  interests?: string[];
  socials?: {
    instagram?: string;
    linkedin?: string;
  };
  visible?: boolean;
  role?: string;
  createdAt: string | null; // Changed to string for serialization
  updatedAt: string | null; // Changed to string for serialization
  unlockedCount?: number;
}

/**
 * Fetch featured ESNers for the homepage (server-side)
 */
export async function getFeaturedEsners(limit: number = 3): Promise<EsnerProfile[]> {
  try {
    // Query for featured ESNers - simplified to avoid index requirements
    const querySnapshot = await adminDb
      .collection('users')
      .where('role', '==', 'esnner')
      .where('visible', '==', true)
      .limit(20) // Get more to filter client-side
      .get();

    const esners: EsnerProfile[] = [];
    querySnapshot.forEach((doc: any) => {
      const data = doc.data();
      esners.push({
        id: doc.id,
        uid: doc.id,
        name: data.name || '',
        email: data.email || '',
        userId: data.userId || doc.id,
        photoURL: data.photoURL || data.photo || null,
        bio: data.bio || data.description || '',
        location: data.location || data.city || '',
        nationality: data.nationality || data.country || '',
        starters: data.starters || [],
        interests: data.interests || data.tags || [],
        socials: {
          instagram: data.instagramUrl || data.socials?.instagram || '',
          linkedin: data.linkedinUrl || data.socials?.linkedin || '',
        },
        visible: data.visible !== false,
        role: data.role || 'esnner',
        // Convert Firestore Timestamps to plain objects for serialization
        createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : null,
        updatedAt: data.updatedAt ? (data.updatedAt.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt) : null,
        unlockedCount: data.unlockedCount || 0,
      });
    });

    // Sort by unlockedCount client-side and limit
    return esners
      .sort((a, b) => (b.unlockedCount || 0) - (a.unlockedCount || 0))
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching featured esners:', error);
    return [];
  }
}

/**
 * Fetch all visible ESNer profiles (server-side)
 */
export async function getAllEsners(): Promise<EsnerProfile[]> {
  try {
    console.log('🔍 getAllEsners: Starting query...');
    
    // First, let's try a broader query to see what we have
    const allUsersSnapshot = await adminDb.collection('users').limit(5).get();
    console.log('📋 Total users in collection:', allUsersSnapshot.size);
    
    allUsersSnapshot.forEach((doc: any) => {
      const data = doc.data();
      console.log(`� User ${doc.id}:`, {
        role: data.role,
        roleType: typeof data.role,
        visible: data.visible,
        visibleType: typeof data.visible,
        name: data.name
      });
    });

    // Try different query approaches
    console.log('🔍 Trying role query...');
    const roleQuery = await adminDb
      .collection('users')
      .where('role', '==', 'esnner')
      .get();
    console.log('📊 Users with role=esnner:', roleQuery.size);

    console.log('🔍 Trying visible query...');  
    const visibleQuery = await adminDb
      .collection('users')
      .where('visible', '==', true)
      .get();
    console.log('� Users with visible=true:', visibleQuery.size);

    const querySnapshot = await adminDb
      .collection('users')
      .where('role', '==', 'esnner')
      .where('visible', '==', true)
      .get();

    console.log(`� getAllEsners: Found ${querySnapshot.size} ESNers`);

    const esners: EsnerProfile[] = [];
    querySnapshot.forEach((doc: any) => {
      const data = doc.data();
      
      // Debug bio specifically
      console.log(`👤 ${data.name}: bio="${data.bio}", hasBio=${!!data.bio}`);
      
      esners.push({
        id: doc.id,
        uid: doc.id,
        name: data.name || '',
        email: data.email || '',
        userId: data.userId || doc.id,
        photoURL: data.photoURL || data.photo || null,
        bio: data.bio || data.description || '',
        location: data.location || data.city || '',
        nationality: data.nationality || data.country || '',
        starters: data.starters || [],
        interests: data.interests || data.tags || [],
        socials: {
          instagram: data.instagramUrl || data.socials?.instagram || '',
          linkedin: data.linkedinUrl || data.socials?.linkedin || '',
        },
        visible: data.visible !== false,
        role: data.role || 'esnner',
        // Convert Firestore Timestamps to plain objects for serialization
        createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : null,
        updatedAt: data.updatedAt ? (data.updatedAt.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt) : null,
        unlockedCount: data.unlockedCount || 0,
      });
    });

    console.log(`🎯 getAllEsners: Returning ${esners.length} ESNers`);
    return esners;
  } catch (error) {
    console.error('❌ Error fetching all esners:', error);
    return [];
  }
}

/**
 * Get ESNer profile by ID (server-side)
 */
export async function getEsnerById(id: string): Promise<EsnerProfile | null> {
  try {
    const doc = await adminDb
      .collection('users')
      .doc(id)
      .get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    
    if (!data || data.role !== 'esnner' || data.visible === false) {
      return null;
    }

    return {
      id: doc.id,
      uid: doc.id,
      name: data.name || '',
      email: data.email || '',
      userId: data.userId || doc.id,
      photoURL: data.photoURL || data.photo || null,
      bio: data.bio || data.description || '',
      location: data.location || data.city || '',
      nationality: data.nationality || data.country || '',
      starters: data.starters || [],
      interests: data.interests || data.tags || [],
      socials: {
        instagram: data.instagramUrl || data.socials?.instagram || '',
        linkedin: data.linkedinUrl || data.socials?.linkedin || '',
      },
      visible: data.visible !== false,
      role: data.role || 'esnner',
      // Convert Firestore Timestamps to plain objects for serialization
      createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : null,
      updatedAt: data.updatedAt ? (data.updatedAt.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt) : null,
      unlockedCount: data.unlockedCount || 0,
    };
  } catch (error) {
    console.error('Error fetching esner by ID:', error);
    return null;
  }
}

/**
 * Check if user has unlocked a specific profile
 */
export async function hasUserUnlockedProfile(userId: string, profileId: string): Promise<boolean> {
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return false;
    }
    
    const userData = userDoc.data();
    const unlockedProfiles = userData?.unlockedProfiles || [];
    
    return unlockedProfiles.includes(profileId);
  } catch (error) {
    console.error('Error checking unlock status:', error);
    return false;
  }
}
