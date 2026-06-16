import Link from 'next/link'

export const metadata = {
  title: 'BBGC — Barudak Board Game Club',
}

export default function Home() {
  return (
    <div className="wrap">
      <div className="bar">
        <svg className="mark" viewBox="0 0 100 100" aria-hidden="true">
          <path d="M50 8c-8 0-14 6-14 13 0 4 2 8 5 10-3 1-6 3-8 5-4-2-9-1-11 3-2 4-1 9 3 11 1 0 1 1 1 2-2 5-3 10-3 15 0 3 2 5 5 5h44c3 0 5-2 5-5 0-5-1-10-3-15 0-1 0-2 1-2 4-2 5-7 3-11-2-4-7-5-11-3-2-2-5-4-8-5 3-2 5-6 5-10 0-7-6-13-14-13z" />
        </svg>
        <div className="wordmark">B<span>B</span>GC</div>
      </div>

      <header className="hero">
        <div className="eyebrow">Welcome</div>
        <h1>Barudak Board Game Club</h1>
        <p>Boardgamers&apos; planet. Pool the community&apos;s shelves, see what fits the table tonight, and call out the next session.</p>
        <div className="rule"></div>
      </header>

      <nav className="grid">
        <Link className="tile t-session" href="/session">
          <span className="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="7.5" cy="7.5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="16.5" cy="16.5" r="1" /><rect x="3" y="3" width="18" height="18" rx="4" /></svg></span>
          <span className="body"><h2>Session Collection</h2><p>View an individual collection and call out a session.</p></span>
          <span className="go" aria-hidden="true">→</span>
        </Link>

        <Link className="tile t-all" href="/all">
          <span className="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="4" y="3" width="4.5" height="18" rx="1" /><rect x="9.5" y="3" width="4.5" height="18" rx="1" /><path d="M16 4.5l3.8 1 3.2 16.2-4 .8" /></svg></span>
          <span className="body"><h2>All Collection</h2><p>View the community&apos;s entire collection.</p></span>
          <span className="go" aria-hidden="true">→</span>
        </Link>

        <Link className="tile t-update" href="/update">
          <span className="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-.6 4" /><path d="M20 5v4h-4" /></svg></span>
          <span className="body"><h2>Update Collection</h2><p>Resync your individual collection from BGG.</p></span>
          <span className="go" aria-hidden="true">→</span>
        </Link>

        <Link className="tile t-sched" href="/schedule">
          <span className="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 9h18M8 3v4M16 3v4" /></svg></span>
          <span className="body"><h2>Schedule</h2><p>View the upcoming session schedule.</p></span>
          <span className="go" aria-hidden="true">→</span>
        </Link>

        <Link className="tile t-stats" href="/community">
          <span className="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg></span>
          <span className="body"><h2>Community Stats</h2><p>Biggest collectors and the club&apos;s favourite games.</p></span>
          <span className="go" aria-hidden="true">→</span>
        </Link>
      </nav>

      <footer className="foot">
        <span className="v">BBGC Collection v0.7.5</span>
        <span>©2022–2024 Barudak Board Game Club</span>
      </footer>
    </div>
  )
}
