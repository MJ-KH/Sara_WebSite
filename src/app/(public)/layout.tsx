import type { Metadata } from 'next'
import type React from 'react'
import { AnnouncementBar } from '@/components/site/AnnouncementBar'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { SocialRail } from '@/components/site/SocialRail'
import { getRequestUser } from '@/lib/auth/get-request-user'
import { whatsappLink } from '@/lib/display'
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
  const user = await getRequestUser()
  const contact = settings.contact || {}
  const whatsapp = whatsappLink(contact.whatsapp, contact.whatsappGreeting)

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
          tagline={settings.brand?.tagline || 'آموزش تخصصی ناخن'}
          logoUrl={logo?.url}
          isStudentLoggedIn={user?.collection === 'students'}
          menu={(settings.headerMenu || []).map((item) => ({
            label: item.label,
            href: item.href,
            children: item.children?.map((c) => ({ label: c.label, href: c.href })),
          }))}
        />
        <main>{children}</main>
        <SocialRail academy={settings.instagram?.academyHandle} whatsapp={whatsapp} youtube={settings.socials?.youtubeUrl} />
        <SiteFooter
          brandName={settings.brand?.nameFa || 'سارا نقی‌زاده'}
          tagline={settings.brand?.tagline || 'آموزش تخصصی ناخن'}
          phone={contact.phone}
          landline={contact.landline}
          whatsapp={whatsapp}
          columns={(settings.footer?.columns || []).map((col) => ({
            title: col.title,
            links: col.links?.map((l) => ({ label: l.label, href: l.href })) || [],
          }))}
          copyrightText={settings.footer?.copyrightText}
          instagram={[
            { handle: settings.instagram?.academyHandle, label: 'آکادمی آموزش' },
            { handle: settings.instagram?.servicesHandle, label: 'خدمات ناخن' },
            { handle: settings.instagram?.salonHandle, label: 'سالن زیبایی' },
          ]}
          youtube={settings.socials?.youtubeUrl}
          telegram={settings.socials?.telegramHandle}
        />
      </body>
    </html>
  )
}
