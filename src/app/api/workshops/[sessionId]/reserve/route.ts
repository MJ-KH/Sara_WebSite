import { type NextRequest, NextResponse } from 'next/server'
import { requireStudent } from '@/lib/auth/get-request-user'
import { getPayloadClient } from '@/lib/get-payload'
import { isRateLimited } from '@/lib/rate-limit'
import { createPendingWorkshopOrder } from '@/lib/workshops/create-pending-workshop-order'

const ERROR_MESSAGES: Record<string, string> = {
  session_not_open: 'این نوبت برای ثبت‌نام باز نیست',
  sold_out: 'ظرفیت این نوبت تکمیل شده است',
  conflict_retry_exhausted: 'در حال حاضر درخواست‌های زیادی هم‌زمان در حال ثبت‌نام هستند، دوباره تلاش کنید',
  already_enrolled: 'شما قبلاً در این نوبت ثبت‌نام کرده‌اید',
}

export async function POST(req: NextRequest, context: { params: Promise<{ sessionId: string }> }) {
  const student = await requireStudent()
  if (!student) return NextResponse.json({ ok: false, message: 'ابتدا وارد حساب کاربری شوید' }, { status: 401 })

  if (isRateLimited(`workshop-reserve:student:${student.id}`, 10, 5 * 60_000)) {
    return NextResponse.json({ ok: false, message: 'تعداد درخواست بیش از حد مجاز است' }, { status: 429 })
  }

  const { sessionId } = await context.params
  const payload = await getPayloadClient()
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || new URL(req.url).origin

  const result = await createPendingWorkshopOrder(payload, student, sessionId, baseUrl)
  if (!result.ok) {
    return NextResponse.json({ ok: false, message: ERROR_MESSAGES[result.error] || 'خطا در ثبت‌نام' }, { status: 400 })
  }

  return NextResponse.json({ ok: true, redirectUrl: result.redirectUrl, orderId: result.orderId })
}
