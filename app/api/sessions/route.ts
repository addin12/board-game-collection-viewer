import { listSessions, createSession, GameRef } from '@/lib/sessions'

export const dynamic = 'force-dynamic'

// Keep only well-formed game refs from an untrusted body.
function sanitizeGames(value: unknown): GameRef[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((g): g is GameRef => !!g && typeof g === 'object' && typeof (g as GameRef).id === 'string')
    .map((g) => ({ id: String(g.id), name: String(g.name ?? ''), thumbnail: String(g.thumbnail ?? '') }))
}

export async function GET() {
  try {
    const sessions = await listSessions()
    return Response.json(sessions)
  } catch (error) {
    console.error('[GET /api/sessions]', error)
    return Response.json({ error: 'Failed to load sessions' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { date, description, location, host, players, games } = body ?? {}

    if (!date || typeof date !== 'string') {
      return Response.json({ error: 'A date is required' }, { status: 400 })
    }
    if (!host || typeof host !== 'string') {
      return Response.json({ error: 'A host is required' }, { status: 400 })
    }

    const session = await createSession({
      date,
      description: typeof description === 'string' ? description : '',
      location: typeof location === 'string' ? location : '',
      host,
      players: Array.isArray(players) ? players.filter((p) => typeof p === 'string') : [],
      games: sanitizeGames(games),
    })
    return Response.json(session, { status: 201 })
  } catch (error) {
    console.error('[POST /api/sessions]', error)
    return Response.json({ error: 'Failed to create session' }, { status: 500 })
  }
}
