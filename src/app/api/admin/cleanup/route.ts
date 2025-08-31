import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// Helper function to verify admin access
async function verifyAdminAccess(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const adminKey = request.headers.get('x-admin-key');
  
  // Check for admin key in header (you can set this as an environment variable)
  const expectedAdminKey = process.env.ADMIN_API_KEY;
  if (expectedAdminKey && adminKey === expectedAdminKey) {
    return true;
  }
  
  // Fallback to token verification
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  try {
    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Check if user has admin role
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    
    return userData?.role === 'admin';
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const isAdmin = await verifyAdminAccess(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { action } = await request.json();

    switch (action) {
      case 'cleanup_anonymous_users':
        return await cleanupAnonymousUsers();
      
      case 'cleanup_empty_esners':
        return await cleanupEmptyEsners();
      
      case 'cleanup_all_test_data':
        return await cleanupAllTestData();
        
      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Admin cleanup error:', error);
    return NextResponse.json(
      { error: 'Cleanup operation failed', details: error.message },
      { status: 500 }
    );
  }
}

async function cleanupAnonymousUsers() {
  try {
    console.log('🧹 Starting cleanup of inactive participants...');
    
    // Get all users with role 'participant' (anonymous users)
    const participantsSnapshot = await adminDb
      .collection('users')
      .where('role', '==', 'participant')
      .get();

    const toDelete: string[] = [];
    const results = {
      total_participants: participantsSnapshot.size,
      inactive_participants: 0,
      deleted: 0,
      errors: 0
    };

    for (const doc of participantsSnapshot.docs) {
      const data = doc.data();
      const uid = doc.id;
      
      // Check if participant has unlocked any profiles
      const unlockedProfiles = data.unlockedProfiles || [];
      const hasUnlockedAny = Array.isArray(unlockedProfiles) && unlockedProfiles.length > 0;

      if (!hasUnlockedAny) {
        results.inactive_participants++;
        toDelete.push(uid);
        console.log(`📋 Found inactive participant: ${uid} (no unlocks)`);
      }
    }

    console.log(`📊 Found ${results.inactive_participants} inactive participants to delete`);

    // Delete inactive participants
    for (const uid of toDelete) {
      try {
        // Delete from Firestore
        await adminDb.collection('users').doc(uid).delete();
        
        // Try to delete from Auth (may fail if user doesn't exist in Auth)
        try {
          await adminAuth.deleteUser(uid);
        } catch (authError) {
          console.log(`⚠️ Could not delete auth user ${uid}, may not exist in Auth`);
        }
        
        results.deleted++;
        console.log(`✅ Deleted inactive participant: ${uid}`);
      } catch (error) {
        console.error(`❌ Failed to delete user ${uid}:`, error);
        results.errors++;
      }
    }

    console.log('🎉 Inactive participants cleanup completed');
    return NextResponse.json({
      success: true,
      action: 'cleanup_anonymous_users',
      results,
      message: `Cleaned up ${results.deleted} inactive participants (no unlocks)`
    });

  } catch (error) {
    console.error('Error in cleanupAnonymousUsers:', error);
    throw error;
  }
}

async function cleanupEmptyEsners() {
  try {
    console.log('🧹 Starting cleanup of empty ESNers...');
    
    // Get all users with role 'esnner'
    const esnersSnapshot = await adminDb
      .collection('users')
      .where('role', '==', 'esnner')
      .get();

    const toDelete: string[] = [];
    const results = {
      total_esners: esnersSnapshot.size,
      empty_esners: 0,
      deleted: 0,
      errors: 0
    };

    for (const doc of esnersSnapshot.docs) {
      const data = doc.data();
      const uid = doc.id;
      
      // Check if ESNer has filled any profile information
      const hasName = data.name && data.name.trim() !== '';
      const hasBio = data.bio && data.bio.trim() !== '';
      const hasPhoto = data.photoURL && data.photoURL.trim() !== '';
      const hasNationality = data.nationality && data.nationality.trim() !== '';
      
      const hasStarters = data.starters && 
        Array.isArray(data.starters) && 
        data.starters.some((s: string) => s && s.trim() !== '');
        
      const hasInterests = data.interests && 
        Array.isArray(data.interests) && 
        data.interests.some((i: string) => i && i.trim() !== '');
        
      const hasSocials = data.socials && (
        (data.socials.instagram && data.socials.instagram.trim() !== '') ||
        (data.socials.linkedin && data.socials.linkedin.trim() !== '') ||
        (data.socials.whatsapp && data.socials.whatsapp.trim() !== '')
      );

      // ESNer is considered empty if they haven't filled ANY profile information
      const isEmpty = !hasName && !hasBio && !hasPhoto && !hasNationality && !hasStarters && !hasInterests && !hasSocials;

      if (isEmpty) {
        results.empty_esners++;
        toDelete.push(uid);
        console.log(`📋 Found empty ESNer: ${uid} (email: ${data.email || 'no email'}) - no profile data`);
      } else {
        // Log what data they have for debugging
        const profileData = [];
        if (hasName) profileData.push('name');
        if (hasBio) profileData.push('bio');
        if (hasPhoto) profileData.push('photo');
        if (hasNationality) profileData.push('nationality');
        if (hasStarters) profileData.push('starters');
        if (hasInterests) profileData.push('interests');
        if (hasSocials) profileData.push('socials');
        console.log(`✅ Keeping ESNer: ${uid} (${data.email || 'no email'}) - has: ${profileData.join(', ')}`);
      }
    }

    console.log(`📊 Found ${results.empty_esners} empty ESNers to delete`);

    // Delete empty ESNers
    for (const uid of toDelete) {
      try {
        // Get email before deletion for logging
        const userDoc = await adminDb.collection('users').doc(uid).get();
        const email = userDoc.data()?.email || 'unknown';
        
        // Delete from Firestore
        await adminDb.collection('users').doc(uid).delete();
        
        // Try to delete from Auth
        try {
          await adminAuth.deleteUser(uid);
        } catch (authError) {
          console.log(`⚠️ Could not delete auth user ${uid}, may not exist in Auth`);
        }
        
        results.deleted++;
        console.log(`✅ Deleted empty ESNer: ${uid} (${email})`);
      } catch (error) {
        console.error(`❌ Failed to delete ESNer ${uid}:`, error);
        results.errors++;
      }
    }

    console.log('🎉 Empty ESNers cleanup completed');
    return NextResponse.json({
      success: true,
      action: 'cleanup_empty_esners',
      results,
      message: `Cleaned up ${results.deleted} empty ESNers (no profile data)`
    });

  } catch (error) {
    console.error('Error in cleanupEmptyEsners:', error);
    throw error;
  }
}

async function cleanupAllTestData() {
  try {
    console.log('🧹 Starting cleanup of ALL test data...');
    
    // This is a more aggressive cleanup - removes all users except those with specific criteria
    const allUsersSnapshot = await adminDb.collection('users').get();
    
    const toDelete: string[] = [];
    const results = {
      total_users: allUsersSnapshot.size,
      preserved_users: 0,
      deleted: 0,
      errors: 0
    };

    // Define criteria for users to preserve (adjust as needed)
    const preserveEmails = [
      'gbueno10@gmail.com', // Your email
      // Add other emails you want to preserve
    ];

    for (const doc of allUsersSnapshot.docs) {
      const data = doc.data();
      const uid = doc.id;
      const email = data.email || '';
      
      // Preserve users with specific emails or with substantial data
      const shouldPreserve = 
        preserveEmails.includes(email.toLowerCase()) ||
        (data.role === 'esnner' && data.name && data.bio && data.bio.length > 50);

      if (shouldPreserve) {
        results.preserved_users++;
        console.log(`🛡️ Preserving user: ${uid} (${email})`);
      } else {
        toDelete.push(uid);
        console.log(`🗑️ Marking for deletion: ${uid} (${email})`);
      }
    }

    console.log(`📊 Will delete ${toDelete.length} users, preserving ${results.preserved_users}`);

    // Delete marked users
    for (const uid of toDelete) {
      try {
        // Delete from Firestore
        await adminDb.collection('users').doc(uid).delete();
        
        // Try to delete from Auth
        try {
          await adminAuth.deleteUser(uid);
        } catch (authError) {
          console.log(`⚠️ Could not delete auth user ${uid}, may not exist in Auth`);
        }
        
        results.deleted++;
      } catch (error) {
        console.error(`❌ Failed to delete user ${uid}:`, error);
        results.errors++;
      }
    }

    console.log('🎉 Test data cleanup completed');
    return NextResponse.json({
      success: true,
      action: 'cleanup_all_test_data',
      results,
      message: `Cleaned up ${results.deleted} test users, preserved ${results.preserved_users} users`
    });

  } catch (error) {
    console.error('Error in cleanupAllTestData:', error);
    throw error;
  }
}

// GET endpoint to check admin status and available actions
export async function GET(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminAccess(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get current stats
    const usersSnapshot = await adminDb.collection('users').get();
    const stats = {
      total_users: usersSnapshot.size,
      participants: 0,
      esners: 0,
      inactive_participants: 0,
      empty_esners: 0
    };

    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      if (data.role === 'participant') {
        stats.participants++;
        
        // Check if participant has unlocked any profiles
        const unlockedProfiles = data.unlockedProfiles || [];
        const hasUnlockedAny = Array.isArray(unlockedProfiles) && unlockedProfiles.length > 0;
        if (!hasUnlockedAny) stats.inactive_participants++;
        
      } else if (data.role === 'esnner') {
        stats.esners++;
        
        // Check if ESNer has any profile data
        const hasName = data.name && data.name.trim() !== '';
        const hasBio = data.bio && data.bio.trim() !== '';
        const hasPhoto = data.photoURL && data.photoURL.trim() !== '';
        const hasNationality = data.nationality && data.nationality.trim() !== '';
        const hasStarters = data.starters && Array.isArray(data.starters) && data.starters.some((s: string) => s && s.trim() !== '');
        const hasInterests = data.interests && Array.isArray(data.interests) && data.interests.some((i: string) => i && i.trim() !== '');
        const hasSocials = data.socials && (
          (data.socials.instagram && data.socials.instagram.trim() !== '') ||
          (data.socials.linkedin && data.socials.linkedin.trim() !== '') ||
          (data.socials.whatsapp && data.socials.whatsapp.trim() !== '')
        );
        
        const isEmpty = !hasName && !hasBio && !hasPhoto && !hasNationality && !hasStarters && !hasInterests && !hasSocials;
        if (isEmpty) stats.empty_esners++;
      }
    }

    return NextResponse.json({
      admin_access: true,
      available_actions: [
        'cleanup_anonymous_users',
        'cleanup_empty_esners', 
        'cleanup_all_test_data'
      ],
      current_stats: stats,
      usage: {
        'cleanup_anonymous_users': 'Remove participants who have not unlocked any ESNer profiles',
        'cleanup_empty_esners': 'Remove ESNers who have not filled any profile information',
        'cleanup_all_test_data': 'Remove all test data (preserves specific emails)'
      }
    });

  } catch (error: any) {
    console.error('Admin status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check admin status', details: error.message },
      { status: 500 }
    );
  }
}
