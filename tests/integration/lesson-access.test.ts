import { beforeAll, describe, expect, it } from 'vitest'
import { checkLessonAccess } from '@/lib/lessons/check-access'
import { createTestPackage, createTestStudent, getTestPayload } from './helpers'

describe('دسترسی به درس خصوصی (معیار پذیرش #۶)', () => {
  let payload: Awaited<ReturnType<typeof getTestPayload>>

  beforeAll(async () => {
    payload = await getTestPayload()
  })

  async function setupPackageWithLessons() {
    const pkg = await createTestPackage(payload)
    const chapter = await payload.create({
      collection: 'chapters',
      data: { package: pkg.id, title: 'فصل تست', order: 1, status: 'published' },
      overrideAccess: true,
    })
    const freeLesson = await payload.create({
      collection: 'lessons',
      data: { package: pkg.id, chapter: chapter.id, title: 'درس رایگان', order: 1, isFreePreview: true, status: 'published' },
      overrideAccess: true,
    })
    const paidLesson = await payload.create({
      collection: 'lessons',
      data: { package: pkg.id, chapter: chapter.id, title: 'درس خصوصی', order: 2, isFreePreview: false, status: 'published' },
      overrideAccess: true,
    })
    return { pkg, freeLesson, paidLesson }
  }

  it('مهمان (بدون ورود) به درس رایگان دسترسی دارد ولی به درس خصوصی نه', async () => {
    const { freeLesson, paidLesson } = await setupPackageWithLessons()

    const freeAccess = await checkLessonAccess(payload, String(freeLesson.id), null)
    expect(freeAccess.ok).toBe(true)

    const paidAccess = await checkLessonAccess(payload, String(paidLesson.id), null)
    expect(paidAccess.ok).toBe(false)
    if (!paidAccess.ok) expect(paidAccess.error).toBe('forbidden')
  })

  it('هنرجوی بدون خرید به درس خصوصی دسترسی ندارد', async () => {
    const { paidLesson } = await setupPackageWithLessons()
    const student = await createTestStudent(payload)

    const access = await checkLessonAccess(payload, String(paidLesson.id), String(student.id))
    expect(access.ok).toBe(false)
  })

  it('هنرجوی دارای entitlement فعال به درس خصوصی دسترسی دارد', async () => {
    const { pkg, paidLesson } = await setupPackageWithLessons()
    const student = await createTestStudent(payload)
    await payload.create({
      collection: 'entitlements',
      data: { student: student.id, package: pkg.id, grantedAt: new Date().toISOString(), expiresAt: null },
      overrideAccess: true,
    })

    const access = await checkLessonAccess(payload, String(paidLesson.id), String(student.id))
    expect(access.ok).toBe(true)
  })

  it('entitlement منقضی‌شده دسترسی نمی‌دهد', async () => {
    const { pkg, paidLesson } = await setupPackageWithLessons()
    const student = await createTestStudent(payload)
    await payload.create({
      collection: 'entitlements',
      data: {
        student: student.id,
        package: pkg.id,
        grantedAt: new Date(Date.now() - 100_000_000).toISOString(),
        expiresAt: new Date(Date.now() - 1000).toISOString(),
      },
      overrideAccess: true,
    })

    const access = await checkLessonAccess(payload, String(paidLesson.id), String(student.id))
    expect(access.ok).toBe(false)
  })

  it('entitlement لغوشده (revoked) دسترسی نمی‌دهد', async () => {
    const { pkg, paidLesson } = await setupPackageWithLessons()
    const student = await createTestStudent(payload)
    await payload.create({
      collection: 'entitlements',
      data: { student: student.id, package: pkg.id, grantedAt: new Date().toISOString(), expiresAt: null, revokedAt: new Date().toISOString() },
      overrideAccess: true,
    })

    const access = await checkLessonAccess(payload, String(paidLesson.id), String(student.id))
    expect(access.ok).toBe(false)
  })

  it('توقف فروش پکیج، دسترسی خریدار قبلی را قطع نمی‌کند (معیار پذیرش #۸)', async () => {
    const { pkg, paidLesson } = await setupPackageWithLessons()
    const student = await createTestStudent(payload)
    await payload.create({
      collection: 'entitlements',
      data: { student: student.id, package: pkg.id, grantedAt: new Date().toISOString(), expiresAt: null },
      overrideAccess: true,
    })

    await payload.update({ collection: 'packages', id: pkg.id, data: { status: 'stopped' }, overrideAccess: true })

    const access = await checkLessonAccess(payload, String(paidLesson.id), String(student.id))
    expect(access.ok).toBe(true)
  })
})
