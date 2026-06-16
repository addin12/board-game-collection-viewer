import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import PageHeader from '@/components/PageHeader'
import CollectionStats from '@/components/CollectionStats'
import CommunityList from '@/components/CommunityList'
import { getCollectionData, CollectionError } from '@/lib/collection'
import { CommunityGame } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  return {
    title: `${username}'s Collection`,
  }
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  // Validate username to prevent malformed requests
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    notFound()
  }

  let games
  try {
    // Call the BGG data layer directly — no internal HTTP round-trip
    games = await getCollectionData(username)
  } catch (error) {
    if (error instanceof CollectionError && error.status === 404) {
      notFound()
    }
    // Re-throw so the error boundary (error.tsx) shows a friendly message
    throw error
  }

  // Adapt BGG games to the shared community-list shape (no owners/categories)
  const listGames: CommunityGame[] = games.map((g) => ({ ...g, categories: [], owners: [] }))

  return (
    <div className="wrap">
      <PageHeader />

      <main id="main">
      <header className="hero">
        <div className="eyebrow">Collection</div>
        <h1>{username}&apos;s shelf</h1>
        <p>{games.length} games pulled from BoardGameGeek.</p>
        <div className="rule"></div>
      </header>

      {games.length === 0 ? (
        <div className="empty">No games found in this collection.</div>
      ) : (
        <>
          <CollectionStats games={games} />
          <CommunityList games={listGames} />
        </>
      )}
      </main>
    </div>
  )
}
