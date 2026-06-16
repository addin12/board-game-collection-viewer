import { getSupabase } from './supabase'

export type RsvpStatus = 'in' | 'out' | 'maybe'

export interface GameRef {
  id: string
  name: string
  thumbnail: string
}

export interface GameSession {
  id: string
  date: string // ISO datetime when the group will play
  description: string
  location: string // where it's happening (optional)
  host: string // member who called the session
  players: string[] // proposed table (from the session builder)
  games: GameRef[] // games planned for the session (a game night can have several)
  rsvps: Record<string, RsvpStatus>
  createdAt: number
}

export interface CreateSessionInput {
  date: string
  description: string
  location?: string
  host: string
  players: string[]
  games?: GameRef[]
}

export interface UpdateSessionInput {
  date?: string
  description?: string
  location?: string
  players?: string[]
  games?: GameRef[]
}

const TABLE = 'sessions'

// ---------- in-memory fallback (survives HMR via globalThis) ----------
const globalForSessions = globalThis as unknown as { __sessions?: Map<string, GameSession> }
const memStore = globalForSessions.__sessions ?? new Map<string, GameSession>()
globalForSessions.__sessions = memStore

function isUpcoming(s: GameSession): boolean {
  // keep sessions visible until the end of their day
  const end = new Date(s.date)
  end.setHours(23, 59, 59, 999)
  return end.getTime() >= Date.now()
}

function byDateAsc(a: GameSession, b: GameSession): number {
  return new Date(a.date).getTime() - new Date(b.date).getTime()
}

function byDateDesc(a: GameSession, b: GameSession): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime()
}

// ---------- Supabase row mapping ----------
interface SessionRow {
  id: string
  date: string
  description: string | null
  location?: string | null
  host: string
  players: string[] | null
  game?: GameRef | null // legacy single-game column (older rows)
  games?: GameRef[] | null
  rsvps: Record<string, RsvpStatus> | null
  created_at: string
}

function rowToSession(row: SessionRow): GameSession {
  // Prefer the games[] column; fall back to the legacy single `game` for old rows.
  const games = row.games && row.games.length ? row.games : row.game ? [row.game] : []
  return {
    id: row.id,
    date: new Date(row.date).toISOString(),
    description: row.description ?? '',
    location: row.location ?? '',
    host: row.host,
    players: row.players ?? [],
    games,
    rsvps: row.rsvps ?? {},
    createdAt: new Date(row.created_at).getTime(),
  }
}

// PostgREST names the missing column in its error; strip it and retry so the app
// keeps working before optional columns (games, location) have been migrated.
function missingColumn(err: { message?: string } | null): string | null {
  const m = err?.message?.match(/'(\w+)' column/)
  return m ? m[1] : null
}

async function insertRow(
  sb: NonNullable<ReturnType<typeof getSupabase>>,
  row: Record<string, unknown>
): Promise<SessionRow> {
  const attempt: Record<string, unknown> = { ...row }
  for (let i = 0; i <= Object.keys(row).length; i++) {
    const { data, error } = await sb.from(TABLE).insert(attempt).select().single()
    if (!error) return data as SessionRow
    const col = missingColumn(error)
    if (!col || !(col in attempt)) throw new Error(error.message)
    delete attempt[col]
  }
  throw new Error('Failed to create session')
}

async function updateRow(
  sb: NonNullable<ReturnType<typeof getSupabase>>,
  id: string,
  patch: Record<string, unknown>
): Promise<SessionRow | null> {
  const attempt: Record<string, unknown> = { ...patch }
  for (let i = 0; i <= Object.keys(patch).length; i++) {
    const { data, error } = await sb.from(TABLE).update(attempt).eq('id', id).select().maybeSingle()
    if (!error) return (data as SessionRow) ?? null
    const col = missingColumn(error)
    if (!col || !(col in attempt)) throw new Error(error.message)
    delete attempt[col]
  }
  throw new Error('Failed to update session')
}

// ---------- public API (auto-selects Supabase or in-memory) ----------

