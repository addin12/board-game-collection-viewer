import { listSessions, createSession } from '@/lib/sessions'

export const dynamic = 'force-dynamic'

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
    const { date, description, host, players, game } = body ?? {}

    if (!date || typeof date !== 'string') {
      return Response.json({ error: 'A date is required' }, { status: 400 })
    }
    if (!host || typeof host !== 'string') {
      return Response.json({ error: 'A host is required' }, { status: 400 })
    }

    const session = await createSession({
      date,
      description: typeof description === 'string' ? description : '',
      host,
      players: Array.isArray(players) ? players.filter((p) => typeof p === 'string') : [],
      game: game && typeof game === 'object' ? game : null,
    })
    return Response.json(session, { status: 201 })
  } catch (error) {
    console.error('[POST /api/sessions]', error)
    return Response.json({ error: 'Failed to create session' }, { status: 500 })
  }
}
