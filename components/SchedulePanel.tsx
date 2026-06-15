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
  const [editGames, setEditGames] = useState<GameRef[]>([])
  const [gameQuery, setGameQuery] = useState('')

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
    setEditGames(s.games)
    setGameQuery('')
  }

  function addEditGame() {
    const g = games.find((x) => x.name.toLowerCase() === gameQuery.trim().toLowerCase())
    if (g && !editGames.some((eg) => eg.id === g.id)) {
      setEditGames([...editGames, { id: g.id, name: g.name, thumbnail: g.thumbnail }])
      setGameQuery('')
    }
  }

  async function saveEdit(id: string) {
    if (!editDate) return
    setBusy(id)
    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: new Date(editDate).toISOString(), description: editNote, games: editGames }),
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
          No upcoming sessions yet. <Link className="backlink" href="/session">Call one →</Link>
        </div>
      ) : (
        <div className="sessions">
          {sessions.map((s) => {
            const when = fmt(s.date)
            const ins = Object.entries(s.rsvps).filter(([, v]) => v === 'in').map(([n]) => n)
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

                  {s.description && <p className="sdesc">{s.description}</p>}
                  <div className="smeta">
                    Called by <strong>{s.host}</strong>
                    {s.players.length > 0 && <> · table of {s.players.length}</>}
                    {' · '}{ins.length} going
                    {pendingPlayers.length > 0 && <> · {pendingPlayers.length} pending</>}
                  </div>

                  <div className="attend">
                    {ins.map((n) => <span className="apill" key={n}>{n}</span>)}
                    {pendingPlayers.map((n) => <span className="apill pending" key={n}>{n}?</span>)}
                    {outs.map((n) => <span className="apill out" key={n}>{n}</span>)}
                  </div>

                  {editing ? (
                    <div className="editform">
                      <input
                        type="datetime-local"
                        className="pinput"
                        aria-label="New date and time"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                      />
                      <textarea
                        className="textarea"
                        aria-label="Note"
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                      />
                      <div>
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
                          <input
                            className="pinput"
                            list="allgames"
                            placeholder="Add a game…"
                            aria-label="Add a game"
                            value={gameQuery}
                            onChange={(e) => setGameQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEditGame() } }}
                          />
                          <button type="button" className="iconbtn" onClick={addEditGame} aria-label="Add game" disabled={!gameQuery}>+</button>
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
                        <button
                          type="button"
                          className="minibtn in"
                          disabled={!me || busy === s.id || myStatus === 'in'}
                          onClick={() => rsvp(s.id, 'in')}
                        >
                          I&apos;m in
                        </button>
                        <button
                          type="button"
                          className="minibtn out"
                          disabled={!me || busy === s.id || myStatus === 'out'}
                          onClick={() => rsvp(s.id, 'out')}
                        >
                          Can&apos;t make it
                        </button>
                        {!me && <span className="smeta">Pick your name above to RSVP</span>}
                      </div>

                      {isHost && (
                        <div className="hostactions">
                          <button type="button" className="linkbtn" onClick={() => startEdit(s)}>Edit</button>
                          <button type="button" className="linkbtn danger" disabled={busy === s.id} onClick={() => cancelSession(s.id)}>
                            Cancel session
                          </button>
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
    </div>
  )
}
