import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireStudent } from '@/lib/auth/get-request-user'
import { getPayloadClient } from '@/lib/get-payload'

const bodySchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
  relatedOrder: z.string().optional(),
  relatedPackage: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const student = await requireStudent()
  if (!student) return NextResponse.json({ ok: false, message: 'ابتدا وارد حساب کاربری شوید' }, { status: 401 })

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, message: 'اطلاعات ناقص است' }, { status: 400 })

  const payload = await getPayloadClient()
  const ticket = await payload.create({
    collection: 'support-tickets',
    data: {
      student: student.id,
      subject: parsed.data.subject,
      relatedOrder: parsed.data.relatedOrder ? Number(parsed.data.relatedOrder) : undefined,
      relatedPackage: parsed.data.relatedPackage ? Number(parsed.data.relatedPackage) : undefined,
      status: 'open',
      messages: [{ from: 'student', body: parsed.data.body, createdAt: new Date().toISOString() }],
    },
    overrideAccess: true,
  })

  return NextResponse.json({ ok: true, ticketId: ticket.id })
}
