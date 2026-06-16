'use client'

import { useState } from 'react'
import { CommunityGame } from '@/lib/types'
import CommunityList from './CommunityList'
import SessionBuilder from './SessionBuilder'
import SearchForm from './SearchForm'

type Tab = 'browse' | 'session' | 'bgg'

const TABS: { id: Tab; label: string }[] = [
  { id: 'browse', label: 'Browse all' },
  { id: 'session', label: 'Plan a session' },
  { id: 'bgg', label: 'Add from BGG' },
]

export default function CollectionTabs({
  members,
  games,
  initialTab = 'browse',
}: {
  members: string[]
  games: CommunityGame[]
  initialTab?: Tab
}) {
  const [tab, setTab] = useState<Tab>(initialTab)

  return (
    <div>
      <div className="tabs" role="tablist" aria-label="Collection views">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className="tab"
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'browse' && <CommunityList games={games} showOwners />}
      {tab === 'session' && <SessionBuilder members={members} games={games} />}
      {tab === 'bgg' && (
        <div className="panel">
          <h2>Add a collection from BoardGameGeek</h2>
          <p>Enter a BoardGameGeek username to pull their owned games. Try <strong>Deedeen</strong>.</p>
          <SearchForm buttonLabel="Pull collection" placeholder="BoardGameGeek username…" />
        </div>
      )}
    </div>
  )
}
