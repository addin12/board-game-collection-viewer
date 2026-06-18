'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { parseBggCsv } from '@/lib/bgg-csv'
import { CommunityGame } from '@/lib/types'
import CommunityList from './CommunityList'

export default function CsvImport() {
  const router = useRouter()
  const [games, setGames] = useState<CommunityGame[] | null>(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const [member, setMember] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState('')

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setSaved('')
    setStatus('Reading file…')

    let parsed
    try {
      parsed = parseBggCsv(await file.text())
    } catch {
      setStatus('')
      setError('Couldn’t read that file — make sure it’s a BGG collection CSV export.')
      return
    }

    if (parsed.length === 0) {
      setGames([])
      setStatus('')
      return
    }

    const mapped: CommunityGame[] = parsed.map((g) => ({ ...g, categories: [], owners: [] }))
    setGames(mapped)
    setStatus(`Imported ${mapped.length} games — fetching cover art…`)

    // Best-effort image enrichment; the list already works without it.
    try {
      const res = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: parsed.map((g) => g.id) }),
      })
      if (res.ok) {
        const imgs: Record<string, { thumbnail: string; image: string }> = await res.json()
        setGames(mapped.map((g) => (imgs[g.id] ? { ...g, ...imgs[g.id] } : g)))
      }
    } catch {
      /* keep placeholders */
    }
    setStatus(`Imported ${mapped.length} games.`)
  }

  async function save() {
    if (!member.trim() || !games || games.length === 0) return
    setSaving(true)
    setError('')
    setSaved('')
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member: member.trim(), games }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Could not save the collection.')
      setSaved(`Saved! ${body.member}’s ${body.count} games are now in the community collection.`)
      router.refresh() // refresh server data so the new member shows without a manual reload
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the collection.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="panel full">
        <h2>Upload a BGG collection (CSV)</h2>
        <p>
          On BoardGameGeek, open your collection → <strong>Export</strong> → download the CSV, then upload it here.
          Works even while BGG’s API is down.
        </p>
        <input type="file" accept=".csv,text/csv" className="pinput" onChange={onFile} aria-label="BGG collection CSV file" />
        {status && <p className="importstatus">{status}</p>}
        {error && <p className="formerror">{error}</p>}
      </div>

      {games && games.length > 0 && (
        <div className="panel full mt-lg">
          <h2>Save to the community</h2>
          <p>Add this collection to the club library — it will show up in <strong>Browse all</strong> and <strong>Plan a session</strong>. Whose collection is this?</p>
          {saved ? (
            <div className="notice">
              {saved} <Link href="/collection">Browse the collection →</Link>
            </div>
          ) : (
            <div className="search">
              <input
                type="text"
                placeholder="Member name (e.g. Deedeen)"
                aria-label="Member name"
                value={member}
                onChange={(e) => setMember(e.target.value)}
                maxLength={40}
              />
              <button type="button" className="btn" onClick={save} disabled={saving || !member.trim()}>
                {saving ? 'Saving…' : 'Save to community'}
              </button>
            </div>
          )}
        </div>
      )}

      {games !== null &&
        (games.length === 0 ? (
          <div className="empty">No owned games found in that file.</div>
        ) : (
          <CommunityList games={games} />
        ))}
    </div>
  )
}
