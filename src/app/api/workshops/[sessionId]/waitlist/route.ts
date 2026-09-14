import { NextResponse } from 'next/server'
import { requireStudent } from '@/lib/auth/get-request-user'
import { getPayloadClient } from '@/lib/get-payload'

export async function POST(_req: Request, context: { params: Promise<{ sessionId: string }> }) {
  const student = await requireStudent()
  if (!student) return NextResponse.json({ ok: false, message: 'ابتدا وارد حساب کاربری شوید' }, { status: 401 })

  const { sessionId } = await context.params
  const payload = await getPayloadClient()

  const existing = await payload.find({
    collection: 'workshop-waitlist',
    where: { and: [{ session: { equals: sessionId } }, { student: { equals: student.id } }] },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.totalDocs > 0) return NextResponse.json({ ok: true, alreadyJoined: true })

  await payload.create({
    collection: 'workshop-waitlist',
    data: { session: Number(sessionId), student: student.id, joinedAt: new Date().toISOString() },
    overrideAccess: true,
  })

  return NextResponse.json({ ok: true })
}
