export function getBaseUrl(): string {
  // Vercel production URL (use this for server-side fetches)
  if (process.env.VERCEL_URL) {
    const url = process.env.VERCEL_URL
    // Ensure we don't double-add protocol
    if (url.startsWith('http')) {
      return url
    }
    return `https://${url}`
  }

  // Fallback for local development
  return 'http://localhost:3000'
}

export function formatPlayTime(min: number, max: number): string {
  if (min === max) {
    return `${min} min`
  }
  return `${min}–${max} min`
}

export function formatPlayerCount(min: number, max: number): string {
  if (min === max) {
    return `${min} player${min === 1 ? '' : 's'}`
  }
  return `${min}–${max} players`
}
