'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CommunityGame } from '@/lib/types'
import GameRow from './GameRow'

export default function SessionBuilder({
  members,
  games,
}: {
  members: string[]
  games: CommunityGame[]
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [toAdd, setToAdd] = useState('')
  const [fitGroup, setFitGroup] = useState(false)

  // "Call session" form
  const [host, setHost] = useState('')
  const [date, setDate] = useState('')
  const [lockedGameId, setLockedGameId] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [createdId, setCreatedId] = useState('')

  const available = members.filter((m) => !selected.includes(m))

  function addPlayer() {
    if (toAdd && !selected.includes(toAdd)) {
      setSelected([...selected, toAdd])
      setToAdd('')
    }
  }

  // Pool = games owned by any selected player; owner pills trimmed to the table
  const pool = useMemo(() => {
    if (selected.length === 0) return []
    const sel = new Set(selected)
    return games
      .filter((g) => g.owners.some((o) => sel.has(o)))
      .filter((g) => (fitGroup ? g.maxPlayers >= selected.length && g.minPlayers <= selected.length : true))
      .map((g) => ({ ...g, owners: g.owners.filter((o) => sel.has(o)) }))
      .sort((a, b) => b.communityRating - a.communityRating)
  }, [games, selected, fitGroup])

  // Host must be one of the players at the table
  const effectiveHost = host && selected.includes(host) ? host : selected[0] ?? ''

  async function callSession() {
    setError('')
    if (!date) {
      setError('Pick a date and time for the session.')
      return
    }
    if (!effectiveHost) {
      setError('Add at least one player to host the session.')
      return
    }

    const locked = pool.find((g) => g.id === lockedGameId)
    setSubmitting(true)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date(date).toISOString(),
          description,
          host: effectiveHost,
          players: selected,
          game: locked ? { id: locked.id, name: locked.name, thumbnail: locked.thumbnail } : null,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Could not create the session.')
      }
      const created = await res.json()
      setCreatedId(created.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="controls">
        <div className="field">
          <label htmlFor="playerpick">I&apos;m playing with</label>
          <div className="playerrow">
            <select id="playerpick" className="select" value={toAdd} onChange={(e) => setToAdd(e.target.value)}>
              <option value="">Choose a player…</option>
              {available.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <button type="button" className="iconbtn" onClick={addPlayer} aria-label="Add player" disabled={!toAdd}>+</button>
          </div>
        </div>

        {selected.length > 0 && (
          <div className="chips">
            {selected.map((m) => (
              <span className="chip" key={m}>
                {m}
                <button type="button" onClick={() => setSelected(selected.filter((x) => x !== m))} aria-label={`Remove ${m}`}>×</button>
              </span>
            ))}
          </div>
        )}

        {selected.length > 0 && (
          <label className="count fitrow">
            <input type="checkbox" checked={fitGroup} onChange={(e) => setFitGroup(e.target.checked)} />
            Only show games that fit {selected.length} player{selected.length === 1 ? '' : 's'}
          </label>
        )}
      </div>

      {selected.length === 0 ? (
        <div className="empty">Add the players at your table to see what you can play tonight.</div>
      ) : (
        <>
          <div className="count pool-count">
            <strong>{pool.length}</strong> game{pool.length === 1 ? '' : 's'} on the table
          </div>

          <div className="glist">
            {pool.map((g) => (
              <GameRow key={g.id} game={g} showOwners />
            ))}
          </div>

          <div className="panel full session-call">
            <h2>Call the session</h2>
            <p>Lock in a time and let the group RSVP on the schedule.</p>

            {createdId ? (
              <div className="notice">
                Session called! See it on the <Link href="/schedule">schedule →</Link>
              </div>
            ) : (
              <div className="form">
                <div className="frow">
                  <div className="fcol">
                    <label className="plabel" htmlFor="when">When</label>
                    <input id="when" type="datetime-local" className="pinput" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                  <div className="fcol">
                    <label className="plabel" htmlFor="host">Called by</label>
                    <select id="host" className="pinput" value={effectiveHost} onChange={(e) => setHost(e.target.value)}>
                      {selected.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="fcol">
                  <label className="plabel" htmlFor="game">Game (optional)</label>
                  <select id="game" className="pinput" value={lockedGameId} onChange={(e) => setLockedGameId(e.target.value)}>
                    <option value="">Decide at the table</option>
                    {pool.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div className="fcol">
                  <label className="plabel" htmlFor="note">Note</label>
                  <textarea
                    id="note"
                    className="textarea"
                    placeholder="e.g. Saturday 7pm at Dedi's place"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <button type="button" className="btn" onClick={callSession} disabled={submitting}>
                    {submitting ? 'Calling…' : 'Call session'}
                  </button>
                  {error && <div className="formerror">{error}</div>}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
