import type { Payload } from 'payload'
import { extractId } from '@/lib/relation'

/** وقتی ظرفیت نوبتی آزاد می‌شود (لغو/انقضا)، افراد فهرست انتظار را به ترتیب اطلاع می‌دهد. */
export async function notifyWaitlist(payload: Payload): Promise<void> {
  const sessions = await payload.find({
    collection: 'workshop-sessions',
    where: { status: { equals: 'published' } },
    limit: 200,
    overrideAccess: true,
  })

  for (const session of sessions.docs) {
    const seatsAvailable = session.capacity - session.occupiedCount
    if (seatsAvailable <= 0) continue

    const waiting = await payload.find({
      collection: 'workshop-waitlist',
      where: { and: [{ session: { equals: session.id } }, { notifiedAt: { equals: null } }] },
      sort: 'joinedAt',
      limit: seatsAvailable,
      overrideAccess: true,
    })

    for (const entry of waiting.docs) {
      const studentId = extractId(entry.student)
      if (studentId === undefined) continue
      try {
        await payload.create({
          collection: 'jobs',
          data: {
            type: 'sms_waitlist_seat_available',
            uniqueKey: `waitlist_notify:${session.id}:${studentId}`,
            payload: { studentId, sessionId: session.id },
            scheduledFor: new Date().toISOString(),
            status: 'pending',
            attempts: 0,
          },
          overrideAccess: true,
        })
        await payload.update({ collection: 'workshop-waitlist', id: entry.id, data: { notifiedAt: new Date().toISOString() }, overrideAccess: true })
      } catch {
        // قبلاً اطلاع‌رسانی شده
      }
    }
  }
}
