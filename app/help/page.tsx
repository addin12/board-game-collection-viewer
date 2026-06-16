import Link from 'next/link'
import PageHeader from '@/components/PageHeader'

export const metadata = {
  title: 'Help',
}

export default function HelpPage() {
  return (
    <div className="wrap">
      <PageHeader />

      <main id="main">
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
            In <Link href="/collection?tab=session">Collection → Plan a session</Link>, keep the
            <strong> &ldquo;Who&apos;s playing?&rdquo;</strong> mode, add who&apos;s at the table under
            <em> &ldquo;I&apos;m playing with…&rdquo;</em>, and it pools everyone&apos;s games into one list. Narrow it
            with the <em>&ldquo;only games that fit N players&rdquo;</em> and <em>&ldquo;we&apos;ve got ~2 hours&rdquo;</em> filters.
          </p>
        </div>

        <div className="helpcard">
          <h3>🙋 Start from a game</h3>
          <p>
            Want to get a specific game going? On <Link href="/collection?tab=session">Plan a session</Link>, switch to
            <strong> &ldquo;Pick the game(s)&rdquo;</strong>, choose the game(s), then invite a few likely players. They confirm
            on the schedule — and if everyone you invited bows out, the session <strong>opens to the whole club</strong> so
            anyone can jump in.
          </p>
        </div>

        <div className="helpcard">
          <h3>📣 Call a session</h3>
          <p>
            Either way, set a time and place, pick the game(s), and hit
            <strong> Call session</strong>. It shows up on the schedule for everyone, with the
            <strong> recommended player count</strong> so people know what they&apos;re joining.
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
          <h3>📥 Import your BGG collection</h3>
          <p>
            In <Link href="/collection?tab=bgg">Collection → Add from BGG</Link>, export your collection from BoardGameGeek
            (your collection page → <strong>Export</strong> → CSV) and <strong>upload the file</strong>. It shows your whole
            shelf with cover art, and you can <strong>save it to the community</strong> under your name so it joins Browse and
            Plan a session. Works even while BGG&apos;s API is down.
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
      </main>
    </div>
  )
}
