import { describe, it, expect } from 'vitest'
import { mergeCommunity } from '@/lib/community-data'
import { CommunityGame } from '@/lib/types'
import { MemberGame } from '@/lib/collections'

function cg(id: string, name: string, owners: string[], extra: Partial<CommunityGame> = {}): CommunityGame {
  return {
    id, name, owners, categories: ['Abstract'],
    yearPublished: 2017, thumbnail: `t${id}`, image: `i${id}`,
    minPlayers: 2, maxPlayers: 4, minPlayTime: 30, maxPlayTime: 45,
    userRating: null, communityRating: 7.5, bggRank: 100, numPlays: 0, ...extra,
  }
}
function mg(member: string, id: string, name: string, extra: Partial<MemberGame> = {}): MemberGame {
  return {
    member, id, name, yearPublished: 2020, thumbnail: '', image: '',
    minPlayers: 1, maxPlayers: 4, minPlayTime: 20, maxPlayTime: 60,
    userRating: null, communityRating: 7, bggRank: null, numPlays: 0, ...extra,
  }
}

const staticGames = [cg('1', 'Azul', ['Noah', 'Billy']), cg('2', 'Catan', ['Billy'])]

describe('mergeCommunity', () => {
  it('returns the static community when there are no uploads', () => {
    const { games, members } = mergeCommunity(staticGames, [])
    expect(members).toEqual(['Billy', 'Noah'])
    expect(games.find((g) => g.id === '1')!.owners).toEqual(['Billy', 'Noah'])
  })

  it('adds a new member’s uploaded games (and themselves as a member)', () => {
    const { games, members } = mergeCommunity(staticGames, [mg('Deedeen', '3', 'Wingspan'), mg('Deedeen', '1', 'Azul')])
    expect(members).toContain('Deedeen')
    expect(games.find((g) => g.id === '3')!.owners).toEqual(['Deedeen'])
    expect(games.find((g) => g.id === '1')!.owners).toEqual(['Billy', 'Deedeen', 'Noah'])
  })

  it('an upload REPLACES that member’s scraped ownership (no double-count)', () => {
    // Billy re-uploads, owning only Catan now → he should drop off Azul
    const { games } = mergeCommunity(staticGames, [mg('Billy', '2', 'Catan')])
    expect(games.find((g) => g.id === '1')!.owners).toEqual(['Noah'])
    expect(games.find((g) => g.id === '2')!.owners).toEqual(['Billy'])
  })

  it('keeps static categories but back-fills a missing image from an upload', () => {
    const seed = [cg('9', 'NoArt', ['Noah'], { thumbnail: '', image: '' })]
    const { games } = mergeCommunity(seed, [mg('Sam', '9', 'NoArt', { thumbnail: 'up9', image: 'upimg9' })])
    const g = games.find((x) => x.id === '9')!
    expect(g.thumbnail).toBe('up9')
    expect(g.categories).toEqual(['Abstract'])
    expect(g.owners).toEqual(['Noah', 'Sam'])
  })

  it('drops games that end up with no owners', () => {
    const { games } = mergeCommunity([cg('5', 'Orphan', [])], [])
    expect(games.find((g) => g.id === '5')).toBeUndefined()
  })
})
