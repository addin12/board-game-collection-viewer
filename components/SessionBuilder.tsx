'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CommunityGame } from '@/lib/types'
import type { GameRef } from '@/lib/sessions'
import GameRow from './GameRow'

// Format a Date as a local `YYYY-MM-DDTHH:MM` string for <input type=datetime-local>
function localInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}
// A sensible default: next 7pm (today, or tomorrow if it's already past 7pm)
function defaultWhen(now: Date): string {
  const d = new Date(now)
  if (d.getHours() >= 19) d.setDate(d.getDate() + 1)
  d.setHours(19, 0, 0, 0)
  return localInput(d)
}

const TIME_OPTIONS = [30, 45, 60, 90, 120, 180]

type Mode = 'players' | 'games'

export default function SessionBuilder({
  members,
  games,
}: {
  members: string[]
  games: CommunityGame[]
}) {
  const [mode, setMode] = useState<Mode>('players')

  // --- players-first state ---
  const [selected, setSelected] = useState<string[]>([])
  const [toAdd, setToAdd] = useState('')
  const [fitGroup, setFitGroup] = useState(false)
  const [maxTime, setMaxTime] = useState<number | null>(null)

  // --- games-first state ---
  const [gPicked, setGPicked] = useState<string[]>([])
  const [gameSel, setGameSel] = useState('')
  const [gInvited, setGInvited] = useState<string[]>([])
  const [inviteSel, setInviteSel] = useState('')
  const [gHost, setGHost] = useState('')

  // --- shared "call session" form ---
  const [host, setHost] = useState('')
  const [date, setDate] = useState('')
  const [minDate, setMinDate] = useState('')
  const [gameToAdd, setGameToAdd] = useState('')
  const [lockedGames, setLockedGames] = useState<GameRef[]>([])
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [createdId, setCreatedId] = useState('')

  // Client-only defaults (avoids SSR hydration mismatch on time-dependent values)
  useEffect(() => {
    Promise.resolve().then(() => {
      const now = new Date()
      setMinDate(localInput(now))
      setDate(defaultWhen(now))
    })
  }, [])

  const available = members.filter((m) => !selected.includes(m))

  function switchMode(next: Mode) {
    setMode(next)
    setError('')
    setCreatedId('')
  }

  function addPlayer() {
    if (toAdd && !selected.includes(toAdd)) {
      setSelected([...selected, toAdd])
      setToAdd('')
    }
  }

  function addGame() {
    const g = pool.find((x) => x.id === gameToAdd)
    if (g && !lockedGames.some((lg) => lg.id === g.id)) {
      setLockedGames([...lockedGames, { id: g.id, name: g.name, thumbnail: g.thumbnail }])
      setGameToAdd('')
    }
  }

  // Pool = games owned by any selected player; owner pills trimmed to the table.
  // Plain computation — the React Compiler memoizes this automatically.
  const sel = new Set(selected)
  const pool =
    selected.length === 0
      ? []
      : games
          .filter((g) => g.owners.some((o) => sel.has(o)))
          .filter((g) => (fitGroup ? g.maxPlayers >= selected.length && g.minPlayers <= selected.length : true))
          .filter((g) => (maxTime ? !g.maxPlayTime || g.maxPlayTime <= maxTime : true))
          .map((g) => ({ ...g, owners: g.owners.filter((o) => sel.has(o)) }))
          .sort((a, b) => b.communityRating - a.communityRating)

  // Host must be one of the players at the table (players-first mode)
  const effectiveHost = host && selected.includes(host) ? host : selected[0] ?? ''

  // --- games-first derived values ---
  const pickedObjs = games.filter((g) => gPicked.includes(g.id))
  const recMin = pickedObjs.length ? Math.min(...pickedObjs.map((g) => g.minPlayers || 1)) : 0
  const recMax = pickedObjs.length ? Math.max(...pickedObjs.map((g) => g.maxPlayers || 1)) : 0
  const gamesForPicker = games.filter((g) => !gPicked.includes(g.id)).sort((a, b) => a.name.localeCompare(b.name))

  function addPickedGame() {
    if (gameSel && !gPicked.includes(gameSel)) {
      setGPicked([...gPicked, gameSel])
      setGameSel('')
    }
  }
  function addInvitee() {
    if (inviteSel && inviteSel !== gHost && !gInvited.includes(inviteSel)) {
      setGInvited([...gInvited, inviteSel])
      setInviteSel('')
    }
  }

  async function submit(payloadGames: GameRef[], payloadPlayers: string[], payloadHost: string) {
    setError('')
    if (!date) {
      setError('Pick a date and time for the session.')
      return
    }
    // datetime-local strings sort chronologically; minDate is "now" (set at mount).
    if (minDate && date < minDate) {
      setError('Pick a date and time in the future.')
      return
    }
    if (!payloadHost) {
      setError('Choose who is calling the session.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date(date).toISOString(),
          description,
          location,
          host: payloadHost,
          players: payloadPlayers,
          games: payloadGames,
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

  function callPlayersSession() {
    submit(lockedGames, selected, effectiveHost)
  }
  function callGamesSession() {
    const refs: GameRef[] = pickedObjs.map((g) => ({ id: g.id, name: g.name, thumbnail: g.thumbnail }))
    const players = Array.from(new Set([gHost, ...gInvited].filter(Boolean)))
    submit(refs, players, gHost)
  }

  const successNotice = (
    <div className="notice">
      Session called! See it on the <Link href="/schedule">schedule →</Link>
    </div>
  )

  return (
    <div>
      <div className="segmented" role="group" aria-label="How to plan the session">
        <button type="button" className={mode === 'players' ? 'seg is-active' : 'seg'} onClick={() => switchMode('players')}>
          Who&apos;s playing?
        </button>
        <button type="button" className={mode === 'games' ? 'seg is-active' : 'seg'} onClick={() => switchMode('games')}>
          Pick the game(s)
        </button>
      </div>
      <p className="segsub">
        {mode === 'players'
          ? 'Add who’s at the table and see what you can play tonight.'
          : 'Choose the game(s) you want to get going, then invite a few — and the club can jump in.'}
      </p>

      {mode === 'players' ? (
        <>
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

            {selected.length > 0 && (
              <label className="count fitrow">
                We&apos;ve got
                <select
                  className="select"
                  aria-label="Time available"
                  value={maxTime ?? ''}
                  onChange={(e) => setMaxTime(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">any amount of time</option>
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>~{t < 60 ? `${t} min` : `${t / 60} hr`}</option>
                  ))}
                </select>
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
                  successNotice
                ) : (
                  <div className="form">
                    <div className="frow">
                      <div className="fcol">
                        <label className="plabel" htmlFor="when">When</label>
                        <input id="when" type="datetime-local" className="pinput" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} />
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
                      <label className="plabel" htmlFor="where">Where (optional)</label>
                      <input id="where" type="text" className="pinput" placeholder="e.g. Dedi's place" value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>

                    <div className="fcol">
                      <label className="plabel" htmlFor="game">Games (optional — add as many as you like)</label>
                      <div className="playerrow">
                        <select id="game" className="pinput" value={gameToAdd} onChange={(e) => setGameToAdd(e.target.value)}>
                          <option value="">Add a game…</option>
                          {pool.filter((g) => !lockedGames.some((lg) => lg.id === g.id)).map((g) => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                          ))}
                        </select>
                        <button type="button" className="iconbtn" onClick={addGame} aria-label="Add game" disabled={!gameToAdd}>+</button>
                      </div>
                      {lockedGames.length > 0 && (
                        <div className="gchips">
                          {lockedGames.map((g) => (
                            <span className="gchip" key={g.id}>
                              {g.name}
                              <button type="button" onClick={() => setLockedGames(lockedGames.filter((x) => x.id !== g.id))} aria-label={`Remove ${g.name}`}>×</button>
                            </span>
                          ))}
                        </div>
                      )}
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
                      <button type="button" className="btn" onClick={callPlayersSession} disabled={submitting}>
                        {submitting ? 'Calling…' : 'Call session'}
                      </button>
                      {error && <div className="formerror">{error}</div>}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="controls">
            <div className="field">
              <label htmlFor="gamepick">Game(s) for the night</label>
              <div className="playerrow">
                <select id="gamepick" className="select" value={gameSel} onChange={(e) => setGameSel(e.target.value)}>
                  <option value="">Choose a game…</option>
                  {gamesForPicker.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                <button type="button" className="iconbtn" onClick={addPickedGame} aria-label="Add game" disabled={!gameSel}>+</button>
              </div>
            </div>
          </div>

          {gPicked.length === 0 ? (
            <div className="empty">Pick the game(s) you want to get to the table — then invite a few and let the club join.</div>
          ) : (
            <>
              <div className="count pool-count">
                <strong>{pickedObjs.length}</strong> game{pickedObjs.length === 1 ? '' : 's'} picked
                {recMax > 0 && <> · best with {recMin === recMax ? recMin : `${recMin}–${recMax}`} players</>}
              </div>

              <div className="glist">
                {pickedObjs.map((g) => (
                  <GameRow key={g.id} game={g} showOwners />
                ))}
              </div>

              <div className="panel full session-call">
                <h2>Call the session</h2>
                <p>Invite a few likely players. Anyone in the club can still RSVP — and if your invites all bow out, it opens to everyone.</p>

                {createdId ? (
                  successNotice
                ) : (
                  <div className="form">
                    <div className="frow">
                      <div className="fcol">
                        <label className="plabel" htmlFor="gwhen">When</label>
                        <input id="gwhen" type="datetime-local" className="pinput" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} />
                      </div>
                      <div className="fcol">
                        <label className="plabel" htmlFor="ghost">Called by</label>
                        <select id="ghost" className="pinput" value={gHost} onChange={(e) => setGHost(e.target.value)}>
                          <option value="">Choose…</option>
                          {members.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="fcol">
                      <label className="plabel" htmlFor="ginvite">Invite a few (optional)</label>
                      <div className="playerrow">
                        <select id="ginvite" className="pinput" value={inviteSel} onChange={(e) => setInviteSel(e.target.value)}>
                          <option value="">Add a player…</option>
                          {members.filter((m) => m !== gHost && !gInvited.includes(m)).map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <button type="button" className="iconbtn" onClick={addInvitee} aria-label="Invite player" disabled={!inviteSel}>+</button>
                      </div>
                      {gInvited.length > 0 && (
                        <div className="gchips">
                          {gInvited.map((m) => (
                            <span className="gchip" key={m}>
                              {m}
                              <button type="button" onClick={() => setGInvited(gInvited.filter((x) => x !== m))} aria-label={`Remove ${m}`}>×</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="fcol">
                      <label className="plabel" htmlFor="gwhere">Where (optional)</label>
                      <input id="gwhere" type="text" className="pinput" placeholder="e.g. Dedi's place" value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>

                    <div className="fcol">
                      <label className="plabel" htmlFor="gnote">Note</label>
                      <textarea
                        id="gnote"
                        className="textarea"
                        placeholder="e.g. Looking for 4–6 for a long game on Saturday"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div>
                      <button type="button" className="btn" onClick={callGamesSession} disabled={submitting}>
                        {submitting ? 'Calling…' : 'Call session'}
                      </button>
                      {error && <div className="formerror">{error}</div>}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
