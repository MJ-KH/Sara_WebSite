import { beforeAll, describe, expect, it, vi } from 'vitest'
import { completeOrderPayment } from '@/lib/orders/complete-order-payment'
import { createTestPackage, createTestStudent, getTestPayload, randomSuffix } from './helpers'

async function createPendingOrderAndAttempt(
  payload: Awaited<ReturnType<typeof getTestPayload>>,
  studentId: string | number,
  pkg: { id: string | number; title: string; priceRial: number },
) {
  const order = await payload.create({
    collection: 'orders',
    data: {
      student: Number(studentId),
      subjectType: 'package',
      subjectPackage: Number(pkg.id),
      titleSnapshot: pkg.title,
      unitPriceRialSnapshot: pkg.priceRial,
      discountAmountRialSnapshot: 0,
      totalRialSnapshot: pkg.priceRial,
      termsVersionSnapshot: '1',
      status: 'pending',
    },
    overrideAccess: true,
  })
  const providerRefId = `TEST${randomSuffix()}`
  await payload.create({
    collection: 'payment-attempts',
    data: { order: order.id, gateway: 'mock', providerRefId, amountRialSnapshot: pkg.priceRial, status: 'initiated' },
    overrideAccess: true,
  })
  return { order, providerRefId }
}

describe('تأیید پرداخت و جلوگیری از پردازش مضاعف (معیار پذیرش #۵ و #۸)', () => {
  let payload: Awaited<ReturnType<typeof getTestPayload>>

  beforeAll(async () => {
    payload = await getTestPayload()
    vi.stubEnv('PAYMENT_PROVIDER', 'mock')
  })

  it('callback موفق فقط یک entitlement می‌سازد، حتی اگر دوبار فراخوانی شود', async () => {
    const pkg = await createTestPackage(payload)
    const student = await createTestStudent(payload)
    const { order, providerRefId } = await createPendingOrderAndAttempt(payload, String(student.id), pkg)

    const first = await completeOrderPayment(payload, providerRefId, { Authority: providerRefId, Status: 'OK' })
    expect(first.ok).toBe(true)
    if (first.ok) expect(first.alreadyProcessed).toBe(false)

    const second = await completeOrderPayment(payload, providerRefId, { Authority: providerRefId, Status: 'OK' })
    expect(second.ok).toBe(true)
    if (second.ok) expect(second.alreadyProcessed).toBe(true)

    const entitlements = await payload.find({
      collection: 'entitlements',
      where: { and: [{ student: { equals: student.id } }, { package: { equals: pkg.id } }] },
      overrideAccess: true,
    })
    expect(entitlements.totalDocs).toBe(1)

    const refreshedOrder = await payload.findByID({ collection: 'orders', id: order.id, overrideAccess: true })
    expect(refreshedOrder.status).toBe('paid')
  })

  it('مبلغ همیشه از رکورد PaymentAttempt خوانده می‌شود، نه از callback (محافظت در برابر دستکاری)', async () => {
    const pkg = await createTestPackage(payload, { priceRial: 5_000_000 })
    const student = await createTestStudent(payload)
    const { providerRefId } = await createPendingOrderAndAttempt(payload, String(student.id), pkg)

    // تلاش برای دستکاری با افزودن amount جعلی در callback — باید نادیده گرفته شود
    const result = await completeOrderPayment(payload, providerRefId, {
      Authority: providerRefId,
      Status: 'OK',
      amount: '1', // پارامتر جعلی که هرگز خوانده نمی‌شود
    })
    expect(result.ok).toBe(true)

    const attempt = (
      await payload.find({ collection: 'payment-attempts', where: { providerRefId: { equals: providerRefId } }, overrideAccess: true })
    ).docs[0]
    expect(attempt?.amountRialSnapshot).toBe(5_000_000)
  })

  it('وضعیت NOK (پرداخت ناموفق) به کاربر دسترسی نمی‌دهد', async () => {
    const pkg = await createTestPackage(payload)
    const student = await createTestStudent(payload)
    const { order, providerRefId } = await createPendingOrderAndAttempt(payload, String(student.id), pkg)

    const result = await completeOrderPayment(payload, providerRefId, { Authority: providerRefId, Status: 'NOK' })
    expect(result.ok).toBe(false)

    const refreshedOrder = await payload.findByID({ collection: 'orders', id: order.id, overrideAccess: true })
    expect(refreshedOrder.status).toBe('failed')

    const entitlements = await payload.find({
      collection: 'entitlements',
      where: { and: [{ student: { equals: student.id } }, { package: { equals: pkg.id } }] },
      overrideAccess: true,
    })
    expect(entitlements.totalDocs).toBe(0)
  })

  it('providerRefId نامعتبر خطای مشخص می‌دهد', async () => {
    const result = await completeOrderPayment(payload, 'NON_EXISTENT_REF', { Authority: 'NON_EXISTENT_REF', Status: 'OK' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('attempt_not_found')
  })
})
