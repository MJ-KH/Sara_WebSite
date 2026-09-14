import type { Metadata } from 'next'
import type React from 'react'
import { AnnouncementBar } from '@/components/site/AnnouncementBar'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { getSiteSettings } from '@/lib/get-site-settings'
import '../globals.css'

// این سایت کاملاً پویا و وابسته به دیتابیس/نشست کاربر است (قیمت، وضعیت فروش، ورود، سبد و ...)
// و نباید در زمان build به‌صورت استاتیک پیش‌تولید شود.
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    title: {
      default: settings.seoDefaults?.metaTitle || settings.brand?.nameFa || 'سارا نقی‌زاده',
      template: `%s | ${settings.brand?.nameFa || 'سارا نقی‌زاده'}`,
    },
    description: settings.seoDefaults?.metaDescription || undefined,
    icons: typeof settings.brand?.favicon === 'object' && settings.brand?.favicon?.url ? [settings.brand.favicon.url] : undefined,
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  const theme = settings.theme || {}
  const logo = typeof settings.brand?.logo === 'object' ? settings.brand?.logo : null

  return (
    <html
      lang="fa"
      dir="rtl"
      data-theme-color={theme.primaryColor || 'gold-dark'}
      data-radius={theme.radius || 'md'}
      data-font-scale={theme.fontScale || 'md'}
      data-button-style={theme.buttonStyle || 'solid'}
    >
      <body className="min-h-screen">
        <AnnouncementBar text={settings.announcementBar?.enabled ? settings.announcementBar.text : null} href={settings.announcementBar?.href} />
        <SiteHeader
          brandName={settings.brand?.nameFa || 'سارا نقی‌زاده'}
          logoUrl={logo?.url}
          menu={(settings.headerMenu || []).map((item) => ({
            label: item.label,
            href: item.href,
            children: item.children?.map((c) => ({ label: c.label, href: c.href })),
          }))}
        />
        <main>{children}</main>
        <SiteFooter
          columns={(settings.footer?.columns || []).map((col) => ({
            title: col.title,
            links: col.links?.map((l) => ({ label: l.label, href: l.href })) || [],
          }))}
          copyrightText={settings.footer?.copyrightText}
          instagramAcademy={settings.instagram?.academyHandle}
          instagramServices={settings.instagram?.servicesHandle}
        />
      </body>
    </html>
  )
}
