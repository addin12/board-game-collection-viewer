import ComingSoon from '@/components/ComingSoon'

export const metadata = {
  title: 'All Collection',
}

export default function CollectionPage() {
  return (
    <ComingSoon
      eyebrow="All Collection"
      title="The community's shelf"
      lead="Every member's owned games, pooled into one searchable collection."
      body="Once more members sync their BoardGameGeek shelves, this page will merge them into a single community library — filterable by player count, play time, and who owns what."
    />
  )
}
