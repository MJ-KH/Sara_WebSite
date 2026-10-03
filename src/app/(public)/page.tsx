import type { Metadata } from 'next'
import { PageBlocks } from '@/blocks/BlockRenderer'
import { getPageBySlug } from '@/lib/pages/get-page'
import { JsonLd } from '@/components/seo/JsonLd'
import { getSiteSettings } from '@/lib/get-site-settings'
import { buildPageMetadata } from '@/lib/pages/metadata'
import { siteUrl } from '@/lib/seo/metadata'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('home')
  return buildPageMetadata(page, '/')
}

export default async function HomePage() {
  const page = await getPageBySlug('home')

  if (!page) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">صفحه اصلی هنوز ساخته نشده است</h1>
        <p className="mt-4 text-[var(--color-text-muted)]">
          از پنل مدیریت، بخش «صفحات و ظاهر → صفحات»، صفحه‌ای با نامک <code dir="ltr">home</code> بسازید و منتشر کنید.
        </p>
      </div>
    )
  }

  const settings = await getSiteSettings()
  const url = siteUrl()
  const logo = typeof settings.brand?.logo === 'object' ? settings.brand?.logo?.url : null
  const instagram = [settings.instagram?.academyHandle, settings.instagram?.servicesHandle, settings.instagram?.salonHandle]
    .filter(Boolean)
    .map((handle) => `https://instagram.com/${handle}`)
  return (
    <>
      {/* معرفی آکادمی به موتور جست‌وجو؛ فقط داده‌های واقعی تنظیمات سایت */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: settings.brand?.nameFa || 'سارا نقی‌زاده',
          alternateName: settings.brand?.nameEn || undefined,
          url,
          ...(logo ? { logo: new URL(logo, url).toString() } : {}),
          ...(settings.contact?.phone ? { telephone: settings.contact.phone } : {}),
          ...(instagram.length > 0 ? { sameAs: [...instagram, settings.socials?.youtubeUrl].filter(Boolean) } : {}),
        }}
      />
      <PageBlocks blocks={page.layout || []} />
    </>
  )
}
