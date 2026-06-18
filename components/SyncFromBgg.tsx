'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CommunityGame } from '@/lib/types'
import CommunityList from './CommunityList'

export default function SyncFromBgg() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [saveAs, setSaveAs] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ member: string; count: number; games: CommunityGame[] } | null>(null)

  async function sync() {
    const u = username.trim()
    if (!u) return
    setBusy(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, member: saveAs.trim() || u }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Could not sync that collection.')
      const games: CommunityGame[] = (body.games ?? []).map((g: CommunityGame) => ({
        ...g,
        categories: [],
        owners: [body.member],
      }))
      setResult({ member: body.member, count: body.count, games })
      // Re-pull the server-rendered community so Browse all / member filter /
      // Plan a session immediately include the newly-synced member.
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sync that collection.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="panel full">
        <h2>Sync your collection from BGG</h2>
        <p>
          Enter your BoardGameGeek username and we&apos;ll pull your collection <strong>live</strong> — cover art and all —
          and add it to the club library. It shows up in <strong>Browse all</strong> and <strong>Plan a session</strong>.
        </p>
        <div className="syncrow">
          <input
            type="text"
            className="pinput"
            placeholder="BGG username (e.g. Deedeen)"
            aria-label="BoardGameGeek username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sync() }}
          />
          <input
            type="text"
            className="pinput"
            placeholder="Save as… (optional)"
            aria-label="Save as member name"
            value={saveAs}
            onChange={(e) => setSaveAs(e.target.value)}
            maxLength={40}
            onKeyDown={(e) => { if (e.key === 'Enter') sync() }}
          />
          <button type="button" className="btn" onClick={sync} disabled={busy || !username.trim()}>
            {busy ? 'Syncing…' : 'Sync collection'}
          </button>
        </div>
        {busy && <p className="importstatus">Pulling from BoardGameGeek… (large collections can take a few seconds)</p>}
        {error && <p className="formerror">{error}</p>}
        {result && (
          <div className="notice">
            Synced! <strong>{result.member}</strong>&apos;s {result.count} games are now in the community.{' '}
            <Link href="/collection">Browse the collection →</Link>
          </div>
        )}
      </div>

      {result && result.games.length > 0 && <CommunityList games={result.games} />}
    </div>
  )
}
