import PageHeader from '@/components/PageHeader'
import SchedulePanel from '@/components/SchedulePanel'
import { MEMBERS } from '@/lib/community'

export const metadata = {
  title: 'Schedule',
}

export default function SchedulePage() {
  return (
    <div className="wrap">
      <PageHeader />

      <header className="hero">
        <div className="eyebrow">Schedule</div>
        <h1>Upcoming sessions</h1>
        <p>See what&apos;s being played next, and let the group know if you&apos;re in.</p>
        <div className="rule"></div>
      </header>

      <SchedulePanel members={MEMBERS} />
    </div>
  )
}
