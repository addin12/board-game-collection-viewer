'use client'

import { useState, useMemo } from 'react'
import { BoardGame, FilterState, SortField } from '@/lib/types'
import GameCard from './GameCard'
import FilterBar from './FilterBar'

interface GameGridProps {
  games: BoardGame[]
}

function sortGames(games: BoardGame[], field: SortField, direction: 'asc' | 'desc'): BoardGame[] {
  const sorted = [...games].sort((a, b) => {
    let aVal: number | string = 0
    let bVal: number | string = 0

    switch (field) {
      case 'name':
        aVal = a.name.toLowerCase()
        bVal = b.name.toLowerCase()
        return direction === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal)

      case 'bggRank':
        aVal = a.bggRank ?? 9999
        bVal = b.bggRank ?? 9999
        break

      case 'userRating':
        aVal = a.userRating ?? 0
        bVal = b.userRating ?? 0
        break

      case 'communityRating':
        aVal = a.communityRating
        bVal = b.communityRating
        break

      case 'numPlays':
        aVal = a.numPlays
        bVal = b.numPlays
        break

      case 'minPlayTime':
        aVal = a.minPlayTime
        bVal = b.minPlayTime
        break
    }

    return direction === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
  })

  return sorted
}

export default function GameGrid({ games }: GameGridProps) {
  const [filters, setFilters] = useState<FilterState>({
    minPlayers: null,
    maxPlayTime: null,
    sortField: 'bggRank',
    sortDirection: 'asc',
  })

  const filtered = useMemo(() => {
    let result = games

    if (filters.minPlayers !== null) {
      result = result.filter((g) => g.maxPlayers >= filters.minPlayers!)
    }

    if (filters.maxPlayTime !== null) {
      result = result.filter((g) => g.minPlayTime <= filters.maxPlayTime!)
    }

    return sortGames(result, filters.sortField, filters.sortDirection)
  }, [games, filters])

  return (
    <div>
      <FilterBar filters={filters} onChange={setFilters} gameCount={filtered.length} />

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">No games match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  )
}
