import crypto from 'node:crypto'
import type { Payload } from 'payload'

const CODE_LENGTH = Number(process.env.OTP_CODE_LENGTH || 5)
const TTL_SECONDS = Number(process.env.OTP_TTL_SECONDS || 120)
const MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5)
const RESEND_COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 60)

function getPepper(): string {
  const secret = process.env.STUDENT_JWT_SECRET
  if (!secret || secret.length < 16) throw new Error('STUDENT_JWT_SECRET تنظیم نشده یا خیلی کوتاه است')
  return secret
}

function hashCode(mobileE164: string, code: string): string {
  return crypto.createHmac('sha256', getPepper()).update(`${mobileE164}:${code}`).digest('hex')
}

function codesMatch(hashA: string, hashB: string): boolean {
  const bufA = Buffer.from(hashA, 'hex')
  const bufB = Buffer.from(hashB, 'hex')
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

function generateCode(): string {
  const max = 10 ** CODE_LENGTH
  return crypto.randomInt(0, max).toString().padStart(CODE_LENGTH, '0')
}

export type RequestOtpResult =
  | { ok: true; code: string; ttlSeconds: number }
  | { ok: false; error: 'cooldown'; retryAfterSeconds: number }

/**
 * کد جدید می‌سازد و در دیتابیس ذخیره می‌کند. کد فقط به فراخوان (برای ارسال از طریق
 * SmsProvider) برگردانده می‌شود و هرگز نباید مستقیماً در پاسخ HTTP قرار گیرد.
 */
export async function requestOtp(payload: Payload, mobileE164: string): Promise<RequestOtpResult> {
  const recent = await payload.find({
    collection: 'otp-codes',
    where: { mobile: { equals: mobileE164 } },
    sort: '-createdAt',
    limit: 1,
    overrideAccess: true,
  })
  const last = recent.docs[0]
  if (last) {
    const elapsedSeconds = (Date.now() - new Date(last.createdAt as string).getTime()) / 1000
    if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
      return { ok: false, error: 'cooldown', retryAfterSeconds: Math.ceil(RESEND_COOLDOWN_SECONDS - elapsedSeconds) }
    }
  }

  const code = generateCode()
  const expiresAt = new Date(Date.now() + TTL_SECONDS * 1000).toISOString()

  await payload.create({
    collection: 'otp-codes',
    data: {
      mobile: mobileE164,
      codeHash: hashCode(mobileE164, code),
      expiresAt,
      attempts: 0,
      consumedAt: null,
    },
    overrideAccess: true,
  })

  return { ok: true, code, ttlSeconds: TTL_SECONDS }
}

export type VerifyOtpResult =
  | { ok: true }
  | { ok: false; error: 'not_found' | 'expired' | 'too_many_attempts' | 'invalid_code' | 'already_used' }

export async function verifyOtp(payload: Payload, mobileE164: string, code: string): Promise<VerifyOtpResult> {
  const result = await payload.find({
    collection: 'otp-codes',
    where: { mobile: { equals: mobileE164 } },
    sort: '-createdAt',
    limit: 1,
    overrideAccess: true,
  })
  const record = result.docs[0]
  if (!record) return { ok: false, error: 'not_found' }
  if (record.consumedAt) return { ok: false, error: 'already_used' }
  if (new Date(record.expiresAt as string).getTime() < Date.now()) return { ok: false, error: 'expired' }
  if ((record.attempts as number) >= MAX_ATTEMPTS) return { ok: false, error: 'too_many_attempts' }

  const isValid = codesMatch(hashCode(mobileE164, code), record.codeHash as string)
  if (!isValid) {
    await payload.update({
      collection: 'otp-codes',
      id: record.id,
      data: { attempts: (record.attempts as number) + 1 },
      overrideAccess: true,
    })
    return { ok: false, error: 'invalid_code' }
  }

  await payload.update({
    collection: 'otp-codes',
    id: record.id,
    data: { consumedAt: new Date().toISOString() },
    overrideAccess: true,
  })
  return { ok: true }
}

export function otpResendCooldownSeconds(): number {
  return RESEND_COOLDOWN_SECONDS
}
