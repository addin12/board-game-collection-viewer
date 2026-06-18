import Image from 'next/image'
import Link from 'next/link'
import { CommunityGame } from '@/lib/types'
import { formatPlayTime, formatPlayerCount } from '@/lib/utils'

function StarIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z" /></svg>
}
function UsersIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 5.5a3 3 0 0 1 0 5.5M21 20c0-2.5-1.5-4.7-3.7-5.6" /></svg>
}
function ClockIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
}
function WeightIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v3M5 6h14l-3 7a4 4 0 0 1-8 0L5 6zM8 21h8M12 17v4" /></svg>
}

export default function GameRow({ game, showOwners = false }: { game: CommunityGame; showOwners?: boolean }) {
  return (
    <div className="grow">
      <div className="gpic">
        {/* Use the pre-sized 300x320 thumbnail — crisp at 64px but small enough
            that Next's optimizer never times out (full originals can be multi-MB).
            CSV-imported games may have no image yet → show a letter placeholder. */}
        {game.thumbnail || game.image ? (
          <Image src={game.thumbnail || game.image} alt={game.name} fill sizes="64px" />
        ) : (
          <span className="gpic-ph" aria-hidden="true">{game.name.charAt(0)}</span>
        )}
      </div>

      <div className="gmain">
        <a className="gname" href={`https://boardgamegeek.com/boardgame/${game.id}`} target="_blank" rel="noopener noreferrer">
          {game.name}
        </a>{' '}
        {game.yearPublished && <span className="gyear">({game.yearPublished})</span>}
        <div className="pills">
          {game.categories.slice(0, 3).map((c) => (
            <span className="pill" key={c}>{c}</span>
          ))}
          {showOwners && game.owners.map((o) => (
            <Link className="opill" href={`/members/${encodeURIComponent(o)}`} key={o}>{o}</Link>
          ))}
        </div>
      </div>

      <div className="gstats">
        {game.communityRating > 0 && (
          <span className="stat rating"><StarIcon />{game.communityRating.toFixed(1)}</span>
        )}
        <span className="stat"><UsersIcon />{formatPlayerCount(game.minPlayers, game.maxPlayers)}</span>
        <span className="stat"><ClockIcon />{formatPlayTime(game.minPlayTime, game.maxPlayTime)}</span>
        {typeof game.weight === 'number' && game.weight > 0 && (
          <span className="stat" title="Complexity (1 light – 5 heavy)"><WeightIcon />{game.weight.toFixed(1)}</span>
        )}
      </div>
    </div>
  )
}
