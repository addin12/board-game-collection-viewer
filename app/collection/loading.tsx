import PageHeader from '@/components/PageHeader'

export default function Loading() {
  return (
    <div className="wrap">
      <PageHeader />
      <main id="main">
        <header className="hero">
          <div className="eyebrow">Collection</div>
          <h1 className="skeleton-title">The club&apos;s shelf</h1>
          <div className="rule"></div>
        </header>

        <div className="glist">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grow skeleton skeleton-row" />
          ))}
        </div>
      </main>
    </div>
  )
}
