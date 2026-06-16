import PageHeader from '@/components/PageHeader'
import CollectionTabs from '@/components/CollectionTabs'
import { getCommunity } from '@/lib/community-data'

export const metadata = {
  title: 'Collection',
}

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const initialTab = tab === 'session' || tab === 'bgg' ? tab : 'browse'
  const { games, members } = await getCommunity()

  return (
    <div className="wrap">
      <PageHeader />

      <header className="hero">
        <div className="eyebrow">Collection</div>
        <h1>The club&apos;s shelf</h1>
        <p>Browse every game, pool the table for tonight, or pull a collection from BoardGameGeek — all in one place.</p>
        <div className="rule"></div>
      </header>

      <CollectionTabs members={members} games={games} initialTab={initialTab} />
    </div>
  )
}
