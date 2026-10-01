import type { Metadata } from 'next'
import Link from 'next/link'
import type React from 'react'
import { AccountNav } from '@/components/account/AccountNav'
import { AccountLoginGate } from '@/components/auth/AccountLoginGate'
import { FontPreload } from '@/components/site/FontPreload'
import { getRequestUser } from '@/lib/auth/get-request-user'
import { toPersianDigits } from '@/lib/digits'
import { getSiteSettings } from '@/lib/get-site-settings'
import '../globals.css'

export const metadata: Metadata = { robots: { index: false, follow: false } }
// حساب کاربری کاملاً به نشست و داده لحظه‌ای وابسته است؛ هرگز استاتیک پیش‌تولید نشود.
export const dynamic = 'force-dynamic'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  const theme = settings.theme || {}
  const user = await getRequestUser()
  const brandName = settings.brand?.nameFa || 'سارا نقی‌زاده'

  return (
    <html
      lang="fa"
      dir="rtl"
      data-theme-color={theme.primaryColor || 'gold-dark'}
      data-radius={theme.radius || 'md'}
      data-font-scale={theme.fontScale || 'md'}
      data-button-style={theme.buttonStyle || 'solid'}
    >
      <head>
        <FontPreload />
      </head>
      <body className="min-h-screen">
        {user?.collection === 'students' ? (
          <div className="flex min-h-screen flex-col">
            <header className="band-alt">
              <div className="container-x flex items-center justify-between gap-3 py-4">
                <Link href="/" className="font-bold">
                  {brandName}
                </Link>
                <div className="flex items-center gap-2">
                  <Link href="/" className="btn btn-ghost btn-sm bg-[var(--color-surface)]">
                    → بازگشت به سایت
                  </Link>
                  <form action="/api/auth/logout" method="post">
                    <button type="submit" className="btn btn-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                      خروج
                    </button>
                  </form>
                </div>
              </div>
              <div className="container-x pb-8 pt-2 md:pb-10">
                <h1 className="title-1">سلام{user.name ? `، ${user.name}` : ''}</h1>
                <p className="mt-1 text-[0.9375rem] text-[var(--color-text-muted)]">
                  حساب کاربری <span dir="ltr">{toPersianDigits(user.mobile.replace(/^\+98/, '0'))}</span>
                </p>
              </div>
            </header>
            <div className="container-x grid flex-1 grid-cols-1 content-start gap-6 py-6 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-10 md:py-10">
              <aside className="min-w-0 md:sticky md:top-6 md:self-start">
                <AccountNav />
              </aside>
              <main className="min-w-0">{children}</main>
            </div>
          </div>
        ) : (
          <AccountLoginGate brandName={brandName} />
        )}
      </body>
    </html>
  )
}
