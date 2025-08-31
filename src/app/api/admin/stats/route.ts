import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// Helper function to verify admin access
async function verifyAdminAccess(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const adminKey = request.headers.get('x-admin-key');
  
  // Check for admin key in header
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

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const isAdmin = await verifyAdminAccess(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    console.log('📊 Generating admin stats...');

    // Get all users
    const usersSnapshot = await adminDb.collection('users').get();
    
    const stats = {
      overview: {
        total_users: usersSnapshot.size,
        participants: 0,
        esners: 0,
        admins: 0,
        others: 0
      },
      participants: {
        total: 0,
        with_data: 0,
        empty: 0,
        visible: 0
      },
      esners: {
        total: 0,
        with_complete_profile: 0,
        with_partial_profile: 0,
        empty: 0,
        visible: 0
      },
      data_quality: {
        users_with_names: 0,
        users_with_bios: 0,
        users_with_photos: 0,
        users_with_socials: 0
      },
      recent_activity: {
        created_today: 0,
        created_this_week: 0,
        created_this_month: 0
      }
    };

    const detailed_users: any[] = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      const uid = doc.id;
      
      // Count by role
      switch (data.role) {
        case 'participant':
          stats.overview.participants++;
          stats.participants.total++;
          break;
        case 'esnner':
          stats.overview.esners++;
          stats.esners.total++;
          break;
        case 'admin':
          stats.overview.admins++;
          break;
        default:
          stats.overview.others++;
      }

      // Analyze data quality
      const hasName = data.name && data.name.trim() !== '';
      const hasBio = data.bio && data.bio.trim() !== '';
      const hasPhoto = data.photoURL && data.photoURL.trim() !== '';
      const hasSocials = data.socials && (
        (data.socials.instagram && data.socials.instagram.trim() !== '') ||
        (data.socials.linkedin && data.socials.linkedin.trim() !== '') ||
        (data.socials.whatsapp && data.socials.whatsapp.trim() !== '')
      );

      if (hasName) stats.data_quality.users_with_names++;
      if (hasBio) stats.data_quality.users_with_bios++;
      if (hasPhoto) stats.data_quality.users_with_photos++;
      if (hasSocials) stats.data_quality.users_with_socials++;

      // Analyze by role
      if (data.role === 'participant') {
        if (data.visible) stats.participants.visible++;
        
        if (hasName || hasBio || hasPhoto) {
          stats.participants.with_data++;
        } else {
          stats.participants.empty++;
        }
      } else if (data.role === 'esnner') {
        if (data.visible) stats.esners.visible++;
        
        if (hasName && hasBio && hasPhoto) {
          stats.esners.with_complete_profile++;
        } else if (hasName || hasBio || hasPhoto) {
          stats.esners.with_partial_profile++;
        } else {
          stats.esners.empty++;
        }
      }

      // Recent activity analysis
      if (data.createdAt) {
        const createdDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        
        if (createdDate >= today) {
          stats.recent_activity.created_today++;
        }
        if (createdDate >= weekAgo) {
          stats.recent_activity.created_this_week++;
        }
        if (createdDate >= monthAgo) {
          stats.recent_activity.created_this_month++;
        }
      }

      // Add to detailed list (limit to prevent huge responses)
      if (detailed_users.length < 100) {
        detailed_users.push({
          uid,
          email: data.email || 'no email',
          role: data.role || 'no role',
          name: data.name || 'no name',
          has_bio: !!hasBio,
          has_photo: !!hasPhoto,
          visible: !!data.visible,
          created_at: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : 'unknown'
        });
      }
    }

    console.log('✅ Admin stats generated successfully');

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats,
      detailed_users,
      actions_available: [
        {
          endpoint: '/api/admin/cleanup',
          method: 'POST',
          actions: [
            'cleanup_anonymous_users',
            'cleanup_empty_esners',
            'cleanup_all_test_data'
          ]
        }
      ]
    });

  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to generate admin stats', details: error.message },
      { status: 500 }
    );
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

    const { action, target_uid } = await request.json();

    switch (action) {
      case 'get_user_details':
        return await getUserDetails(target_uid);
      
      case 'delete_user':
        return await deleteSpecificUser(target_uid);
        
      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Admin action error:', error);
    return NextResponse.json(
      { error: 'Admin action failed', details: error.message },
      { status: 500 }
    );
  }
}

async function getUserDetails(uid: string) {
  if (!uid) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    // Get from Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found in Firestore' },
        { status: 404 }
      );
    }

    const firestoreData = userDoc.data();

    // Try to get from Auth
    let authData = null;
    try {
      authData = await adminAuth.getUser(uid);
    } catch (authError) {
      console.log(`User ${uid} not found in Auth`);
    }

    return NextResponse.json({
      success: true,
      user: {
        uid,
        firestore_data: firestoreData,
        auth_data: authData ? {
          email: authData.email,
          email_verified: authData.emailVerified,
          disabled: authData.disabled,
          created: authData.metadata.creationTime,
          last_sign_in: authData.metadata.lastSignInTime
        } : null
      }
    });

  } catch (error: any) {
    console.error(`Error getting user details for ${uid}:`, error);
    return NextResponse.json(
      { error: 'Failed to get user details', details: error.message },
      { status: 500 }
    );
  }
}

async function deleteSpecificUser(uid: string) {
  if (!uid) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    // Get user data before deletion
    const userDoc = await adminDb.collection('users').doc(uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    // Delete from Firestore
    await adminDb.collection('users').doc(uid).delete();
    console.log(`✅ Deleted user from Firestore: ${uid}`);

    // Try to delete from Auth
    try {
      await adminAuth.deleteUser(uid);
      console.log(`✅ Deleted user from Auth: ${uid}`);
    } catch (authError) {
      console.log(`⚠️ Could not delete user from Auth: ${uid}`);
    }

    return NextResponse.json({
      success: true,
      message: `User ${uid} deleted successfully`,
      deleted_user_data: userData
    });

  } catch (error: any) {
    console.error(`Error deleting user ${uid}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete user', details: error.message },
      { status: 500 }
    );
  }
}
