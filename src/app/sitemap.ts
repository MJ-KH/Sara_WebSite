import type { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/get-payload'

// در زمان build به دیتابیس واقعی متصل نیست (image قابل‌حمل)؛ sitemap باید در زمان اجرا
// و از داده زنده ساخته شود، نه در زمان build.
export const dynamic = 'force-dynamic'

/** فقط محتوای منتشرشده و بدون noindex در sitemap قرار می‌گیرد؛ پیش‌نویس هرگز وارد نمی‌شود. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const payload = await getPayloadClient()

  const entries: MetadataRoute.Sitemap = [{ url: baseUrl, changeFrequency: 'weekly', priority: 1 }]

  const pages = await payload.find({ collection: 'pages', where: { _status: { equals: 'published' } }, limit: 500 })
  for (const page of pages.docs) {
    if (page.seo?.noIndex) continue
    if (page.slug === 'home') continue
    entries.push({ url: `${baseUrl}/${page.slug}`, lastModified: page.updatedAt })
  }

  const packages = await payload.find({ collection: 'packages', where: { status: { equals: 'published' } }, limit: 500 })
  for (const pkg of packages.docs) {
    entries.push({ url: `${baseUrl}/packages/${pkg.slug}`, lastModified: pkg.updatedAt })
  }

  const freeLessons = await payload.find({ collection: 'free-lessons', where: { status: { equals: 'published' } }, limit: 500 })
  for (const item of freeLessons.docs) {
    entries.push({ url: `${baseUrl}/free-lessons/${item.slug}`, lastModified: item.updatedAt })
  }

  const workshops = await payload.find({ collection: 'workshops', where: { status: { equals: 'published' } }, limit: 200 })
  for (const workshop of workshops.docs) {
    entries.push({ url: `${baseUrl}/workshops/${workshop.slug}`, lastModified: workshop.updatedAt })
  }

  entries.push({ url: `${baseUrl}/packages` }, { url: `${baseUrl}/free-lessons` }, { url: `${baseUrl}/workshops` }, { url: `${baseUrl}/contact` })

  return entries
}
