import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import CollectionStats from '@/components/CollectionStats'
import GameGrid from '@/components/GameGrid'

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

async function getCollection(username: string) {
  // Use relative path for internal API calls (works correctly on Vercel)
  const url = `/api/collection/${encodeURIComponent(username)}`

  console.log('[getCollection] Fetching from:', url)

  try {
    const response = await fetch(url, {
      cache: 'no-store',
    })

    console.log('[getCollection] Response status:', response.status)

    if (response.status === 404) {
      notFound()
    }

    if (!response.ok) {
      const errorData = await response.json()
      const errorMessage = errorData.error || `API returned ${response.status}`
      console.error('[getCollection] API error:', errorMessage)
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('[getCollection] Success, games count:', data.length)
    return data
  } catch (error) {
    console.error('[getCollection] Error:', error)
    throw error
  }
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const games = await getCollection(username)

  return (
    <main className="min-h-screen bg-slate-900 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-amber-400 hover:text-amber-300 text-sm font-semibold mb-4 inline-block">
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
