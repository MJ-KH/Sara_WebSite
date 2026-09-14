import { NextResponse } from 'next/server'
import { getRequestUser } from '@/lib/auth/get-request-user'
import { getPayloadClient } from '@/lib/get-payload'
import { checkLessonAccess } from '@/lib/lessons/check-access'
import { getSignedPrivateMediaUrl } from '@/lib/media/signed-url'

const SIGNED_URL_TTL_SECONDS = 300

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const user = await getRequestUser()
  const studentId = user?.collection === 'students' ? user.id : null

  const payload = await getPayloadClient()
  const access = await checkLessonAccess(payload, id, studentId)
  if (!access.ok) {
    const status = access.error === 'not_found' ? 404 : 403
    const message = access.error === 'not_found' ? 'درس یافت نشد' : 'برای تماشای این درس باید پکیج مربوطه را خریداری کنید'
    return NextResponse.json({ ok: false, message }, { status })
  }

  const videoField = access.lesson.videoPrivate as { filename?: string } | string | null
  if (!videoField || typeof videoField === 'string' || !videoField.filename) {
    return NextResponse.json({ ok: false, message: 'ویدئوی این درس هنوز بارگذاری نشده است' }, { status: 404 })
  }

  const url = await getSignedPrivateMediaUrl(videoField.filename, SIGNED_URL_TTL_SECONDS)
  return NextResponse.json({ ok: true, url, expiresInSeconds: SIGNED_URL_TTL_SECONDS })
}
