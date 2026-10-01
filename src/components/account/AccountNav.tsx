'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/account/my-packages', label: 'دوره‌های من' },
  { href: '/account/workshops', label: 'ورکشاپ‌های من' },
  { href: '/account/orders', label: 'سفارش‌ها' },
  { href: '/account/support', label: 'پشتیبانی' },
  { href: '/account/profile', label: 'پروفایل' },
]

/** منوی حساب کاربری: در موبایل کپسول‌هایی که در صورت نیاز به سطر بعد می‌روند، در دسکتاپ فهرست عمودی داخل کارت. */
export function AccountNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="منوی حساب کاربری">
      <ul className="flex flex-wrap gap-2 md:flex-col md:flex-nowrap md:gap-1 md:rounded-[var(--radius-media)] md:bg-[var(--color-surface)] md:p-3 md:shadow-[var(--shadow-soft)]">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`block whitespace-nowrap rounded-[var(--radius-pill)] px-4 py-2.5 text-[0.9375rem] transition-colors md:rounded-[var(--radius-base)] ${
                  active
                    ? 'bg-[var(--color-primary)] font-bold text-[var(--color-primary-contrast)]'
                    : 'bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-accent-soft)] md:bg-transparent'
                }`}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
