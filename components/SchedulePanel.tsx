'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { GameSession, RsvpStatus } from '@/lib/sessions'

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

export default function SchedulePanel({ members }: { members: string[] }) {
  const [sessions, setSessions] = useState<GameSession[]>([])
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState('')
  const [busy, setBusy] = useState('')
  const [editingId, setEditingId] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editNote, setEditNote] = useState('')

  // Read the latest editingId inside the polling closure without re-subscribing
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
  }

  async function saveEdit(id: string) {
    if (!editDate) return
    setBusy(id)
    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: new Date(editDate).toISOString(), description: editNote }),
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
                  <div className="sgame">
                    {s.game && <Image src={s.game.thumbnail} alt={s.game.name} width={40} height={40} />}
                    {s.game ? s.game.name : 'Game TBD'}
                  </div>
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
