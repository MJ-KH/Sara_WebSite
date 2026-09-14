import type { Payload } from 'payload'
import { nextBirthdaySendUtc } from '@/lib/jalali'

/**
 * برای هر هنرجوی دارای تاریخ تولد، سالگرد بعدی را محاسبه و job تبریک تولد می‌سازد.
 * کلید یکتای job شامل سال جلالی هدف است، بنابراین اجرای مکرر این sweep حداکثر یک job در
 * سال برای هر نفر می‌سازد (تلاش دوم روی unique constraint شکست می‌خورد و نادیده گرفته می‌شود).
 */
export async function enqueueBirthdayJobs(payload: Payload): Promise<void> {
  const pageSize = 200
  let page = 1

  while (true) {
    const result = await payload.find({
      collection: 'students',
      where: { and: [{ 'birthdayJalali.day': { exists: true } }, { 'birthdayJalali.month': { exists: true } }] },
      limit: pageSize,
      page,
      overrideAccess: true,
    })

    for (const student of result.docs) {
      const birthday = student.birthdayJalali
      if (!birthday?.day || !birthday?.month) continue

      const { occurrenceUtc, targetJalaliYear } = nextBirthdaySendUtc(
        { day: birthday.day, month: birthday.month },
        new Date(),
      )

      const uniqueKey = `birthday:${student.id}:${targetJalaliYear}`
      try {
        await payload.create({
          collection: 'jobs',
          data: {
            type: 'sms_birthday',
            uniqueKey,
            payload: { studentId: student.id },
            scheduledFor: occurrenceUtc.toISOString(),
            status: 'pending',
            attempts: 0,
          },
          overrideAccess: true,
        })
      } catch {
        // job قبلاً برای همین سال ساخته شده — طبیعی و مورد انتظار است
      }
    }

    if (!result.hasNextPage) break
    page += 1
  }
}
