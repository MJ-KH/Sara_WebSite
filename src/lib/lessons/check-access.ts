import type { Payload } from 'payload'
import { hasActivePackageAccess } from '@/lib/packages/access'
import { extractId } from '@/lib/relation'
import type { Lesson } from '@/payload-types'

export type LessonAccessResult = { ok: true; lesson: Lesson } | { ok: false; error: 'not_found' | 'forbidden' }

/**
 * بررسی دسترسی به درس: نمونه رایگان برای همه آزاد است؛ در غیر این صورت باید هنرجو
 * وارد شده و entitlement فعال (بدون انقضا یا با expiresAt در آینده، بدون revokedAt) به
 * پکیج آن درس داشته باشد. همیشه با overrideAccess خوانده می‌شود چون فیلد ویدئو در سطح
 * فیلد به مدیران محدود است.
 */
export async function checkLessonAccess(
  payload: Payload,
  lessonId: string | number,
  studentId: string | number | null,
): Promise<LessonAccessResult> {
  const lesson = await payload.findByID({ collection: 'lessons', id: lessonId, overrideAccess: true, depth: 1 })
  if (!lesson || lesson.status !== 'published') return { ok: false, error: 'not_found' }

  if (lesson.isFreePreview) return { ok: true, lesson }

  if (!studentId) return { ok: false, error: 'forbidden' }

  const packageId = extractId(lesson.package)
  if (packageId === undefined) return { ok: false, error: 'not_found' }
  // دسترسی مستقیم یا از راه پکیج چنددوره‌ای
  if (!(await hasActivePackageAccess(payload, studentId, packageId))) return { ok: false, error: 'forbidden' }
  return { ok: true, lesson }
}
