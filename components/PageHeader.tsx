'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/collection', label: 'Collection' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/community', label: 'Community' },
  { href: '/help', label: 'Help' },
]

export default function PageHeader() {
  const pathname = usePathname()
  return (
    <div className="bar between">
      <Link href="/" aria-label="BBGC home">
        <svg className="mark" viewBox="0 0 100 100" aria-hidden="true">
          <path d="M50 8c-8 0-14 6-14 13 0 4 2 8 5 10-3 1-6 3-8 5-4-2-9-1-11 3-2 4-1 9 3 11 1 0 1 1 1 2-2 5-3 10-3 15 0 3 2 5 5 5h44c3 0 5-2 5-5 0-5-1-10-3-15 0-1 0-2 1-2 4-2 5-7 3-11-2-4-7-5-11-3-2-2-5-4-8-5 3-2 5-6 5-10 0-7-6-13-14-13z" />
        </svg>
        <div className="wordmark">B<span>B</span>GC</div>
      </Link>

      <nav className="topnav" aria-label="Primary">
        {LINKS.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + '/')
          // Spread aria-current so the attribute is simply absent when inactive
          // (avoids a bare aria-*={expr} the IDE flags as a false positive).
          const current = active ? { 'aria-current': 'page' as const } : {}
          return (
            <Link key={l.href} href={l.href} className={active ? 'navlink is-active' : 'navlink'} {...current}>
              {l.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
