  const userDoc = await adminDb.collection('users').doc(id).get();
  
  if (!userDoc.exists) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const userData = userDoc.data();
  if (userData?.role !== 'esnner' || userData?.visible === false) {
    return NextResponse.json({ error: 'User not available' }, { status: 404 });
  }