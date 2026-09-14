import { draftMode } from 'next/headers'
import { getRequestUser } from '@/lib/auth/get-request-user'
import { getPayloadClient } from '@/lib/get-payload'

/**
 * پیش‌نمایش پیش‌نویس فقط برای مدیر/پشتیبان احرازشده فعال است، نه صرفاً با روشن‌بودن
 * draftMode — تا لینک preview بدون ورود معتبر محتوای منتشرنشده را افشا نکند.
 */
export async function getPageBySlug(slug: string) {
  const payload = await getPayloadClient()
  const { isEnabled: previewRequested } = await draftMode()

  let allowDraft = false
  if (previewRequested) {
    const user = await getRequestUser()
    allowDraft = user?.collection === 'admin-users'
  }

  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    draft: allowDraft,
    overrideAccess: allowDraft,
    limit: 1,
    depth: 2,
  })

  return result.docs[0] ?? null
}