export async function listSessions(scope: 'upcoming' | 'past' = 'upcoming'): Promise<GameSession[]> {
  const sb = getSupabase()
  if (!sb) {
    const all = Array.from(memStore.values())
    return scope === 'past'
      ? all.filter((s) => !isUpcoming(s)).sort(byDateDesc).slice(0, 50)
      : all.filter(isUpcoming).sort(byDateAsc)
  }

  const { data, error } = await sb.from(TABLE).select('*').order('date', { ascending: scope !== 'past' })
  if (error) throw new Error(error.message)
  const mapped = (data as SessionRow[]).map(rowToSession)
  return scope === 'past' ? mapped.filter((s) => !isUpcoming(s)).slice(0, 50) : mapped.filter(isUpcoming)
}

export async function createSession(input: CreateSessionInput): Promise<GameSession> {
  const games = input.games ?? []
  const location = (input.location ?? '').trim()
  const sb = getSupabase()

  if (!sb) {
    const full: GameSession = {
      id: crypto.randomUUID(),
      date: new Date(input.date).toISOString(),
      description: input.description.trim(),
      location,
      host: input.host,
      players: input.players,
      games,
      rsvps: { [input.host]: 'in' },
      createdAt: Date.now(),
    }
    memStore.set(full.id, full)
    return full
  }

  // `game` (legacy, first game) is kept in sync for backward compatibility.
  const row = await insertRow(sb, {
    date: new Date(input.date).toISOString(),
    description: input.description.trim(),
    location,
    host: input.host,
    players: input.players,
    game: games[0] ?? null,
    games,
    rsvps: { [input.host]: 'in' as RsvpStatus },
  })
  return rowToSession(row)
}

export async function setRsvp(
  id: string,
  name: string,
  status: RsvpStatus | 'clear'
): Promise<GameSession | null> {
  const sb = getSupabase()

  if (!sb) {
    const s = memStore.get(id)
    if (!s) return null
    if (status === 'clear') delete s.rsvps[name]
    else s.rsvps[name] = status
    memStore.set(id, s)
    return s
  }

  // Prefer the atomic RPC (race-free JSONB merge). Falls back to read-modify-write
  // if the set_rsvp() function hasn't been created in this project yet.
  const rpc = await sb.rpc('set_rsvp', { p_id: id, p_name: name, p_status: status })
  if (!rpc.error) {
    const rows = (rpc.data as SessionRow[]) ?? []
    return rows[0] ? rowToSession(rows[0]) : null
  }

  const { data: existing, error: readErr } = await sb.from(TABLE).select('*').eq('id', id).maybeSingle()
  if (readErr) throw new Error(readErr.message)
  if (!existing) return null

  const current = (existing as SessionRow).rsvps ?? {}
  if (status === 'clear') delete current[name]
  else current[name] = status

  const { data, error } = await sb.from(TABLE).update({ rsvps: current }).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return rowToSession(data as SessionRow)
}

export async function updateSession(id: string, input: UpdateSessionInput): Promise<GameSession | null> {
  const patch: Record<string, unknown> = {}
  if (input.date !== undefined) patch.date = new Date(input.date).toISOString()
  if (input.description !== undefined) patch.description = input.description.trim()
  if (input.location !== undefined) patch.location = input.location.trim()
  if (input.players !== undefined) patch.players = input.players
  if (input.games !== undefined) {
    patch.games = input.games
    patch.game = input.games[0] ?? null // keep legacy column in sync
  }

  const sb = getSupabase()
  if (!sb) {
    const s = memStore.get(id)
    if (!s) return null
    if (input.date !== undefined) s.date = patch.date as string
    if (input.description !== undefined) s.description = patch.description as string
    if (input.location !== undefined) s.location = patch.location as string
    if (input.players !== undefined) s.players = input.players
    if (input.games !== undefined) s.games = input.games
    memStore.set(id, s)
    return s
  }

  if (Object.keys(patch).length === 0) {
    const { data } = await sb.from(TABLE).select('*').eq('id', id).maybeSingle()
    return data ? rowToSession(data as SessionRow) : null
  }
  const row = await updateRow(sb, id, patch)
  return row ? rowToSession(row) : null
}

export async function deleteSession(id: string): Promise<boolean> {
  const sb = getSupabase()
  if (!sb) return memStore.delete(id)

  const { error } = await sb.from(TABLE).delete().eq('id', id)
  if (error) throw new Error(error.message)
  return true
}
