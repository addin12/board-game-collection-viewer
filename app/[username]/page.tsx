import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import CollectionStats from '@/components/CollectionStats'
import GameGrid from '@/components/GameGrid'
import { getCollectionData, CollectionError } from '@/lib/collection'

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

  return (
    <main className="min-h-screen bg-slate-900 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/session" className="text-amber-400 hover:text-amber-300 text-sm font-semibold mb-4 inline-block">
            ← Back to Search
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
            {username}&apos;s Collection
          </h1>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-lg">No games found in this collection</p>
          </div>
        ) : (
          <>
            <CollectionStats games={games} />
            <GameGrid games={games} />
          </>
        )}
      </div>
    </main>
  )
}
