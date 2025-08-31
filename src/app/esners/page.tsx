import { getAllEsners } from '@/lib/server-data';
import { EsnersPageClient } from '@/components/EsnersPageClient';

export default async function EsnersPage() {
  // Server-side data fetching
  const esners = await getAllEsners();

  return (
    <EsnersPageClient 
      esners={esners}
      userRole="participant" // TODO: Get user role from auth context
    />
  );
}
