import type { Metadata } from 'next'
import { buildSeoMetadata } from '@/lib/seo/metadata'

/** متادیتای صفحه‌های صفحه‌ساز؛ canonical پیش‌فرض همان مسیر صفحه است مگر مدیر در پنل عوضش کرده باشد. */
export function buildPageMetadata(page: any, path: string): Promise<Metadata> {
  const seo = page?.seo || {}
  return buildSeoMetadata({
    title: seo.metaTitle || page?.title,
    description: seo.metaDescription,
    path: seo.canonicalPath || path,
    image: typeof seo.ogImage === 'object' ? seo.ogImage?.url : null,
    noIndex: Boolean(seo.noIndex),
  })
}
