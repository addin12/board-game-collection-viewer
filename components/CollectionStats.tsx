import { BoardGame } from '@/lib/types'

interface CollectionStatsProps {
  games: BoardGame[]
}

export default function CollectionStats({ games }: CollectionStatsProps) {
  const totalGames = games.length
  const totalPlays = games.reduce((sum, g) => sum + g.numPlays, 0)
  const mostPlayed = games.reduce((max, g) => (g.numPlays > max.numPlays ? g : max), games[0])
  const avgRating = (games.reduce((sum, g) => sum + g.communityRating, 0) / totalGames).toFixed(1)
  const ratedGames = games.filter((g) => g.userRating !== null).length
  const avgUserRating = (games.filter((g) => g.userRating !== null).reduce((sum, g) => sum + (g.userRating || 0), 0) / (ratedGames || 1)).toFixed(1)

  const stats = [
    { label: 'Total Games', value: totalGames, color: 'text-blue-400' },
    { label: 'Total Plays', value: totalPlays, color: 'text-green-400' },
    { label: 'Avg Rating', value: `${avgRating}★`, color: 'text-amber-400' },
    { label: 'Your Ratings', value: ratedGames, color: 'text-purple-400' },
    { label: 'Your Avg', value: ratedGames > 0 ? `${avgUserRating}★` : 'N/A', color: 'text-pink-400' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-2">{stat.label}</p>
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}

      {mostPlayed && (
        <div className="md:col-span-5 bg-slate-800 rounded-lg p-4 border border-amber-600/30">
          <p className="text-xs text-slate-400 mb-1">Most Played</p>
          <p className="font-semibold text-amber-400">{mostPlayed.name}</p>
          <p className="text-sm text-slate-400">
            {mostPlayed.numPlays} play{mostPlayed.numPlays !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
