import { getAllEsners } from '@/lib/server-data';
import { EsnersPageWrapper } from '@/components/EsnersPageWrapper';
import { RequireAuth } from '@/components/RequireAuth';

export default async function EsnersPage() {
  // Server-side data fetching
  const esners = await getAllEsners();

  return (
    <RequireAuth allowAnonymous={true}>
      <EsnersPageWrapper esners={esners} />
    </RequireAuth>
  );
}
