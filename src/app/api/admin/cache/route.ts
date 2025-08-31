import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

// Helper function to verify admin access
async function verifyAdminAccess(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key');
  const expectedAdminKey = process.env.ADMIN_API_KEY;
  
  if (expectedAdminKey && adminKey === expectedAdminKey) {
    return true;
  }
  
  return false;
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

    const { action, path } = await request.json();

    switch (action) {
      case 'revalidate_path':
        if (!path) {
          return NextResponse.json(
            { error: 'Path is required for revalidate_path action' },
            { status: 400 }
          );
        }
        revalidatePath(path);
        return NextResponse.json({
          success: true,
          message: `Path ${path} revalidated successfully`,
          timestamp: new Date().toISOString()
        });

      case 'revalidate_esners':
        revalidatePath('/esners');
        revalidatePath('/');
        return NextResponse.json({
          success: true,
          message: 'ESNers pages revalidated successfully',
          revalidated_paths: ['/esners', '/'],
          timestamp: new Date().toISOString()
        });

      case 'revalidate_all':
        // Revalidate common paths
        const paths = ['/', '/esners', '/challenges'];
        paths.forEach(path => revalidatePath(path));
        
        return NextResponse.json({
          success: true,
          message: 'All main paths revalidated successfully',
          revalidated_paths: paths,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: revalidate_path, revalidate_esners, or revalidate_all' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Cache revalidation error:', error);
    return NextResponse.json(
      { error: 'Cache revalidation failed', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminAccess(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      available_actions: [
        'revalidate_path',
        'revalidate_esners', 
        'revalidate_all'
      ],
      usage: {
        'revalidate_path': 'Revalidate a specific path (requires "path" parameter)',
        'revalidate_esners': 'Revalidate ESNers related pages',
        'revalidate_all': 'Revalidate all main application paths'
      },
      examples: [
        {
          action: 'revalidate_path',
          body: { action: 'revalidate_path', path: '/esners' }
        },
        {
          action: 'revalidate_esners', 
          body: { action: 'revalidate_esners' }
        },
        {
          action: 'revalidate_all',
          body: { action: 'revalidate_all' }
        }
      ]
    });
  } catch (error: any) {
    console.error('Cache info error:', error);
    return NextResponse.json(
      { error: 'Failed to get cache info', details: error.message },
      { status: 500 }
    );
  }
}
