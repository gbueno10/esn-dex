import { getAllEsners } from '@/lib/server-data';
import { EsnersPageWrapper } from '@/components/EsnersPageWrapper';

export default async function EsnersPage() {
  // Server-side data fetching
  const esners = await getAllEsners();

  return <EsnersPageWrapper esners={esners} />;
}
