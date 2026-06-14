import PageHeader from '@/components/PageHeader'
import SearchForm from '@/components/SearchForm'

export const metadata = {
  title: 'Session Collection',
}

export default function SessionPage() {
  return (
    <div className="wrap">
      <PageHeader />

      <header className="hero">
        <div className="eyebrow">Session Collection</div>
        <h1>View a collection</h1>
        <p>Enter a member&apos;s BoardGameGeek username to browse their shelf and call out a session around it.</p>
        <div className="rule"></div>
      </header>

      <div className="panel">
        <h2>Find a collection</h2>
        <p>Try <strong>Deedeen</strong> to see a real BGG collection.</p>
        <SearchForm />
      </div>
    </div>
  )
}
