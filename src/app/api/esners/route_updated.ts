    // If we have a viewer, check unlock status for each profile
    if (viewerId) {
      // Get viewer's unlocked profiles
      const viewerDoc = await adminDb.collection('users').doc(viewerId).get();
      const viewerData = viewerDoc.data();
      const unlockedProfiles = viewerData?.unlockedProfiles || [];

      const profilesWithUnlockStatus = profiles.map(profile => ({
        ...profile,
        // ESNers always see profiles as unlocked
        isUnlocked: viewerRole === 'esnner' || unlockedProfiles.includes(profile.id)
      }));

      return NextResponse.json(profilesWithUnlockStatus);
    }

    return NextResponse.json(profiles.map(profile => ({ 
      ...profile, 
      // ESNers always see profiles as unlocked
      isUnlocked: viewerRole === 'esnner' 
    })));
