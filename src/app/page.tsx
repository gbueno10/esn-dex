import { getFeaturedEsners } from '@/lib/server-data';
import { HomePageClient } from '@/components/HomePageClient';

export default async function HomePage() {
  // Fetch data on the server
  const featuredEsners = await getFeaturedEsners(3);

  return <HomePageClient featuredEsners={featuredEsners} />;
}
