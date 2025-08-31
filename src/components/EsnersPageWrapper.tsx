'use client';

import { useAuth } from '@/components/AuthGate';
import { EsnersPageClient } from '@/components/EsnersPageClient';
import { EsnerProfile } from '@/lib/server-data';

interface EsnersPageWrapperProps {
  esners: EsnerProfile[];
}

export function EsnersPageWrapper({ esners }: EsnersPageWrapperProps) {
  const { userRole } = useAuth();

  return (
    <EsnersPageClient 
      esners={esners}
      userRole={userRole || undefined}
    />
  );
}
