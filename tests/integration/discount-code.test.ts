import { beforeAll, describe, expect, it } from 'vitest'
import { computePackagePrice } from '@/lib/orders/pricing'
import { createTestPackage, createTestStudent, getTestPayload, randomSuffix } from './helpers'

describe('محاسبه قیمت و کد تخفیف (سمت سرور)', () => {
  let payload: Awaited<ReturnType<typeof getTestPayload>>

  beforeAll(async () => {
    payload = await getTestPayload()
  })

  it('بدون کد تخفیف، مبلغ نهایی برابر قیمت پایه است', async () => {
    const pkg = await createTestPackage(payload, { priceRial: 1_000_000 })
    const student = await createTestStudent(payload)
    const result = await computePackagePrice(payload, pkg, String(student.id), null)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.price.totalRial).toBe(1_000_000)
  })

  it('کد تخفیف نامعتبر رد می‌شود', async () => {
    const pkg = await createTestPackage(payload, { priceRial: 1_000_000 })
    const student = await createTestStudent(payload)
    const result = await computePackagePrice(payload, pkg, String(student.id), 'NOT_A_REAL_CODE')
    expect(result.ok).toBe(false)
  })

  it('کد تخفیف منقضی‌شده رد می‌شود', async () => {
    const code = `EXPIRED${randomSuffix()}`.toUpperCase()
    await payload.create({
      collection: 'discount-codes',
      data: { code, type: 'percent', value: 10, validTo: new Date(Date.now() - 86_400_000).toISOString(), active: true },
      overrideAccess: true,
    })
    const pkg = await createTestPackage(payload, { priceRial: 1_000_000 })
    const student = await createTestStudent(payload)
    const result = await computePackagePrice(payload, pkg, String(student.id), code)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('discount_code_expired')
  })

  it('کد تخفیف معتبر درصد را درست کم می‌کند', async () => {
    const code = `VALID${randomSuffix()}`.toUpperCase()
    await payload.create({
      collection: 'discount-codes',
      data: { code, type: 'percent', value: 20, active: true },
      overrideAccess: true,
    })
    const pkg = await createTestPackage(payload, { priceRial: 1_000_000 })
    const student = await createTestStudent(payload)
    const result = await computePackagePrice(payload, pkg, String(student.id), code)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.price.discountAmountRial).toBe(200_000)
      expect(result.price.totalRial).toBe(800_000)
    }
  })

  it('سقف استفاده کل رعایت می‌شود', async () => {
    const code = `MAXED${randomSuffix()}`.toUpperCase()
    await payload.create({
      collection: 'discount-codes',
      data: { code, type: 'percent', value: 10, active: true, maxUses: 1, usedCount: 1 },
      overrideAccess: true,
    })
    const pkg = await createTestPackage(payload, { priceRial: 1_000_000 })
    const student = await createTestStudent(payload)
    const result = await computePackagePrice(payload, pkg, String(student.id), code)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('discount_code_exhausted')
  })
})
