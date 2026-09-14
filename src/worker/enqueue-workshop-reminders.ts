import type { Payload } from 'payload'
import { extractId } from '@/lib/relation'

const REMINDER_HOURS_BEFORE = Number(process.env.WORKSHOP_REMINDER_HOURS_BEFORE || 24)

export async function enqueueWorkshopReminders(payload: Payload): Promise<void> {
  const windowEnd = new Date(Date.now() + REMINDER_HOURS_BEFORE * 60 * 60_000)

  const sessions = await payload.find({
    collection: 'workshop-sessions',
    where: {
      and: [
        { status: { equals: 'published' } },
        { startAt: { greater_than: new Date().toISOString() } },
        { startAt: { less_than_equal: windowEnd.toISOString() } },
      ],
    },
    limit: 200,
    overrideAccess: true,
  })

  for (const session of sessions.docs) {
    const enrollments = await payload.find({
      collection: 'workshop-enrollments',
      where: { and: [{ session: { equals: session.id } }, { status: { equals: 'confirmed' } }] },
      limit: 500,
      overrideAccess: true,
    })

    for (const enrollment of enrollments.docs) {
      const studentId = extractId(enrollment.student)
      if (studentId === undefined) continue
      try {
        await payload.create({
          collection: 'jobs',
          data: {
            type: 'sms_workshop_reminder',
            uniqueKey: `workshop_reminder:${session.id}:${studentId}`,
            payload: { studentId, sessionId: session.id },
            scheduledFor: new Date().toISOString(),
            status: 'pending',
            attempts: 0,
          },
          overrideAccess: true,
        })
      } catch {
        // یادآوری قبلاً برای همین نوبت/هنرجو ساخته شده
      }
    }
  }
}
