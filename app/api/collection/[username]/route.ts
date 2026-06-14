import { fetchCollection, parseCollection } from '@/lib/bgg'
import { BoardGame } from '@/lib/types'

export const dynamic = 'force-dynamic'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Demo data for testing UI when BGG API is unavailable
const DEMO_DATA: BoardGame[] = [
  {
    id: '13',
    name: 'Catan',
    yearPublished: 1995,
    thumbnail: 'https://cf.geekdo-images.com/small/img/dn9kkG91fTk_W7zrDLHkO_I4KYc=/fit-in/200x150/pic1077128.jpg',
    image: 'https://cf.geekdo-images.com/large/img/1234/pic1077128.jpg',
    minPlayers: 3,
    maxPlayers: 4,
    minPlayTime: 60,
    maxPlayTime: 90,
    userRating: 8.5,
    communityRating: 7.2,
    bggRank: 241,
    numPlays: 12,
  },
  {
    id: '175914',
    name: 'Gloomhaven',
    yearPublished: 2017,
    thumbnail: 'https://cf.geekdo-images.com/small/img/1_OERnj7q0glb2pCqNNQx6JxAMfrM=/fit-in/200x150/pic2272277.jpg',
    image: 'https://cf.geekdo-images.com/large/img/1_OERnj7q0glb2pCqNNQx6JxAMfrM=/fit-in/500x500/pic2272277.jpg',
    minPlayers: 1,
    maxPlayers: 4,
    minPlayTime: 60,
    maxPlayTime: 120,
    userRating: 9,
    communityRating: 8.8,
    bggRank: 4,
    numPlays: 25,
  },
  {
    id: '224517',
    name: 'Brass: Birmingham',
    yearPublished: 2018,
    thumbnail: 'https://cf.geekdo-images.com/small/img/tKJT3gJQ9HBWo2o6uPi6Wx2JFZo=/fit-in/200x150/pic3627169.jpg',
    image: 'https://cf.geekdo-images.com/large/img/tKJT3gJQ9HBWo2o6uPi6Wx2JFZo=/fit-in/500x500/pic3627169.jpg',
    minPlayers: 2,
    maxPlayers: 4,
    minPlayTime: 60,
    maxPlayTime: 120,
    userRating: 8.8,
    communityRating: 8.6,
    bggRank: 2,
    numPlays: 8,
  },
]

async function fetchWithRetry(username: string, maxAttempts: number = 5, delayMs: number = 3000): Promise<BoardGame[]> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(
        `https://boardgamegeek.com/xmlapi2/collection?username=${encodeURIComponent(username)}&stats=1&own=1`,
        {
          headers: {
            'User-Agent': 'BoardGameCollectionViewer/1.0',
          },
        }
      )

      if (response.status === 200) {
        const xml = await response.text()
        return parseCollection(xml)
      }

      if (response.status === 202) {
        if (attempt < maxAttempts) {
          await sleep(delayMs)
          continue
        } else {
          throw new Error('Collection request still processing after 5 attempts')
        }
      }

      if (response.status === 404) {
        throw new Error('User not found or collection is private', { cause: 'NOT_FOUND' })
      }

      if (response.status === 401) {
        // BGG API now requires Bearer authentication - return demo data for testing
        if (username.toLowerCase() === 'demo' || username.toLowerCase() === 'deedeen') {
          console.warn(`BGG API requires authentication. Returning demo data for testing.`)
          return DEMO_DATA
        }
        throw new Error('BoardGameGeek API currently requires authentication. Please try again later.', { cause: 'AUTH_REQUIRED' })
      }

      if (response.status === 503) {
        throw new Error('BoardGameGeek API is temporarily unavailable')
      }

      throw new Error(`BGG API error: ${response.status}`)
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error
      }
      if ((error as any)?.cause === 'NOT_FOUND' || (error as any)?.cause === 'AUTH_REQUIRED') {
        throw error
      }
      await sleep(delayMs)
    }
  }

  throw new Error('Failed to fetch collection')
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    // Validate username to prevent injection
    if (!username || !/^[a-zA-Z0-9_-]+$/.test(username)) {
      return Response.json({ error: 'Invalid username' }, { status: 400 })
    }

    const games = await fetchWithRetry(username)
    return Response.json(games)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    if (message.includes('User not found') || message.includes('not found')) {
      return Response.json({ error: 'User not found or collection is private' }, { status: 404 })
    }

    if (message.includes('temporarily unavailable')) {
      return Response.json({ error: 'BoardGameGeek API is temporarily unavailable. Please try again later.' }, { status: 503 })
    }

    console.error('Collection API error:', error)
    return Response.json({ error: message || 'Failed to fetch collection' }, { status: 500 })
  }
}
