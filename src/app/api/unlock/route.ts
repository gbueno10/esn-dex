import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// Helper function to verify token from header
async function verifyAuthToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await verifyAuthToken(authHeader);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { esnerUid } = await request.json();
    
    if (!esnerUid) {
      return NextResponse.json({ error: 'ESNer UID is required' }, { status: 400 });
    }

    // Verificar se o ESNer existe e está visível
    const esnerDoc = await adminDb.collection('users').doc(esnerUid).get();
    
    if (!esnerDoc.exists) {
      return NextResponse.json({ error: 'ESNer not found' }, { status: 404 });
    }

    const esnerData = esnerDoc.data();
    if (esnerData?.role !== 'esnner' || esnerData?.visible === false) {
      return NextResponse.json({ error: 'ESNer not available' }, { status: 404 });
    }

    // Buscar o documento do usuário atual
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const currentUnlockedProfiles = userData?.unlockedProfiles || [];

    // Verificar se o perfil já foi desbloqueado (operação idempotente)
    if (!currentUnlockedProfiles.includes(esnerUid)) {
      // Adicionar o ESNer à lista de perfis desbloqueados
      await adminDb.collection('users').doc(user.uid).update({
        unlockedProfiles: [...currentUnlockedProfiles, esnerUid],
        lastUnlockedAt: new Date(),
        updatedAt: new Date()
      });

      // Incrementar contador de vezes que o ESNer foi desbloqueado
      await adminDb.collection('users').doc(esnerUid).update({
        unlockedCount: (esnerData?.unlockedCount || 0) + 1,
        lastUnlockedAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Retornar os dados do ESNer para navegação
    return NextResponse.json({ 
      success: true,
      esner: {
        uid: esnerDoc.id,
        ...esnerData,
        isUnlocked: true
      },
      message: 'Profile unlocked successfully'
    });
  } catch (error: any) {
    console.error('Unlock error:', error);
    return NextResponse.json(
      { error: 'Failed to unlock profile' },
      { status: 500 }
    );
  }
}
