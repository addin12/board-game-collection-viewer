import { describe, it, expect } from 'vitest'
import { createSession, setRsvp, updateSession, deleteSession, listSessions } from '@/lib/sessions'

// With no Supabase env present (the case in tests), the sessions layer uses its
// in-memory store — so these exercise the real create/rsvp/update/list/delete logic.

const future = () => new Date(Date.now() + 86_400_000).toISOString()

describe('sessions (in-memory)', () => {
  it('creates a session with the host RSVP’d in', async () => {
    const s = await createSession({
      date: future(),
      description: 'game night',
      host: 'Noah',
      players: ['Noah', 'Billy'],
      games: [{ id: '1', name: 'Catan', thumbnail: '' }],
    })
    expect(s.id).toBeTruthy()
    expect(s.host).toBe('Noah')
    expect(s.rsvps).toEqual({ Noah: 'in' })
    expect(s.games).toHaveLength(1)
    await deleteSession(s.id)
  })

  it('sets, changes, and clears an RSVP', async () => {
    const s = await createSession({ date: future(), description: '', host: 'Noah', players: ['Noah'], games: [] })
    const a = await setRsvp(s.id, 'Billy', 'maybe')
    expect(a?.rsvps['Billy']).toBe('maybe')
    const b = await setRsvp(s.id, 'Billy', 'in')
    expect(b?.rsvps['Billy']).toBe('in')
    const c = await setRsvp(s.id, 'Billy', 'clear')
    expect(c?.rsvps['Billy']).toBeUndefined()
    await deleteSession(s.id)
  })

  it('updates date, location, games and the player roster', async () => {
    const s = await createSession({ date: future(), description: 'a', host: 'Noah', players: ['Noah'], games: [] })
    const u = await updateSession(s.id, {
      description: 'b',
      location: "Dedi's place",
      games: [{ id: '2', name: 'Azul', thumbnail: '' }],
      players: ['Noah', 'Sam'],
    })
    expect(u?.description).toBe('b')
    expect(u?.location).toBe("Dedi's place")
    expect(u?.games[0]?.name).toBe('Azul')
    expect(u?.players).toEqual(['Noah', 'Sam'])
    await deleteSession(s.id)
  })

  it('lists upcoming but not past for a future session', async () => {
    const s = await createSession({ date: future(), description: '', host: 'Noah', players: [], games: [] })
    const upcoming = await listSessions('upcoming')
    expect(upcoming.some((x) => x.id === s.id)).toBe(true)
    const past = await listSessions('past')
    expect(past.some((x) => x.id === s.id)).toBe(false)
    await deleteSession(s.id)
  })

  it('deletes a session', async () => {
    const s = await createSession({ date: future(), description: '', host: 'Noah', players: [], games: [] })
    expect(await deleteSession(s.id)).toBe(true)
    const upcoming = await listSessions('upcoming')
    expect(upcoming.some((x) => x.id === s.id)).toBe(false)
  })
})
