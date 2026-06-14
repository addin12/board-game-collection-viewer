export interface BoardGame {
  id: string
  name: string
  yearPublished: number | null
  thumbnail: string
  image: string
  minPlayers: number
  maxPlayers: number
  minPlayTime: number
  maxPlayTime: number
  userRating: number | null
  communityRating: number
  bggRank: number | null
  numPlays: number
}

export type SortField = 'name' | 'userRating' | 'communityRating' | 'bggRank' | 'numPlays' | 'minPlayTime'
export type SortDirection = 'asc' | 'desc'

export interface FilterState {
  minPlayers: number | null
  maxPlayTime: number | null
  sortField: SortField
  sortDirection: SortDirection
}
