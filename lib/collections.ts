import { getSupabase } from './supabase'
import { BoardGame } from './types'

const TABLE = 'member_collections'

export interface MemberGame extends BoardGame {
  member: string
}

// ---------- in-memory fallback (member -> games) ----------
const globalForCollections = globalThis as unknown as { __collections?: Map<string, BoardGame[]> }
const memStore = globalForCollections.__collections ?? new Map<string, BoardGame[]>()
globalForCollections.__collections = memStore

interface Row {
  member: string
  game_id: string
  name: string
  year: number | null
  min_players: number | null
  max_players: number | null
  min_playtime: number | null
  max_playtime: number | null
  community_rating: number | string | null
  bgg_rank: number | null
  thumbnail: string | null
  image: string | null
}

function rowToGame(r: Row): MemberGame {
  return {
    member: r.member,
    id: r.game_id,
    name: r.name,
    yearPublished: r.year,
    thumbnail: r.thumbnail ?? '',
    image: r.image ?? '',
    minPlayers: r.min_players ?? 1,
    maxPlayers: r.max_players ?? 1,
    minPlayTime: r.min_playtime ?? 0,
    maxPlayTime: r.max_playtime ?? 0,
    userRating: null,
    communityRating: Number(r.community_rating) || 0,
    bggRank: r.bgg_rank,
    numPlays: 0,
  }
}

/** Every game owned by a member who has uploaded a collection. */
export async function getMemberCollections(): Promise<MemberGame[]> {
  const sb = getSupabase()
  if (!sb) {
    const out: MemberGame[] = []
    for (const [member, games] of memStore) for (const g of games) out.push({ member, ...g })
    return out
  }

  const { data, error } = await sb.from(TABLE).select('*')
  if (error) throw new Error(error.message)
  return (data as Row[]).map(rowToGame)
}

/** Replace a member's uploaded collection with the given games. Returns count saved. */
export async function saveMemberCollection(member: string, games: BoardGame[]): Promise<number> {
  const unique = [...new Map(games.map((g) => [g.id, g])).values()]

  const sb = getSupabase()
  if (!sb) {
    memStore.set(member, unique)
    return unique.length
  }

  const del = await sb.from(TABLE).delete().eq('member', member)
  if (del.error) throw new Error(del.error.message)
  if (unique.length === 0) return 0

  const rows = unique.map((g) => ({
    member,
    game_id: g.id,
    name: g.name,
    year: g.yearPublished,
    min_players: g.minPlayers,
    max_players: g.maxPlayers,
    min_playtime: g.minPlayTime,
    max_playtime: g.maxPlayTime,
    community_rating: g.communityRating,
    bgg_rank: g.bggRank,
    thumbnail: g.thumbnail,
    image: g.image,
  }))
  const { error } = await sb.from(TABLE).insert(rows)
  if (error) throw new Error(error.message)
  return rows.length
}
