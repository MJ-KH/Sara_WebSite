import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireStudent } from '@/lib/auth/get-request-user'
import { getPayloadClient } from '@/lib/get-payload'
import { createPendingPackageOrder } from '@/lib/orders/create-pending-order'
import { isRateLimited } from '@/lib/rate-limit'

const bodySchema = z.object({ packageSlug: z.string().min(1), discountCode: z.string().optional() })

const ERROR_MESSAGES: Record<string, string> = {
  package_not_found: 'پکیج یافت نشد',
  package_not_purchasable: 'فروش این پکیج در حال حاضر متوقف است',
  already_has_access: 'شما قبلاً به این پکیج دسترسی دارید',
  discount_code_invalid: 'کد تخفیف نامعتبر است',
  discount_code_not_started: 'کد تخفیف هنوز فعال نشده است',
  discount_code_expired: 'کد تخفیف منقضی شده است',
  discount_code_exhausted: 'ظرفیت استفاده از این کد تخفیف تمام شده است',
  discount_code_not_applicable: 'این کد تخفیف برای این پکیج معتبر نیست',
  discount_code_already_used: 'شما قبلاً از این کد تخفیف استفاده کرده‌اید',
}

export async function POST(req: NextRequest) {
  const student = await requireStudent()
  if (!student) return NextResponse.json({ ok: false, message: 'ابتدا وارد حساب کاربری شوید' }, { status: 401 })

  if (isRateLimited(`orders:student:${student.id}`, 10, 5 * 60_000)) {
    return NextResponse.json({ ok: false, message: 'تعداد درخواست بیش از حد مجاز است' }, { status: 429 })
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, message: 'ورودی نامعتبر است' }, { status: 400 })

  const payload = await getPayloadClient()
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || new URL(req.url).origin

  const result = await createPendingPackageOrder(
    payload,
    student,
    parsed.data.packageSlug,
    parsed.data.discountCode || null,
    baseUrl,
  )

  if (!result.ok) {
    return NextResponse.json({ ok: false, message: ERROR_MESSAGES[result.error] || 'خطا در ثبت سفارش' }, { status: 400 })
  }

  return NextResponse.json({ ok: true, redirectUrl: result.redirectUrl, orderId: result.orderId })
}
