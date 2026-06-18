import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import PageHeader from '@/components/PageHeader'
import CommunityList from '@/components/CommunityList'
import { getCommunity } from '@/lib/community-data'

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params
  return { title: `${decodeURIComponent(name)}'s shelf` }
}

export default async function MemberPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const member = decodeURIComponent(name)

  const { games, members } = await getCommunity()
  if (!members.includes(member)) notFound()

  const mine = games.filter((g) => g.owners.includes(member))

  const rated = mine.filter((g) => g.communityRating > 0)
  const avgRating = rated.length ? (rated.reduce((s, g) => s + g.communityRating, 0) / rated.length).toFixed(1) : '—'

  const weighted = mine.filter((g) => typeof g.weight === 'number' && (g.weight as number) > 0)
  const avgWeight = weighted.length ? (weighted.reduce((s, g) => s + (g.weight || 0), 0) / weighted.length).toFixed(1) : '—'

  // Most-collected categories for this member
  const catCount = new Map<string, number>()
  mine.forEach((g) => g.categories.forEach((c) => catCount.set(c, (catCount.get(c) || 0) + 1)))
  const topCats = [...catCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([c]) => c)

  return (
    <div className="wrap">
      <PageHeader />

      <main id="main">
        <header className="hero">
          <div className="eyebrow">Member</div>
          <h1>{member}&apos;s shelf</h1>
          <p>{mine.length} game{mine.length === 1 ? '' : 's'} in the club library.</p>
          <div className="rule"></div>
        </header>

        <div className="statgrid">
          <div className="statcard"><div className="k">Games</div><div className="v">{mine.length}</div></div>
          <div className="statcard"><div className="k">Avg Rating</div><div className="v gold">{avgRating}{avgRating !== '—' && '★'}</div></div>
          <div className="statcard"><div className="k">Avg Complexity</div><div className="v">{avgWeight}</div></div>
          <div className="statcard"><div className="k">Categories</div><div className="v">{catCount.size}</div></div>
        </div>

        {topCats.length > 0 && (
          <p className="sectionsub">Most-collected: {topCats.join(' · ')}</p>
        )}

        <CommunityList games={mine} />
      </main>
    </div>
  )
}
