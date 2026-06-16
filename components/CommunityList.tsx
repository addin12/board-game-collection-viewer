'use client'

import { useMemo, useState } from 'react'
import { CommunityGame } from '@/lib/types'
import GameRow from './GameRow'

// Alphabetical ranges mirror the real BBGC /all index
const RANGES: { label: string; test: (c: string) => boolean }[] = [
  { label: '# - B', test: (c) => c < 'C' },
  { label: 'C - E', test: (c) => c >= 'C' && c < 'F' },
  { label: 'F - H', test: (c) => c >= 'F' && c < 'I' },
  { label: 'I - J', test: (c) => c >= 'I' && c < 'K' },
  { label: 'K - M', test: (c) => c >= 'K' && c < 'N' },
  { label: 'N - P', test: (c) => c >= 'N' && c < 'Q' },
  { label: 'Q - S', test: (c) => c >= 'Q' && c < 'T' },
  { label: 'T - V', test: (c) => c >= 'T' && c < 'W' },
  { label: 'W - Z', test: (c) => c >= 'W' },
]

export default function CommunityList({
  games,
  showOwners = false,
}: {
  games: CommunityGame[]
  showOwners?: boolean
}) {
  const [query, setQuery] = useState('')
  const [range, setRange] = useState<string | null>(null)
  const [category, setCategory] = useState('')
  const [member, setMember] = useState('')

  const categories = useMemo(() => {
    const set = new Set<string>()
    games.forEach((g) => g.categories.forEach((c) => set.add(c)))
    return Array.from(set).sort()
  }, [games])

  const members = useMemo(() => {
    const set = new Set<string>()
    games.forEach((g) => g.owners.forEach((o) => set.add(o)))
    return Array.from(set).sort()
  }, [games])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const r = RANGES.find((x) => x.label === range)
    return games
      .filter((g) => (q ? g.name.toLowerCase().includes(q) : true))
      .filter((g) => (r ? r.test(g.name[0]?.toUpperCase() || '#') : true))
      .filter((g) => (category ? g.categories.includes(category) : true))
      .filter((g) => (member ? g.owners.includes(member) : true))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [games, query, range, category, member])

  return (
    <div>
      <div className="controls">
        <div className="row">
          <input
            className="input grow-input"
            placeholder="Search games…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {members.length > 0 && (
            <select className="select" aria-label="Filter by member" value={member} onChange={(e) => setMember(e.target.value)}>
              <option value="">All members</option>
              {members.map((m) => (
                <option key={m} value={m}>{m}&apos;s games</option>
              ))}
            </select>
          )}
          {categories.length > 0 && (
            <select className="select" aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>
        <div className="alpha">
          <button type="button" aria-pressed={range === null} onClick={() => setRange(null)}>All</button>
          {RANGES.map((r) => (
            <button type="button" key={r.label} aria-pressed={range === r.label} onClick={() => setRange(range === r.label ? null : r.label)}>
              {r.label}
            </button>
          ))}
        </div>
        <div className="count">
          Showing <strong>{filtered.length}</strong> of {games.length} games
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">No games match your filters.</div>
      ) : (
        <div className="glist">
          {filtered.map((g) => (
            <GameRow key={g.id} game={g} showOwners={showOwners} />
          ))}
        </div>
      )}
    </div>
  )
}
