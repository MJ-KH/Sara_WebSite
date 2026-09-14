import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireStudent } from '@/lib/auth/get-request-user'
import { getPayloadClient } from '@/lib/get-payload'

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal('')),
  city: z.string().optional(),
  skillLevel: z.enum(['beginner', 'experienced', 'professional']).optional(),
  interests: z.array(z.enum(['powder_gel', 'extensions', 'nail_art', 'troubleshooting', 'manicure_prep'])).optional(),
  marketingConsent: z.boolean().optional(),
  birthdayJalali: z.object({ day: z.number(), month: z.number(), year: z.number().optional() }).optional(),
})

export async function PATCH(req: NextRequest) {
  const student = await requireStudent()
  if (!student) return NextResponse.json({ ok: false, message: 'ابتدا وارد حساب کاربری شوید' }, { status: 401 })

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, message: 'اطلاعات نامعتبر است' }, { status: 400 })

  const payload = await getPayloadClient()
  await payload.update({
    collection: 'students',
    id: student.id,
    data: parsed.data,
    overrideAccess: true,
  })

  return NextResponse.json({ ok: true })
}
