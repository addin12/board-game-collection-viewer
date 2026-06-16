'use client'

import { useMemo, useRef, useState } from 'react'
import { CommunityGame } from '@/lib/types'
import GameRow from './GameRow'

// Show the library in comfortable pages instead of one endless scroll.
const PAGE_SIZE = 10

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
  const [page, setPage] = useState(0)
  const listTop = useRef<HTMLDivElement>(null)

  // Any change to the filters should drop you back to the first page,
  // otherwise you can land on an empty/wrong page after narrowing results.
  function resetToFirstPage() {
    setPage(0)
  }
  function goToPage(next: number) {
    setPage(next)
    // Respect users who've asked for less motion — jump instead of animating.
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    listTop.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

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

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1) // clamp if results shrank
  const start = safePage * PAGE_SIZE
  const visible = filtered.slice(start, start + PAGE_SIZE)

  return (
    <div>
      <div className="controls">
        <div className="row">
          <input
            className="input grow-input"
            aria-label="Search games"
            placeholder="Search games…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              resetToFirstPage()
            }}
          />
          {members.length > 0 && (
            <select className="select" aria-label="Filter by member" value={member} onChange={(e) => { setMember(e.target.value); resetToFirstPage() }}>
              <option value="">All members</option>
              {members.map((m) => (
                <option key={m} value={m}>{m}&apos;s games</option>
              ))}
            </select>
          )}
          {categories.length > 0 && (
            <select className="select" aria-label="Filter by category" value={category} onChange={(e) => { setCategory(e.target.value); resetToFirstPage() }}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>
        <div className="alpha">
          <button type="button" className={range === null ? 'is-active' : ''} onClick={() => { setRange(null); resetToFirstPage() }}>All</button>
          {RANGES.map((r) => (
            <button type="button" key={r.label} className={range === r.label ? 'is-active' : ''} onClick={() => { setRange(range === r.label ? null : r.label); resetToFirstPage() }}>
              {r.label}
            </button>
          ))}
        </div>
        <div className="count">
          {filtered.length > 0 ? (
            <>Showing <strong>{start + 1}–{start + visible.length}</strong> of {filtered.length} games</>
          ) : (
            <>Showing <strong>0</strong> of {games.length} games</>
          )}
        </div>
      </div>

      <div ref={listTop} />

      {filtered.length === 0 ? (
        <div className="empty">No games match your filters.</div>
      ) : (
        <>
          <div className="glist">
            {visible.map((g) => (
              <GameRow key={g.id} game={g} showOwners={showOwners} />
            ))}
          </div>

          {pageCount > 1 && (
            <div className="pager">
              <button type="button" className="pgbtn" disabled={safePage === 0} onClick={() => goToPage(safePage - 1)}>
                ← Prev
              </button>
              <span className="pginfo">Page {safePage + 1} of {pageCount}</span>
              <button type="button" className="pgbtn" disabled={safePage >= pageCount - 1} onClick={() => goToPage(safePage + 1)}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
