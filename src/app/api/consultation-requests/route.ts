import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getRequestUser } from '@/lib/auth/get-request-user'
import { getPayloadClient } from '@/lib/get-payload'
import { normalizeIranMobile } from '@/lib/phone'
import { isRateLimited } from '@/lib/rate-limit'

const bodySchema = z.object({
  name: z.string().min(1),
  mobile: z.string().min(5),
  city: z.string().optional(),
  skillLevel: z.string().optional(),
  goal: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  if (isRateLimited(`consultation:ip:${ip}`, 5, 10 * 60_000)) {
    return NextResponse.json({ ok: false, message: 'تعداد درخواست بیش از حد مجاز است' }, { status: 429 })
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, message: 'اطلاعات ارسالی ناقص است' }, { status: 400 })

  const mobile = normalizeIranMobile(parsed.data.mobile)
  if (!mobile) return NextResponse.json({ ok: false, message: 'شماره موبایل معتبر ایران وارد کنید' }, { status: 400 })

  const payload = await getPayloadClient()
  const user = await getRequestUser()

  await payload.create({
    collection: 'consultation-requests',
    data: {
      name: parsed.data.name,
      mobile,
      city: parsed.data.city,
      skillLevel: parsed.data.skillLevel,
      goal: parsed.data.goal,
      linkedStudent: user?.collection === 'students' ? user.id : undefined,
      status: 'new',
    },
    overrideAccess: true,
  })

  return NextResponse.json({ ok: true })
}
