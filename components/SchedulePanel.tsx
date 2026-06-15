'use client'

import { useEffect, useState } from 'react'
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

export default function SchedulePanel({ members }: { members: string[] }) {
  const [sessions, setSessions] = useState<GameSession[]>([])
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState('')
  const [pending, setPending] = useState('')

  useEffect(() => {
    let active = true
    fetch('/api/sessions')
      .then((r) => r.json())
      .then((data) => {
        if (active) setSessions(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (active) setSessions([])
      })
      .finally(() => {
        // set in an async callback (not synchronously in the effect body) so we
        // avoid both the set-state-in-effect lint rule and any hydration mismatch
        if (active) {
          setLoading(false)
          setMe(localStorage.getItem('bbgc-me') || '')
        }
      })
    return () => {
      active = false
    }
  }, [])

  function chooseMe(name: string) {
    setMe(name)
    localStorage.setItem('bbgc-me', name)
  }

  async function rsvp(id: string, status: RsvpStatus | 'clear') {
    if (!me) return
    setPending(id)
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
      setPending('')
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
            const myStatus = me ? s.rsvps[me] : undefined
            return (
              <div className="scard" key={s.id}>
                <div className="when">
                  <div className="d">{when.day}</div>
                  <div className="m">{when.mon}</div>
                  <div className="t">{when.time}</div>
                </div>
                <div className="sbody">
                  <div className="sgame">
                    {s.game && (
                      <Image src={s.game.thumbnail} alt={s.game.name} width={40} height={40} />
                    )}
                    {s.game ? s.game.name : 'Game TBD'}
                  </div>
                  {s.description && <p className="sdesc">{s.description}</p>}
                  <div className="smeta">
                    Called by <strong>{s.host}</strong>
                    {s.players.length > 0 && <> · table of {s.players.length}</>}
                    {' · '}{ins.length} going
                  </div>

                  <div className="attend">
                    {ins.map((n) => <span className="apill" key={n}>{n}</span>)}
                    {outs.map((n) => <span className="apill out" key={n}>{n}</span>)}
                  </div>

                  <div className="rsvp">
                    <button
                      type="button"
                      className="minibtn in"
                      disabled={!me || pending === s.id || myStatus === 'in'}
                      onClick={() => rsvp(s.id, 'in')}
                    >
                      I&apos;m in
                    </button>
                    <button
                      type="button"
                      className="minibtn out"
                      disabled={!me || pending === s.id || myStatus === 'out'}
                      onClick={() => rsvp(s.id, 'out')}
                    >
                      Can&apos;t make it
                    </button>
                    {!me && <span className="smeta">Pick your name above to RSVP</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
