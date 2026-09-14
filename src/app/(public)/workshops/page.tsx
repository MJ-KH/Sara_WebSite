import type { Metadata } from 'next'
import { WorkshopSessionCard } from '@/components/workshops/WorkshopSessionCard'
import { getPayloadClient } from '@/lib/get-payload'

export const metadata: Metadata = { title: 'دوره‌های حضوری' }

export default async function WorkshopsPage() {
  const payload = await getPayloadClient()
  const sessions = await payload.find({
    collection: 'workshop-sessions',
    where: { status: { equals: 'published' }, startAt: { greater_than: new Date().toISOString() } },
    sort: 'startAt',
    depth: 1,
    limit: 50,
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">دوره‌های حضوری</h1>
      {sessions.docs.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">در حال حاضر نوبت فعالی برای دوره حضوری وجود ندارد.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.docs.map((session) => (
            <WorkshopSessionCard key={session.id} session={session as any} />
          ))}
        </div>
      )}
    </div>
  )
}
