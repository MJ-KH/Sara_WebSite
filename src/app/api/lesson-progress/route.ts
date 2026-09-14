import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireStudent } from '@/lib/auth/get-request-user'
import { getPayloadClient } from '@/lib/get-payload'
import { checkLessonAccess } from '@/lib/lessons/check-access'
import { upsertLessonProgress } from '@/lib/progress/upsert-progress'

const bodySchema = z.object({
  lessonId: z.string().min(1),
  positionSeconds: z.number().min(0),
  completed: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  const student = await requireStudent()
  if (!student) return NextResponse.json({ ok: false, message: 'ابتدا وارد حساب کاربری شوید' }, { status: 401 })

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, message: 'ورودی نامعتبر است' }, { status: 400 })

  const payload = await getPayloadClient()
  const access = await checkLessonAccess(payload, parsed.data.lessonId, student.id)
  if (!access.ok) return NextResponse.json({ ok: false, message: 'دسترسی به این درس ندارید' }, { status: 403 })

  await upsertLessonProgress(
    payload,
    student.id,
    parsed.data.lessonId,
    Math.floor(parsed.data.positionSeconds),
    Boolean(parsed.data.completed),
  )

  return NextResponse.json({ ok: true })
}
