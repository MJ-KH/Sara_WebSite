import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyOtp } from '@/lib/auth/otp'
import { getStudentSessionCookieName, signStudentSessionToken, STUDENT_SESSION_MAX_AGE_SECONDS } from '@/lib/auth/student-jwt'
import { getPayloadClient } from '@/lib/get-payload'
import { normalizeIranMobile } from '@/lib/phone'
import { isRateLimited } from '@/lib/rate-limit'

const bodySchema = z.object({ mobile: z.string().min(5), code: z.string().min(3) })

const ERROR_MESSAGES: Record<string, string> = {
  not_found: 'ابتدا کد را درخواست کنید',
  expired: 'کد منقضی شده است، دوباره درخواست دهید',
  too_many_attempts: 'تعداد تلاش بیش از حد مجاز است، کد جدید بگیرید',
  invalid_code: 'کد وارد‌شده نادرست است',
  already_used: 'این کد قبلاً استفاده شده است',
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  if (isRateLimited(`otp-verify:ip:${ip}`, 30, 10 * 60_000)) {
    return NextResponse.json({ ok: false, message: 'تعداد تلاش بیش از حد مجاز است' }, { status: 429 })
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, message: 'ورودی نامعتبر است' }, { status: 400 })

  const mobile = normalizeIranMobile(parsed.data.mobile)
  if (!mobile) return NextResponse.json({ ok: false, message: 'شماره موبایل نامعتبر است' }, { status: 400 })

  const payload = await getPayloadClient()
  const result = await verifyOtp(payload, mobile, parsed.data.code)
  if (!result.ok) {
    return NextResponse.json({ ok: false, message: ERROR_MESSAGES[result.error] || 'خطا در تأیید کد' }, { status: 400 })
  }

  const existing = await payload.find({
    collection: 'students',
    where: { mobile: { equals: mobile } },
    limit: 1,
    overrideAccess: true,
  })
  let student = existing.docs[0]
  if (!student) {
    student = await payload.create({ collection: 'students', data: { mobile, status: 'active' }, overrideAccess: true })
  }
  if (student.status === 'blocked') {
    return NextResponse.json({ ok: false, message: 'دسترسی این حساب مسدود شده است. با پشتیبانی تماس بگیرید.' }, { status: 403 })
  }

  const token = await signStudentSessionToken(String(student.id))
  const response = NextResponse.json({ ok: true, studentId: student.id })
  response.cookies.set(getStudentSessionCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: STUDENT_SESSION_MAX_AGE_SECONDS,
  })
  return response
}
