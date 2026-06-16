import Link from 'next/link'
import PageHeader from '@/components/PageHeader'

export const metadata = {
  title: 'Help',
}

export default function HelpPage() {
  return (
    <div className="wrap">
      <PageHeader />

      <header className="hero">
        <div className="eyebrow">Help</div>
        <h1>How it works</h1>
        <p>No accounts, no passwords — just open the site and go.</p>
        <div className="rule"></div>
      </header>

      <div className="helpgrid">
        <div className="helpcard">
          <h3>🔍 Browse the shelf</h3>
          <p>
            Open <Link href="/collection">Collection</Link> → the <strong>Browse all</strong> tab. Search by name, jump
            with the A–Z index, or use the dropdowns to filter by <strong>category</strong> or by <strong>member</strong>
            — &ldquo;show me everything Noah owns.&rdquo;
          </p>
        </div>

        <div className="helpcard">
          <h3>🎲 Find a game for tonight</h3>
          <p>
            In <Link href="/collection?tab=session">Collection → Plan a session</Link>, add who&apos;s at the table under
            <em> &ldquo;I&apos;m playing with…&rdquo;</em>. It pools everyone&apos;s games into one list. Narrow it
            with the <em>&ldquo;only games that fit N players&rdquo;</em> and <em>&ldquo;we&apos;ve got ~2 hours&rdquo;</em> filters.
          </p>
        </div>

        <div className="helpcard">
          <h3>📣 Call a session</h3>
          <p>
            On that same tab, set a time and place, pick the game(s) you&apos;re playing, and hit
            <strong> Call session</strong>. It shows up on the schedule for everyone.
          </p>
        </div>

        <div className="helpcard">
          <h3>✅ RSVP to a session</h3>
          <p>
            Open <Link href="/schedule">Schedule</Link>, pick your name under <em>&ldquo;You are&rdquo;</em>, then tap
            <strong> I&apos;m in / Maybe / Can&apos;t make it</strong> on any session. You can also <strong>add to calendar</strong>.
            Whoever called a session can <strong>Edit</strong> or <strong>Cancel</strong> it, and past game nights live under
            <strong> Show past sessions</strong>.
          </p>
        </div>

        <div className="helpcard">
          <h3>📊 See the club&apos;s stats</h3>
          <p>
            <Link href="/community">Community Stats</Link> shows the biggest collectors, the most-owned games, and the
            one-of-a-kind titles only one person owns.
          </p>
        </div>
      </div>

      <p className="sectionsub">Tip: your name is remembered on each device, so you only pick it once.</p>
    </div>
  )
}
