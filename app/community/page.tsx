import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import GameRow from '@/components/GameRow'
import { getCommunity } from '@/lib/community-data'

export const metadata = {
  title: 'Community Stats',
}

export default async function CommunityStatsPage() {
  const { games: COMMUNITY_GAMES, members: MEMBERS } = await getCommunity()

  const totalGames = COMMUNITY_GAMES.length
  const rated = COMMUNITY_GAMES.filter((g) => g.communityRating > 0)
  const avgRating = rated.length ? (rated.reduce((s, g) => s + g.communityRating, 0) / rated.length).toFixed(1) : '—'
  const categories = new Set(COMMUNITY_GAMES.flatMap((g) => g.categories)).size

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
