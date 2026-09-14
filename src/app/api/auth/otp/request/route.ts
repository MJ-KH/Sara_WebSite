import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requestOtp } from '@/lib/auth/otp'
import { getPayloadClient } from '@/lib/get-payload'
import { normalizeIranMobile } from '@/lib/phone'
import { isRateLimited } from '@/lib/rate-limit'
import { getSmsProvider } from '@/lib/sms'

const bodySchema = z.object({ mobile: z.string().min(5) })

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  if (isRateLimited(`otp-request:ip:${ip}`, 10, 10 * 60_000)) {
    return NextResponse.json({ ok: false, message: 'تعداد درخواست بیش از حد مجاز است. کمی صبر کنید.' }, { status: 429 })
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: 'شماره موبایل نامعتبر است' }, { status: 400 })
  }

  const mobile = normalizeIranMobile(parsed.data.mobile)
  if (!mobile) {
    return NextResponse.json({ ok: false, message: 'شماره موبایل معتبر ایران وارد کنید' }, { status: 400 })
  }

  if (isRateLimited(`otp-request:mobile:${mobile}`, 5, 10 * 60_000)) {
    return NextResponse.json({ ok: false, message: 'تعداد درخواست بیش از حد مجاز است. کمی صبر کنید.' }, { status: 429 })
  }

  const payload = await getPayloadClient()
  const result = await requestOtp(payload, mobile)
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: `لطفاً ${result.retryAfterSeconds} ثانیه دیگر دوباره تلاش کنید`, retryAfterSeconds: result.retryAfterSeconds },
      { status: 429 },
    )
  }

  const sms = getSmsProvider()
  await sms.send({ toE164: mobile, body: `کد ورود شما به سایت سارا نقی‌زاده: ${result.code}`, category: 'otp' })

  // فقط برای آزمون خودکار (Playwright) در محیط غیرعملیاتی: کد در پاسخ برگردانده می‌شود تا
  // تست بدون خواندن پیامک واقعی بتواند وارد شود. در تولید همیشه غیرفعال است.
  const debugCode =
    process.env.NODE_ENV !== 'production' && process.env.ALLOW_OTP_DEBUG_RESPONSE === 'true' ? result.code : undefined

  return NextResponse.json({ ok: true, ttlSeconds: result.ttlSeconds, debugCode })
}
