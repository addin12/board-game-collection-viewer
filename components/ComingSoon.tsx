import PageHeader from '@/components/PageHeader'

export default function ComingSoon({
  eyebrow,
  title,
  lead,
  body,
}: {
  eyebrow: string
  title: string
  lead: string
  body: string
}) {
  return (
    <div className="wrap">
      <PageHeader />

      <header className="hero">
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{lead}</p>
        <div className="rule"></div>
      </header>

      <div className="panel">
        <span className="soon">Coming soon</span>
        <h2>Not ready yet</h2>
        <p>{body}</p>
      </div>
    </div>
  )
}
