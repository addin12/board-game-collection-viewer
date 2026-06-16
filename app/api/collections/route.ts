import { saveMemberCollection } from '@/lib/collections'
import { BoardGame } from '@/lib/types'

export const dynamic = 'force-dynamic'

function sanitizeGames(value: unknown): BoardGame[] {
  if (!Array.isArray(value)) return []
  const out: BoardGame[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const g = item as Record<string, unknown>
    if (typeof g.id !== 'string' || typeof g.name !== 'string') continue
    out.push({
      id: g.id,
      name: g.name,
      yearPublished: typeof g.yearPublished === 'number' ? g.yearPublished : null,
      thumbnail: typeof g.thumbnail === 'string' ? g.thumbnail : '',
      image: typeof g.image === 'string' ? g.image : '',
      minPlayers: Number(g.minPlayers) || 1,
      maxPlayers: Number(g.maxPlayers) || 1,
      minPlayTime: Number(g.minPlayTime) || 0,
      maxPlayTime: Number(g.maxPlayTime) || 0,
      userRating: null,
      communityRating: Number(g.communityRating) || 0,
      bggRank: typeof g.bggRank === 'number' ? g.bggRank : null,
      numPlays: 0,
    })
  }
  return out
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const member = typeof body?.member === 'string' ? body.member.trim() : ''
    if (!member) {
      return Response.json({ error: 'A name is required' }, { status: 400 })
    }
    if (member.length > 40) {
      return Response.json({ error: 'That name is too long' }, { status: 400 })
    }

    const games = sanitizeGames(body?.games)
    if (games.length === 0) {
      return Response.json({ error: 'No games to save' }, { status: 400 })
    }

    const count = await saveMemberCollection(member, games)
    return Response.json({ member, count }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/collections]', error)
    return Response.json({ error: 'Failed to save collection' }, { status: 500 })
  }
}
