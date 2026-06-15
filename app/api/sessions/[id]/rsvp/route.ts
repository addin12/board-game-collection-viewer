import { setRsvp } from '@/lib/sessions'

export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, status } = body ?? {}

    if (!name || typeof name !== 'string') {
      return Response.json({ error: 'A name is required' }, { status: 400 })
    }
    if (status !== 'in' && status !== 'out' && status !== 'clear') {
      return Response.json({ error: 'Invalid RSVP status' }, { status: 400 })
    }

    const updated = await setRsvp(id, name, status)
    if (!updated) {
      return Response.json({ error: 'Session not found' }, { status: 404 })
    }
    return Response.json(updated)
  } catch (error) {
    console.error('[POST /api/sessions/:id/rsvp]', error)
    return Response.json({ error: 'Failed to update RSVP' }, { status: 500 })
  }
}
