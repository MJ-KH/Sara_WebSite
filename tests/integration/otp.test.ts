import { beforeAll, describe, expect, it } from 'vitest'
import { requestOtp, verifyOtp } from '@/lib/auth/otp'
import { getTestPayload, randomSuffix } from './helpers'

describe('OTP flow (acceptance #10)', () => {
  let payload: Awaited<ReturnType<typeof getTestPayload>>
  const mobile = `+9891${randomSuffix()}`.slice(0, 13)

  beforeAll(async () => {
    payload = await getTestPayload()
  })

  it('کد تکراری قبل از انقضای cooldown رد می‌شود', async () => {
    const first = await requestOtp(payload, mobile)
    expect(first.ok).toBe(true)
    const second = await requestOtp(payload, mobile)
    expect(second.ok).toBe(false)
  })

  it('کد نادرست، تلاش را افزایش می‌دهد و در نهایت رد می‌شود', async () => {
    const localMobile = `+9892${randomSuffix()}`.slice(0, 13)
    const requested = await requestOtp(payload, localMobile)
    expect(requested.ok).toBe(true)

    for (let i = 0; i < 5; i++) {
      const result = await verifyOtp(payload, localMobile, '00000')
      expect(result.ok).toBe(false)
    }

    // حتی با کد درست، چون تلاش‌ها تمام شده، رد می‌شود
    if (requested.ok) {
      const finalTry = await verifyOtp(payload, localMobile, requested.code)
      expect(finalTry.ok).toBe(false)
      if (!finalTry.ok) expect(finalTry.error).toBe('too_many_attempts')
    }
  })

  it('کد یک‌بار مصرف است — استفاده دوباره رد می‌شود', async () => {
    const localMobile = `+9893${randomSuffix()}`.slice(0, 13)
    const requested = await requestOtp(payload, localMobile)
    expect(requested.ok).toBe(true)
    if (!requested.ok) return

    const firstVerify = await verifyOtp(payload, localMobile, requested.code)
    expect(firstVerify.ok).toBe(true)

    const secondVerify = await verifyOtp(payload, localMobile, requested.code)
    expect(secondVerify.ok).toBe(false)
    if (!secondVerify.ok) expect(secondVerify.error).toBe('already_used')
  })

  it('کد منقضی‌شده رد می‌شود', async () => {
    const localMobile = `+9894${randomSuffix()}`.slice(0, 13)
    const requested = await requestOtp(payload, localMobile)
    expect(requested.ok).toBe(true)
    if (!requested.ok) return

    // انقضا را دستی به گذشته می‌بریم تا بدون نیاز به sleep واقعی تست شود
    const record = (
      await payload.find({ collection: 'otp-codes', where: { mobile: { equals: localMobile } }, sort: '-createdAt', limit: 1, overrideAccess: true })
    ).docs[0]
    expect(record).toBeDefined()
    await payload.update({
      collection: 'otp-codes',
      id: record!.id,
      data: { expiresAt: new Date(Date.now() - 1000).toISOString() },
      overrideAccess: true,
    })

    const result = await verifyOtp(payload, localMobile, requested.code)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('expired')
  })
})
