import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/get-site-settings'

/** آدرس پایه سایت برای لینک‌های کامل (canonical، OG، اسکیما) */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')
}

export type SeoInput = {
  title?: string | null
  description?: string | null
  /** مسیر صفحه، مثل /packages/kasht-poodr؛ canonical و آدرس OG از آن ساخته می‌شود */
  path: string
  /** تصویر پیش‌نمایش لینک (تلگرام، واتساپ…)؛ نباشد، تصویر پیش‌فرض تنظیمات سایت */
  image?: string | null
  noIndex?: boolean
  /** عنوان کامل بدون پسوند «| سارا نقی‌زاده» (برای صفحه اول که نام برند خودش در عنوان است) */
  absoluteTitle?: boolean
}

/**
 * متادیتای یکسان همه صفحه‌ها: عنوان، توضیح، canonical و پیش‌نمایش لینک (Open Graph).
 * openGraph در Next با والد ادغام نمی‌شود و جایگزینش می‌شود؛ برای همین نام سایت و زبان
 * هر بار همین‌جا کامل ساخته می‌شود.
 */
export async function buildSeoMetadata({ title, description, path, image, noIndex, absoluteTitle }: SeoInput): Promise<Metadata> {
  const settings = await getSiteSettings()
  const siteName = settings.brand?.nameFa || 'سارا نقی‌زاده'
  const defaultImage = typeof settings.seoDefaults?.ogImage === 'object' ? settings.seoDefaults?.ogImage?.url : null
  const ogImage = image || defaultImage
  return {
    ...(title ? { title: absoluteTitle ? { absolute: title } : title } : {}),
    ...(description ? { description } : {}),
    alternates: { canonical: path },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'website',
      locale: 'fa_IR',
      siteName,
      url: path,
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: { card: ogImage ? 'summary_large_image' : 'summary' },
  }
}
