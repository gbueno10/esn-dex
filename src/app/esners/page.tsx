import { getAllEsners } from '@/lib/server-data';
import { EsnersPageWrapper } from '@/components/EsnersPageWrapper';
import { RequireAuth } from '@/components/RequireAuth';

// Force dynamic rendering - no caching, always fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function EsnersPage() {
  // Server-side data fetching with explicit no-cache
  const esners = await getAllEsners();

  return (
    <RequireAuth allowAnonymous={true}>
      <EsnersPageWrapper esners={esners} />
    </RequireAuth>
  );
}
