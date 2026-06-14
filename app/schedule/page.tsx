import ComingSoon from '@/components/ComingSoon'

export const metadata = {
  title: 'Schedule',
}

export default function SchedulePage() {
  return (
    <ComingSoon
      eyebrow="Schedule"
      title="Upcoming sessions"
      lead="See what's being played next and who's in."
      body="Session scheduling and RSVPs land in the next phase. You'll be able to call out a game night, pick from the community shelf, and let players sign up."
    />
  )
}
