import PageHeader from '@/components/PageHeader'

export default function Loading() {
  return (
    <div className="wrap">
      <PageHeader />
      <main id="main">
        <header className="hero">
          <div className="eyebrow">Schedule</div>
          <h1 className="skeleton-title">Upcoming sessions</h1>
          <div className="rule"></div>
        </header>

        <div className="glist">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="grow skeleton skeleton-row" />
          ))}
        </div>
      </main>
    </div>
  )
}
