'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { GameSession, RsvpStatus, GameRef } from '@/lib/sessions'
import { CommunityGame } from '@/lib/types'

function fmt(iso: string) {
  const d = new Date(iso)
  return {
    day: d.getDate(),
    mon: d.toLocaleString('en-US', { month: 'short' }),
    time: d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' }),
  }
}

function localInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

// Build a Google Calendar "add event" link (a click — no automated sending).
function gcalUrl(s: GameSession): string {
  const start = new Date(s.date)
  const end = new Date(start.getTime() + 3 * 3600 * 1000)
  const z = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const title = 'BBGC: ' + (s.games.length ? s.games.map((g) => g.name).join(', ') : 'Game night')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${z(start)}/${z(end)}`,
    details: s.description || '',
    location: s.location || '',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export default function SchedulePanel({
  members,
  games,
}: {
  members: string[]
  games: CommunityGame[]
}) {
  const [sessions, setSessions] = useState<GameSession[]>([])
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState('')
  const [busy, setBusy] = useState('')
  const [editingId, setEditingId] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editNote, setEditNote] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editGames, setEditGames] = useState<GameRef[]>([])
  const [editPlayers, setEditPlayers] = useState<string[]>([])
  const [gameQuery, setGameQuery] = useState('')
  const [playerToAdd, setPlayerToAdd] = useState('')
  const [past, setPast] = useState<GameSession[] | null>(null)
  const [pastLoading, setPastLoading] = useState(false)

  const editingRef = useRef('')
  useEffect(() => { editingRef.current = editingId }, [editingId])

  // Initial load + live polling every 15s (paused while editing so we don't clobber the form)
  useEffect(() => {
    let active = true
    fetch('/api/sessions')
      .then((r) => r.json())
      .then((data) => { if (active) setSessions(Array.isArray(data) ? data : []) })
      .catch(() => { if (active) setSessions([]) })
      .finally(() => {
        if (active) {
          setLoading(false)
          setMe(localStorage.getItem('bbgc-me') || '')
        }
      })

    const poll = setInterval(() => {
      if (editingRef.current) return
      fetch('/api/sessions')
        .then((r) => r.json())
        .then((data) => { if (active && !editingRef.current) setSessions(Array.isArray(data) ? data : []) })
        .catch(() => {})
    }, 15000)

    return () => { active = false; clearInterval(poll) }
  }, [])

  function chooseMe(name: string) {
    setMe(name)
    localStorage.setItem('bbgc-me', name)
  }

  async function rsvp(id: string, status: RsvpStatus | 'clear') {
    if (!me) return
    setBusy(id)
    try {
      const res = await fetch(`/api/sessions/${id}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: me, status }),
      })
      if (res.ok) {
        const updated: GameSession = await res.json()
        setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)))
      }
    } finally {
      setBusy('')
    }
  }

  async function cancelSession(id: string) {
    if (!window.confirm('Cancel this session? It will be removed for everyone.')) return
    setBusy(id)
    try {
      const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
      if (res.ok) setSessions((prev) => prev.filter((s) => s.id !== id))
    } finally {
      setBusy('')
    }
  }

  function startEdit(s: GameSession) {
    setEditingId(s.id)
    setEditDate(localInput(new Date(s.date)))
    setEditNote(s.description)
    setEditLocation(s.location)
    setEditGames(s.games)
    setEditPlayers(s.players)
    setGameQuery('')
    setPlayerToAdd('')
  }

  function addEditGame() {
    const g = games.find((x) => x.name.toLowerCase() === gameQuery.trim().toLowerCase())
    if (g && !editGames.some((eg) => eg.id === g.id)) {
      setEditGames([...editGames, { id: g.id, name: g.name, thumbnail: g.thumbnail }])
      setGameQuery('')
    }
  }

  function addEditPlayer() {
    if (playerToAdd && !editPlayers.includes(playerToAdd)) {
      setEditPlayers([...editPlayers, playerToAdd])
      setPlayerToAdd('')
    }
  }

  async function loadPast() {
    setPastLoading(true)
    try {
      const res = await fetch('/api/sessions?scope=past')
      const data = await res.json()
      setPast(Array.isArray(data) ? data : [])
    } catch {
      setPast([])
    } finally {
      setPastLoading(false)
    }
  }

  async function saveEdit(id: string) {
    if (!editDate) return
    setBusy(id)
    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date(editDate).toISOString(),
          description: editNote,
          location: editLocation,
          players: editPlayers,
          games: editGames,
        }),
      })
      if (res.ok) {
        const updated: GameSession = await res.json()
        setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)))
        setEditingId('')
      }
    } finally {
      setBusy('')
    }
  }

  return (
    <div>
      <datalist id="allgames">
        {games.map((g) => <option key={g.id} value={g.name} />)}
      </datalist>

      <div className="controls">
        <div className="field">
          <label htmlFor="me">You are</label>
          <select id="me" className="select" value={me} onChange={(e) => chooseMe(e.target.value)}>
            <option value="">Pick your name to RSVP…</option>
            {members.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="empty">Loading sessions…</div>
      ) : sessions.length === 0 ? (
        <div className="empty">
          No upcoming sessions yet. <Link className="backlink" href="/collection?tab=session">Call one →</Link>
        </div>
      ) : (
        <div className="sessions">
          {sessions.map((s) => {
            const when = fmt(s.date)
            const ins = Object.entries(s.rsvps).filter(([, v]) => v === 'in').map(([n]) => n)
            const maybes = Object.entries(s.rsvps).filter(([, v]) => v === 'maybe').map(([n]) => n)
            const outs = Object.entries(s.rsvps).filter(([, v]) => v === 'out').map(([n]) => n)
            const responded = new Set(Object.keys(s.rsvps))
            const pendingPlayers = s.players.filter((p) => !responded.has(p))
            const myStatus = me ? s.rsvps[me] : undefined
            const isHost = !!me && me === s.host
            const editing = editingId === s.id

            return (
              <div className="scard" key={s.id}>
                <div className="when">
                  <div className="d">{when.day}</div>
                  <div className="m">{when.mon}</div>
                  <div className="t">{when.time}</div>
                </div>
                <div className="sbody">
                  {s.games.length > 0 ? (
                    <div className="sgames">
                      {s.games.map((g) => (
                        <span className="sgchip" key={g.id}>
                          {g.thumbnail && <Image src={g.thumbnail} alt={g.name} width={26} height={26} />}
                          {g.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="sgame">Games TBD</div>
                  )}

                  {s.location && <p className="sloc">📍 {s.location}</p>}
                  {s.description && <p className="sdesc">{s.description}</p>}
                  <div className="smeta">
                    Called by <strong>{s.host}</strong>
                    {s.players.length > 0 && <> · table of {s.players.length}</>}
                    {' · '}{ins.length} going
                    {maybes.length > 0 && <> · {maybes.length} maybe</>}
                    {pendingPlayers.length > 0 && <> · {pendingPlayers.length} pending</>}
                    {' · '}<a className="callink" href={gcalUrl(s)} target="_blank" rel="noopener noreferrer">add to calendar</a>
                  </div>

                  <div className="attend">
                    {ins.map((n) => <span className="apill" key={n}>{n}</span>)}
                    {maybes.map((n) => <span className="apill maybe" key={n}>{n}?</span>)}
                    {pendingPlayers.map((n) => <span className="apill pending" key={n}>{n}</span>)}
                    {outs.map((n) => <span className="apill out" key={n}>{n}</span>)}
                  </div>

                  {editing ? (
                    <div className="editform">
                      <input type="datetime-local" className="pinput" aria-label="New date and time" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                      <input type="text" className="pinput" aria-label="Location" placeholder="Where… (optional)" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
                      <textarea className="textarea" aria-label="Note" value={editNote} onChange={(e) => setEditNote(e.target.value)} />

                      <div>
                        <label className="plabel">Games</label>
                        {editGames.length > 0 && (
                          <div className="gchips">
                            {editGames.map((g) => (
                              <span className="gchip" key={g.id}>
                                {g.name}
                                <button type="button" onClick={() => setEditGames(editGames.filter((x) => x.id !== g.id))} aria-label={`Remove ${g.name}`}>×</button>
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="playerrow">
                          <input className="pinput" list="allgames" placeholder="Add a game…" aria-label="Add a game" value={gameQuery}
                            onChange={(e) => setGameQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEditGame() } }} />
                          <button type="button" className="iconbtn" onClick={addEditGame} aria-label="Add game" disabled={!gameQuery}>+</button>
                        </div>
                      </div>

                      <div>
                        <label className="plabel">Players</label>
                        {editPlayers.length > 0 && (
                          <div className="gchips">
                            {editPlayers.map((pl) => (
                              <span className="gchip" key={pl}>
                                {pl}
                                <button type="button" onClick={() => setEditPlayers(editPlayers.filter((x) => x !== pl))} aria-label={`Remove ${pl}`}>×</button>
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="playerrow">
                          <select className="pinput" aria-label="Add a player" value={playerToAdd} onChange={(e) => setPlayerToAdd(e.target.value)}>
                            <option value="">Add a player…</option>
                            {members.filter((m) => !editPlayers.includes(m)).map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          <button type="button" className="iconbtn" onClick={addEditPlayer} aria-label="Add player" disabled={!playerToAdd}>+</button>
                        </div>
                      </div>

                      <div className="rsvp">
                        <button type="button" className="minibtn in" disabled={busy === s.id} onClick={() => saveEdit(s.id)}>Save</button>
                        <button type="button" className="minibtn out" onClick={() => setEditingId('')}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="rsvp">
                        <button type="button" className="minibtn in" disabled={!me || busy === s.id || myStatus === 'in'} onClick={() => rsvp(s.id, 'in')}>I&apos;m in</button>
                        <button type="button" className="minibtn maybe" disabled={!me || busy === s.id || myStatus === 'maybe'} onClick={() => rsvp(s.id, 'maybe')}>Maybe</button>
                        <button type="button" className="minibtn out" disabled={!me || busy === s.id || myStatus === 'out'} onClick={() => rsvp(s.id, 'out')}>Can&apos;t make it</button>
                        {!me && <span className="smeta">Pick your name above to RSVP</span>}
                      </div>

                      {isHost && (
                        <div className="hostactions">
                          <button type="button" className="linkbtn" onClick={() => startEdit(s)}>Edit</button>
                          <button type="button" className="linkbtn danger" disabled={busy === s.id} onClick={() => cancelSession(s.id)}>Cancel session</button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="pastwrap">
        {past === null ? (
          <button type="button" className="linkbtn" onClick={loadPast} disabled={pastLoading}>
            {pastLoading ? 'Loading…' : '▾ Show past sessions'}
          </button>
        ) : past.length === 0 ? (
          <div className="empty">No past sessions yet.</div>
        ) : (
          <>
            <h2 className="sectionhead">Past sessions</h2>
            <div className="sessions">
              {past.map((s) => {
                const when = fmt(s.date)
                const ins = Object.entries(s.rsvps).filter(([, v]) => v === 'in').map(([n]) => n)
                const maybes = Object.entries(s.rsvps).filter(([, v]) => v === 'maybe').map(([n]) => n)
                return (
                  <div className="scard past" key={s.id}>
                    <div className="when">
                      <div className="d">{when.day}</div>
                      <div className="m">{when.mon}</div>
                    </div>
                    <div className="sbody">
                      {s.games.length > 0 ? (
                        <div className="sgames">
                          {s.games.map((g) => (
                            <span className="sgchip" key={g.id}>
                              {g.thumbnail && <Image src={g.thumbnail} alt={g.name} width={26} height={26} />}
                              {g.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="sgame">Games TBD</div>
                      )}
                      {s.location && <p className="sloc">📍 {s.location}</p>}
                      {s.description && <p className="sdesc">{s.description}</p>}
                      <div className="smeta">Called by <strong>{s.host}</strong> · {ins.length} played</div>
                      <div className="attend">
                        {ins.map((n) => <span className="apill" key={n}>{n}</span>)}
                        {maybes.map((n) => <span className="apill maybe" key={n}>{n}?</span>)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
