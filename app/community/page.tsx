import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import GameRow from '@/components/GameRow'
import { getCommunity } from '@/lib/community-data'
import { getPlayStats } from '@/lib/sessions'

export const metadata = {
  title: 'Community Stats',
}

// Reads live data (member collections + play stats) — always render on request.
export const dynamic = 'force-dynamic'

function monthLabel(m: string): string {
  const [y, mo] = m.split('-').map(Number)
  return new Date(y, mo - 1, 1).toLocaleString('en-US', { month: 'short', year: 'numeric' })
}

export default async function CommunityStatsPage() {
  const { games: COMMUNITY_GAMES, members: MEMBERS } = await getCommunity()
  const { mostPlayed, byMonth, totalPlays } = await getPlayStats()

  const totalGames = COMMUNITY_GAMES.length
  const rated = COMMUNITY_GAMES.filter((g) => g.communityRating > 0)
  const avgRating = rated.length ? (rated.reduce((s, g) => s + g.communityRating, 0) / rated.length).toFixed(1) : '—'
  const categories = new Set(COMMUNITY_GAMES.flatMap((g) => g.categories)).size

  const weighted = COMMUNITY_GAMES.filter((g) => typeof g.weight === 'number' && (g.weight as number) > 0)
  const avgWeight = weighted.length ? (weighted.reduce((s, g) => s + (g.weight || 0), 0) / weighted.length).toFixed(1) : '—'

  const topPlay = mostPlayed[0]?.count || 1
  const busiest = [...byMonth].sort((a, b) => b.count - a.count)[0]

  // Biggest collectors — members ranked by how many games they own
  const collectors = MEMBERS.map((m) => ({
    name: m,
    count: COMMUNITY_GAMES.filter((g) => g.owners.includes(m)).length,
  })).sort((a, b) => b.count - a.count)
  const topCount = collectors[0]?.count || 1

  // Most-owned games (more than one owner), and one-of-a-kind games (a single owner)
  const mostOwned = COMMUNITY_GAMES.filter((g) => g.owners.length > 1)
    .sort((a, b) => b.owners.length - a.owners.length)
    .slice(0, 8)
  const rare = COMMUNITY_GAMES.filter((g) => g.owners.length === 1).sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="wrap">
      <PageHeader />

      <main id="main">
      <header className="hero">
        <div className="eyebrow">Community Stats</div>
        <h1>By the numbers</h1>
        <p>What the Barudak Board Game Club shelf looks like, all together.</p>
        <div className="rule"></div>
      </header>

      <div className="statgrid">
        <div className="statcard"><div className="k">Games</div><div className="v">{totalGames}</div></div>
        <div className="statcard"><div className="k">Members</div><div className="v">{MEMBERS.length}</div></div>
        <div className="statcard"><div className="k">Avg Rating</div><div className="v gold">{avgRating}{avgRating !== '—' && '★'}</div></div>
        <div className="statcard"><div className="k">Avg Complexity</div><div className="v">{avgWeight}</div></div>
        <div className="statcard"><div className="k">Categories</div><div className="v">{categories}</div></div>
      </div>

      <h2 className="sectionhead">Biggest collectors</h2>
      <div className="panel full">
        <div className="rank">
          {collectors.map((c, i) => (
            <div className="rankrow" key={c.name}>
              <span className="rnum">{i + 1}</span>
              <Link className="rname" href={`/members/${encodeURIComponent(c.name)}`}>{c.name}</Link>
              <progress className="rbar" value={c.count} max={topCount} />
              <span className="rcount">{c.count}</span>
            </div>
          ))}
        </div>
      </div>

      <h2 className="sectionhead">Most played</h2>
      {totalPlays > 0 ? (
        <>
          <p className="sectionsub">
            From {totalPlays} game night{totalPlays === 1 ? '' : 's'} marked as played
            {busiest && <> · busiest month: <strong>{monthLabel(busiest.month)}</strong> ({busiest.count})</>}.
          </p>
          <div className="panel full">
            <div className="rank">
              {mostPlayed.slice(0, 10).map((g, i) => (
                <div className="rankrow" key={g.id}>
                  <span className="rnum">{i + 1}</span>
                  <a className="rname playname" href={`https://boardgamegeek.com/boardgame/${g.id}`} target="_blank" rel="noopener noreferrer">{g.name}</a>
                  <progress className="rbar" value={g.count} max={topPlay} />
                  <span className="rcount">{g.count}×</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="sectionsub">
          No plays logged yet — mark a session as <strong>played</strong> on the <Link href="/schedule">Schedule</Link> and the club&apos;s most-played games will show up here.
        </p>
      )}

      <h2 className="sectionhead">Most-owned games</h2>
      <p className="sectionsub">Crowd favourites — owned by more than one member.</p>
      {mostOwned.length > 0 ? (
        <div className="glist">
          {mostOwned.map((g) => <GameRow key={g.id} game={g} showOwners />)}
        </div>
      ) : (
        <div className="empty">No game is owned by more than one member yet.</div>
      )}

      <h2 className="sectionhead">One of a kind</h2>
      <p className="sectionsub">{rare.length} games only one person in the club owns.</p>
      <div className="glist">
        {rare.slice(0, 12).map((g) => <GameRow key={g.id} game={g} showOwners />)}
      </div>
      </main>
    </div>
  )
}
