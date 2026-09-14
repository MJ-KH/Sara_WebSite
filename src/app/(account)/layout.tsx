import type { Metadata } from 'next'
import Link from 'next/link'
import type React from 'react'
import { AccountLoginGate } from '@/components/auth/AccountLoginGate'
import { getRequestUser } from '@/lib/auth/get-request-user'
import { getSiteSettings } from '@/lib/get-site-settings'
import '../globals.css'

export const metadata: Metadata = { robots: { index: false, follow: false } }
// حساب کاربری کاملاً به نشست و داده لحظه‌ای وابسته است؛ هرگز استاتیک پیش‌تولید نشود.
export const dynamic = 'force-dynamic'

const NAV_ITEMS = [
  { href: '/account/my-packages', label: 'آموزش‌های من' },
  { href: '/account/orders', label: 'سفارش‌ها' },
  { href: '/account/workshops', label: 'ثبت‌نام‌های حضوری' },
  { href: '/account/support', label: 'پشتیبانی' },
  { href: '/account/profile', label: 'پروفایل' },
]

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  const theme = settings.theme || {}
  const user = await getRequestUser()

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
        {user?.collection === 'students' ? (
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row">
            <aside className="flex shrink-0 flex-row gap-2 overflow-x-auto md:w-56 md:flex-col">
              <Link href="/" className="mb-4 hidden text-sm text-[var(--color-text-muted)] md:block">
                ← بازگشت به سایت
              </Link>
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-[var(--radius-base)] px-3 py-2 text-sm hover:bg-[var(--color-accent-soft)]"
                >
                  {item.label}
                </Link>
              ))}
              <form action="/api/auth/logout" method="post" className="mt-4">
                <button type="submit" className="text-sm text-[var(--color-text-muted)] underline">
                  خروج از حساب
                </button>
              </form>
            </aside>
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        ) : (
          <AccountLoginGate />
        )}
      </body>
    </html>
  )
}
