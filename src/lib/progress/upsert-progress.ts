import type { Payload } from 'payload'

/**
 * چون یکتایی (student, lesson) در سطح دیتابیس اعمال نشده (ر.ک. توضیح در
 * src/collections/LessonProgress.ts)، همیشه از همین تابع (find-then-update-or-create)
 * استفاده کنید، نه payload.create مستقیم.
 */
export async function upsertLessonProgress(
  payload: Payload,
  studentId: string | number,
  lessonId: string | number,
  positionSeconds: number,
  completed: boolean,
) {
  const existing = await payload.find({
    collection: 'lesson-progress',
    where: { and: [{ student: { equals: studentId } }, { lesson: { equals: lessonId } }] },
    limit: 1,
    overrideAccess: true,
  })
  const doc = existing.docs[0]

  if (doc) {
    return payload.update({
      collection: 'lesson-progress',
      id: doc.id,
      data: { positionSeconds, completed: completed || Boolean(doc.completed) },
      overrideAccess: true,
    })
  }

  return payload.create({
    collection: 'lesson-progress',
    data: { student: Number(studentId), lesson: Number(lessonId), positionSeconds, completed },
    overrideAccess: true,
  })
}
