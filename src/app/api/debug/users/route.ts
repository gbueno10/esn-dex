import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * Debug endpoint to check Firestore data
 * GET /api/debug/users
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Checking Firestore connection...');
    
    // Test basic connection
    const testSnapshot = await adminDb.collection('users').limit(1).get();
    console.log('✅ Debug: Firestore connection working, found', testSnapshot.size, 'documents');

    // Get all users with details
    const allUsersSnapshot = await adminDb.collection('users').limit(10).get();
    const allUsers: any[] = allUsersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log('📊 Debug: Total users found:', allUsers.length);

    // Check specifically for ESNers
    const esnersSnapshot = await adminDb
      .collection('users')
      .where('role', '==', 'esner')
      .get();

    console.log('👥 Debug: ESNers with role=esner:', esnersSnapshot.size);

    // Check for visible ESNers
    const visibleEsnersSnapshot = await adminDb
      .collection('users')
      .where('role', '==', 'esner')
      .where('visible', '==', true)
      .get();

    console.log('👁️ Debug: Visible ESNers:', visibleEsnersSnapshot.size);

    // Analyze data structure
    const analysis = {
      totalUsers: allUsers.length,
      usersWithRole: allUsers.filter((u: any) => u.role).length,
      roleDistribution: allUsers.reduce((acc: any, user: any) => {
        const role = user.role || 'no-role';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {}),
      visibilityDistribution: allUsers.reduce((acc: any, user: any) => {
        const visible = user.visible === undefined ? 'undefined' : user.visible;
        acc[visible] = (acc[visible] || 0) + 1;
        return acc;
      }, {}),
      sampleUsers: allUsers.slice(0, 3).map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        visible: user.visible,
      }))
    };

    return NextResponse.json({
      success: true,
      analysis,
      message: 'Debug data retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Debug error:', error);
    return NextResponse.json(
      { 
        error: 'Debug failed',
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}
