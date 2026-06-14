import ComingSoon from '@/components/ComingSoon'

export const metadata = {
  title: 'Update Collection',
}

export default function UpdatePage() {
  return (
    <ComingSoon
      eyebrow="Update Collection"
      title="Resync from BGG"
      lead="Pull the latest owned games from a member's BoardGameGeek shelf."
      body="BoardGameGeek's API now requires authentication, so collections are refreshed manually for now. This page will let members trigger a resync once accounts are in place."
    />
  )
}
