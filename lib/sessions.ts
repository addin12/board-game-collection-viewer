import { getDb } from './firebase'

export type RsvpStatus = 'in' | 'out'

export interface GameRef {
  id: string
  name: string
  thumbnail: string
}

export interface GameSession {
  id: string
  date: string // ISO datetime when the group will play
  description: string
  host: string // member who called the session
  players: string[] // proposed table (from the session builder)
  game: GameRef | null // optional locked-in game
  rsvps: Record<string, RsvpStatus>
  createdAt: number
}

export interface CreateSessionInput {
  date: string
  description: string
  host: string
  players: string[]
  game?: GameRef | null
}

const COLLECTION = 'sessions'

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

// ---------- public API (auto-selects Firestore or in-memory) ----------

export async function listSessions(): Promise<GameSession[]> {
  const db = getDb()
  if (!db) {
    return Array.from(memStore.values()).filter(isUpcoming).sort(byDateAsc)
  }

  const { collection, getDocs, query, orderBy } = await import('firebase/firestore')
  const snap = await getDocs(query(collection(db, COLLECTION), orderBy('date', 'asc')))
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<GameSession, 'id'>) }))
    .filter(isUpcoming)
}

export async function createSession(input: CreateSessionInput): Promise<GameSession> {
  const session: Omit<GameSession, 'id'> = {
    date: input.date,
    description: input.description.trim(),
    host: input.host,
    players: input.players,
    game: input.game ?? null,
    rsvps: { [input.host]: 'in' }, // the host is in by default
    createdAt: Date.now(),
  }

  const db = getDb()
  if (!db) {
    const id = crypto.randomUUID()
    const full = { id, ...session }
    memStore.set(id, full)
    return full
  }

  const { collection, addDoc } = await import('firebase/firestore')
  const ref = await addDoc(collection(db, COLLECTION), session)
  return { id: ref.id, ...session }
}

export async function setRsvp(
  id: string,
  name: string,
  status: RsvpStatus | 'clear'
): Promise<GameSession | null> {
  const db = getDb()

  if (!db) {
    const s = memStore.get(id)
    if (!s) return null
    if (status === 'clear') delete s.rsvps[name]
    else s.rsvps[name] = status
    memStore.set(id, s)
    return s
  }

  const { doc, getDoc, updateDoc, deleteField } = await import('firebase/firestore')
  const ref = doc(db, COLLECTION, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null

  await updateDoc(ref, {
    [`rsvps.${name}`]: status === 'clear' ? deleteField() : status,
  })
  const updated = await getDoc(ref)
  return { id: updated.id, ...(updated.data() as Omit<GameSession, 'id'>) }
}
