import { describe, it, expect } from 'vitest'
import { formatPlayTime, formatPlayerCount } from '@/lib/utils'

describe('formatPlayTime', () => {
  it('shows a single value when min equals max', () => {
    expect(formatPlayTime(60, 60)).toBe('60 min')
  })
  it('shows a range when they differ', () => {
    expect(formatPlayTime(60, 90)).toBe('60–90 min')
  })
})

describe('formatPlayerCount', () => {
  it('is singular for one player', () => {
    expect(formatPlayerCount(1, 1)).toBe('1 player')
  })
  it('is plural for more', () => {
    expect(formatPlayerCount(2, 2)).toBe('2 players')
  })
  it('shows a range', () => {
    expect(formatPlayerCount(2, 4)).toBe('2–4 players')
  })
})
