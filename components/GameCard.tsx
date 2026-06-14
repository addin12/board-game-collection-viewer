import Image from 'next/image'
import { BoardGame } from '@/lib/types'
import { formatPlayTime, formatPlayerCount } from '@/lib/utils'
import clsx from 'clsx'

interface GameCardProps {
  game: BoardGame
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-amber-500/20 transition-shadow h-full flex flex-col">
      <div className="relative w-full h-48 bg-slate-700">
        <Image
          src={game.thumbnail}
          alt={game.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>

      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-semibold text-sm line-clamp-2 text-slate-100 mb-1">{game.name}</h3>

        {game.yearPublished && <p className="text-xs text-slate-400 mb-2">{game.yearPublished}</p>}

        <div className="space-y-1 text-xs text-slate-300 mb-3 flex-grow">
          <p>{formatPlayerCount(game.minPlayers, game.maxPlayers)}</p>
          <p>{formatPlayTime(game.minPlayTime, game.maxPlayTime)}</p>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-700">
          {game.bggRank && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">BGG Rank</span>
              <span className="bg-amber-600 text-amber-50 px-2 py-1 rounded font-semibold">#{game.bggRank}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Community</span>
            <span className={clsx('font-semibold', game.communityRating >= 7 ? 'text-amber-400' : 'text-slate-300')}>
              {game.communityRating.toFixed(1)}★
            </span>
          </div>

          {game.userRating !== null && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Your Rating</span>
              <span className="text-blue-400 font-semibold">{game.userRating.toFixed(1)}★</span>
            </div>
          )}

          {game.numPlays > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Plays</span>
              <span className="text-green-400 font-semibold">{game.numPlays}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
