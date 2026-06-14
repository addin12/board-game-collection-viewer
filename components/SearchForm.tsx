'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchForm() {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (username.trim()) {
      setIsLoading(true)
      router.push(`/${encodeURIComponent(username.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex gap-2">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter BoardGameGeek username..."
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={isLoading || !username.trim()}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-amber-50 font-semibold rounded-lg transition-colors"
        >
          {isLoading ? 'Loading...' : 'View'}
        </button>
      </div>
    </form>
  )
}
