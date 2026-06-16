import { COMMUNITY_GAMES } from './community'
import { getMemberCollections, MemberGame } from './collections'
import { CommunityGame } from './types'

/**
 * Merges the static scraped community with uploaded member collections.
 * An uploaded collection REPLACES that member's scraped ownership (so an
 * existing member re-uploading doesn't double-count). Static metadata wins
 * for game details (it carries categories), but a missing image is back-filled
 * from the uploaded copy. Pure function for easy testing.
 */
export function mergeCommunity(
  staticGames: CommunityGame[],
  memberGames: MemberGame[]
): { games: CommunityGame[]; members: string[] } {
  const dbMembers = new Set(memberGames.map((g) => g.member))

  // Best-known metadata per game id (static first — it carries categories).
  const meta = new Map<string, CommunityGame>()
  for (const g of staticGames) meta.set(g.id, { ...g, owners: [] })
  for (const g of memberGames) {
    const existing = meta.get(g.id)
    if (!existing) {
      meta.set(g.id, { ...g, categories: [], owners: [] })
    } else {
      if (!existing.thumbnail && g.thumbnail) existing.thumbnail = g.thumbnail
      if (!existing.image && g.image) existing.image = g.image
    }
  }

  // Ownership: static owners not overridden by an upload, plus all uploads.
  const owners = new Map<string, Set<string>>()
  const add = (id: string, member: string) => {
    let set = owners.get(id)
    if (!set) {
      set = new Set()
      owners.set(id, set)
    }
    set.add(member)
  }
  for (const g of staticGames) for (const o of g.owners) if (!dbMembers.has(o)) add(g.id, o)
  for (const g of memberGames) add(g.id, g.member)

  const games = [...meta.values()]
    .map((g) => ({ ...g, owners: [...(owners.get(g.id) ?? [])].sort() }))
    .filter((g) => g.owners.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name))

  const members = [...new Set(games.flatMap((g) => g.owners))].sort()
  return { games, members }
}

/** The community as shown across the app: scraped seed + uploaded collections. */
export async function getCommunity(): Promise<{ games: CommunityGame[]; members: string[] }> {
  let memberGames: MemberGame[] = []
  try {
    memberGames = await getMemberCollections()
  } catch {
    /* DB unavailable — fall back to the static seed only */
  }
  return mergeCommunity(COMMUNITY_GAMES, memberGames)
}
