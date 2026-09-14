import { beforeAll, describe, expect, it, vi } from 'vitest'
import { studentJwtStrategy } from '@/lib/auth/student-strategy'
import { getStudentSessionCookieName, signStudentSessionToken } from '@/lib/auth/student-jwt'
import { createPendingPackageOrder } from '@/lib/orders/create-pending-order'
import { completeOrderPayment } from '@/lib/orders/complete-order-payment'
import { createPendingWorkshopOrder } from '@/lib/workshops/create-pending-workshop-order'
import { releaseWorkshopSeat } from '@/lib/workshops/reserve-seat'
import { createTestPackage, createTestStudent, getTestPayload, randomSuffix } from './helpers'

// Independent regression checks: expected behavior is the safe business outcome.
// These intentionally expose defects in the reviewed application without changing it.
describe('Independent review: authorization and payment regressions', () => {
  let payload: Awaited<ReturnType<typeof getTestPayload>>

  beforeAll(async () => {
    payload = await getTestPayload()
    vi.stubEnv('PAYMENT_PROVIDER', 'mock')
  })

  it('a student cannot take ownership of another student support ticket', async () => {
    const owner = await createTestStudent(payload)
    const attacker = await createTestStudent(payload)
    const ticket = await payload.create({
      collection: 'support-tickets',
      data: {
        student: owner.id,
        subject: 'Private review fixture',
        messages: [{ from: 'student', body: 'Private fixture message', createdAt: new Date().toISOString() }],
      },
      overrideAccess: true,
    })
    const user = { ...attacker, collection: 'students' as const }
    await expect(payload.update({
      collection: 'support-tickets',
      id: ticket.id,
      data: { student: attacker.id },
      overrideAccess: false,
      user,
    })).rejects.toThrow()
  })

  it('blocking a student invalidates their previously issued session', async () => {
    const student = await createTestStudent(payload)
    const token = await signStudentSessionToken(String(student.id))
    await payload.update({ collection: 'students', id: student.id, data: { status: 'blocked' }, overrideAccess: true })
    const args = {
      payload,
      headers: new Headers({ cookie: getStudentSessionCookieName() + '=' + token }),
    } as Parameters<typeof studentJwtStrategy.authenticate>[0]
    const result = await studentJwtStrategy.authenticate(args)
    expect(result.user).toBeNull()
  })

  it('a successfully paid repurchase renews an expired package entitlement', async () => {
    const student = await createTestStudent(payload)
    const pkg = await createTestPackage(payload, { accessDurationDays: 30 })
    await payload.create({
      collection: 'entitlements',
      data: {
        student: student.id, package: pkg.id,
        grantedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
        expiresAt: new Date(Date.now() - 86400000).toISOString(),
      },
      overrideAccess: true,
    })
    const pending = await createPendingPackageOrder(payload, student, pkg.slug, null, 'http://localhost:3000')
    expect(pending.ok).toBe(true)
    if (!pending.ok) throw new Error(pending.error)
    const attempt = (await payload.find({
      collection: 'payment-attempts',
      where: { order: { equals: Number(pending.orderId) } }, overrideAccess: true,
    })).docs[0]
    await expect(completeOrderPayment(payload, attempt.providerRefId, {
      Authority: attempt.providerRefId, Status: 'OK',
    })).resolves.toMatchObject({ ok: true })
    const access = (await payload.find({
      collection: 'entitlements',
      where: { and: [{ student: { equals: student.id } }, { package: { equals: pkg.id } }] },
      overrideAccess: true,
    })).docs[0]
    expect(access.revokedAt).toBeFalsy()
    expect(access.expiresAt === null || Date.parse(access.expiresAt!) > Date.now()).toBe(true)
  })

  it('a late workshop payment cannot report ordinary success without an enrollment', async () => {
    const student = await createTestStudent(payload)
    const workshop = await payload.create({
      collection: 'workshops',
      data: { slug: 'review-ws-' + randomSuffix(), title: 'Review workshop', status: 'published' },
      overrideAccess: true,
    })
    const session = await payload.create({
      collection: 'workshop-sessions',
      data: {
        workshop: workshop.id, startAt: new Date(Date.now() + 86400000).toISOString(),
        capacity: 1, occupiedCount: 0, priceRial: 1000000, status: 'published',
      },
      overrideAccess: true,
    })
    const pending = await createPendingWorkshopOrder(payload, student, session.id, 'http://localhost:3000')
    expect(pending.ok).toBe(true)
    if (!pending.ok) throw new Error(pending.error)
    const reservation = (await payload.find({
      collection: 'workshop-reservations', where: { order: { equals: Number(pending.orderId) } }, overrideAccess: true,
    })).docs[0]
    await releaseWorkshopSeat(payload, reservation.id, 'expired')
    const attempt = (await payload.find({
      collection: 'payment-attempts', where: { order: { equals: Number(pending.orderId) } }, overrideAccess: true,
    })).docs[0]
    const result = await completeOrderPayment(payload, attempt.providerRefId, { Authority: attempt.providerRefId, Status: 'OK' })
    const enrollments = await payload.find({
      collection: 'workshop-enrollments', where: { order: { equals: Number(pending.orderId) } }, overrideAccess: true,
    })
    expect({ silentlySuccessfulWithoutEnrollment: result.ok && enrollments.totalDocs === 0 })
      .toEqual({ silentlySuccessfulWithoutEnrollment: false })
  })
})
