'use client'

import { FilterState, SortField } from '@/lib/types'
import clsx from 'clsx'

interface FilterBarProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  gameCount: number
}

export default function FilterBar({ filters, onChange, gameCount }: FilterBarProps) {
  const playerOptions = Array.from({ length: 8 }, (_, i) => i + 1)
  const playTimeOptions = [30, 60, 90, 120, 180, 300]

  return (
    <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Filters & Sort</h2>
          <p className="text-sm text-slate-400">
            Showing <span className="text-amber-400 font-semibold">{gameCount}</span> game{gameCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-2">Min Players</label>
            <select
              value={filters.minPlayers ?? ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  minPlayers: e.target.value ? parseInt(e.target.value, 10) : null,
                })
              }
              className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="">Any</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-2">Max Play Time</label>
            <select
              value={filters.maxPlayTime ?? ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  maxPlayTime: e.target.value ? parseInt(e.target.value, 10) : null,
                })
              }
              className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="">Any</option>
              {playTimeOptions.map((t) => (
                <option key={t} value={t}>
                  {t} min
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-2">Sort By</label>
            <select
              value={filters.sortField}
              onChange={(e) =>
                onChange({
                  ...filters,
                  sortField: e.target.value as SortField,
                })
              }
              className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="bggRank">BGG Rank</option>
              <option value="name">Name</option>
              <option value="userRating">Your Rating</option>
              <option value="communityRating">Community Rating</option>
              <option value="numPlays">Times Played</option>
              <option value="minPlayTime">Play Time</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-2">Direction</label>
            <select
              value={filters.sortDirection}
              onChange={(e) =>
                onChange({
                  ...filters,
                  sortDirection: e.target.value as 'asc' | 'desc',
                })
              }
              className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <div className="col-span-2 md:col-span-2 flex items-end">
            <button
              onClick={() =>
                onChange({
                  minPlayers: null,
                  maxPlayTime: null,
                  sortField: 'bggRank',
                  sortDirection: 'asc',
                })
              }
              className="w-full bg-amber-600 hover:bg-amber-700 text-amber-50 font-semibold py-2 px-3 rounded text-sm transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
