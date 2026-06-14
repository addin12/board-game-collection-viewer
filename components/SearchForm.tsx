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
    <form onSubmit={handleSubmit} className="search">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="BoardGameGeek username…"
        disabled={isLoading}
        autoComplete="off"
      />
      <button type="submit" className="btn" disabled={isLoading || !username.trim()}>
        {isLoading ? 'Loading…' : 'View Collection'}
      </button>
    </form>
  )
}
