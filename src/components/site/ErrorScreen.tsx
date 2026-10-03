import Link from 'next/link'
import type React from 'react'

/** نوک ناخن ساده برای قاب صفحه خطا (همان فرم ناخن بادبزن رنگ‌ها، تک‌رنگ). */
export function NailTipIcon() {
  return (
    <svg viewBox="-17 -122 34 130" className="h-12 w-12" aria-hidden="true">
      <path
        d="M0 -118 C 14 -118 16 -100 16 -70 L 13 0 C 13 6 -13 6 -13 0 L -16 -70 C -16 -100 -14 -118 0 -118 Z"
        fill="var(--color-primary)"
        transform="rotate(12)"
      />
    </svg>
  )
}

/**
 * قالب مشترک صفحه‌های «پیدا نشد» و «خطا»: قاب طاقی با خط دوخت طلایی، تیتر، توضیح، دکمه اصلی و لینک دوم.
 * هم در کامپوننت سرور (۴۰۴) و هم کلاینت (error.tsx) استفاده می‌شود، پس hook ندارد.
 */
export function ErrorScreen({
  mark,
  title,
  lead,
  primary,
  secondary,
  children,
}: {
  mark: React.ReactNode
  title: string
  lead: string
  primary: React.ReactNode
  secondary: { href: string; label: string }
  children?: React.ReactNode
}) {
  return (
    <section className="container-narrow py-14 text-center md:py-20">
      <div className="error-arch mx-auto mb-8">{mark}</div>
      <h1 className="display-2">{title}</h1>
      <p className="mx-auto mt-3 max-w-[22rem] text-[0.9375rem] leading-[1.9] text-[var(--color-text-muted)]">{lead}</p>
      <div className="mt-7 flex flex-col items-center gap-4">
        {primary}
        <Link href={secondary.href} className="btn-link">
          {secondary.label}
        </Link>
      </div>
      {children}
    </section>
  )
}
