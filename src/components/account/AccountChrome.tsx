'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type React from 'react'
import { toPersianDigits } from '@/lib/digits'

type Logo = { url: string; width: number; height: number } | null

const ACCOUNT_HOME = '/account'

/** دکمه بازگشت نوار بالا: کپسول کوچک با خط دور، تا مثل دکمه دیده شود نه متن ساده */
const BACK_BUTTON =
  'min-h-10 items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3.5 text-[0.875rem] text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'

function isAccountHome(pathname: string) {
  return pathname === ACCOUNT_HOME || pathname === `${ACCOUNT_HOME}/`
}

/**
 * نوار بالای حساب: راه بازگشت (در صفحه اول حساب به سایت، در صفحه‌های داخلی به «حساب من») و لوگو وسط.
 */
export function AccountTopBar({ logo, brandName }: { logo: Logo; brandName: string }) {
  const pathname = usePathname()
  const home = isAccountHome(pathname)
  return (
    <header className="container-x relative flex h-16 items-center justify-between md:h-20">
      <Link
        href={home ? '/' : ACCOUNT_HOME}
        className={`${BACK_BUTTON} ${home ? 'flex' : 'flex md:hidden'}`}
      >
        <span aria-hidden="true">→</span>
        {home ? (
          <>
            <span className="md:hidden">سایت</span>
            <span className="hidden md:inline">بازگشت به سایت</span>
          </>
        ) : (
          'حساب من'
        )}
      </Link>
      {/* در دسکتاپ صفحه‌های داخلی هم منوی کنار را دارند؛ بازگشت به سایت آنجا همیشه دیده شود */}
      {!home ? (
        <Link href="/" className={`${BACK_BUTTON} hidden md:flex`}>
          <span aria-hidden="true">→</span>
          بازگشت به سایت
        </Link>
      ) : null}
      <Link href="/" className="absolute left-1/2 -translate-x-1/2" aria-label={brandName}>
        {logo ? (
          <Image src={logo.url} alt="" width={logo.width} height={logo.height} priority className="h-8 w-auto md:h-10" />
        ) : (
          <span className="font-semibold">{brandName}</span>
        )}
      </Link>
      <span aria-hidden="true" />
    </header>
  )
}

/**
 * چیدمان حساب. موبایل: صفحه اول حساب فقط کارت عضویت و منو را نشان می‌دهد و هر بخش صفحه جدای خودش است
 * (مثل اپلیکیشن). دسکتاپ: کارت و منو همیشه ستون کنار، محتوا ستون اصلی.
 */
export function AccountFrame({ sidebar, children }: { sidebar: React.ReactNode; children: React.ReactNode }) {
  const pathname = usePathname()
  const home = isAccountHome(pathname)
  return (
    <div className="container-x grid flex-1 grid-cols-1 content-start gap-8 pb-12 pt-1 md:grid-cols-[20rem_minmax(0,1fr)] md:gap-12 md:pt-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <aside className={`min-w-0 md:sticky md:top-6 md:block md:self-start ${home ? 'block' : 'hidden'}`}>{sidebar}</aside>
      <main className={`min-w-0 ${home ? 'hidden md:block' : 'block'}`}>{children}</main>
    </div>
  )
}

export type AccountMenuItem = { href: string; label: string; hint: string; icon: 'play' | 'bag' | 'chat' | 'user' | 'calendar'; badge?: number }

const ICON_PATHS: Record<AccountMenuItem['icon'], string> = {
  play: 'M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5zM10 9l5 3-5 3z',
  bag: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2',
  chat: 'M4 5h16v11H9l-5 4z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0',
  calendar: 'M5 6h14v14H5zM5 10h14M9 3v4M15 3v4',
}

/** منوی ردیفی حساب: آیکن در دایره صورتی، عنوان و توضیح کوتاه، شمارنده و فلش. */
export function AccountMenu({ items }: { items: AccountMenuItem[] }) {
  const pathname = usePathname()
  return (
    <nav aria-label="منوی حساب کاربری" className="overflow-hidden rounded-[1.125rem] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <ul>
        {items.map((item) => {
          // صفحه اول حساب در دسکتاپ همان «دوره‌های من» را نشان می‌دهد
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`) || (isAccountHome(pathname) && item.href === '/account/my-packages')
          return (
            <li key={item.href} className="border-b border-[var(--color-border)] last:border-b-0">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-[4.5rem] items-center gap-3.5 px-4 transition-colors hover:bg-[var(--color-bg-alt)] ${active ? 'md:bg-[var(--color-accent-soft)]' : ''}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-alt)] text-[var(--color-primary)]">
                  <svg viewBox="0 0 24 24" className="h-[1.125rem] w-[1.125rem]" aria-hidden="true">
                    <path d={ICON_PATHS[item.icon]} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-[0.9375rem] ${active ? 'md:font-semibold' : ''}`}>{item.label}</span>
                  <span className="block text-[0.75rem] text-[var(--color-text-muted)]">{item.hint}</span>
                </span>
                {item.badge ? (
                  <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-0.5 text-[0.75rem] font-semibold text-[var(--color-primary)]">
                    {toPersianDigits(item.badge)}
                  </span>
                ) : null}
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[var(--color-text-muted)] opacity-60" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
