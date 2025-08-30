import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const yesentersSnapshot = await adminDb.collection('yesenters').get();
    const yesenters = yesentersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(yesenters);
  } catch (error: any) {
    console.error('Get yesenters error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch yesenters' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, esnnerId, ...yesenterData } = await request.json();

    if (!name || !esnnerId) {
      return NextResponse.json(
        { error: 'Name and ESNner ID are required' },
        { status: 400 }
      );
    }

    // Create yesenter document
    const yesenterRef = adminDb.collection('yesenters').doc();
    const yesenterId = yesenterRef.id;

    await yesenterRef.set({
      name,
      email,
      esnnerId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...yesenterData,
    });

    // No longer need to create separate unlock document
    // Unlock info is now stored in the users collection

    return NextResponse.json({
      id: yesenterId,
      name,
      email,
      esnnerId,
    });
  } catch (error: any) {
    console.error('Create yesenter error:', error);
    return NextResponse.json(
      { error: 'Failed to create yesenter' },
      { status: 500 }
    );
  }
}
