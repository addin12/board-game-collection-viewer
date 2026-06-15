import { updateSession, deleteSession, GameRef } from '@/lib/sessions'

export const dynamic = 'force-dynamic'

function sanitizeGames(value: unknown): GameRef[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((g): g is GameRef => !!g && typeof g === 'object' && typeof (g as GameRef).id === 'string')
    .map((g) => ({ id: String(g.id), name: String(g.name ?? ''), thumbnail: String(g.thumbnail ?? '') }))
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { date, description, games } = body ?? {}

    const updated = await updateSession(id, {
      ...(typeof date === 'string' ? { date } : {}),
      ...(typeof description === 'string' ? { description } : {}),
      ...(games !== undefined ? { games: sanitizeGames(games) } : {}),
    })
    if (!updated) {
      return Response.json({ error: 'Session not found' }, { status: 404 })
    }
    return Response.json(updated)
  } catch (error) {
    console.error('[PATCH /api/sessions/:id]', error)
    return Response.json({ error: 'Failed to update session' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteSession(id)
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('[DELETE /api/sessions/:id]', error)
    return Response.json({ error: 'Failed to delete session' }, { status: 500 })
  }
}
