import type { Metadata } from 'next'
import Link from 'next/link'
import { ErrorScreen } from '@/components/site/ErrorScreen'

export const metadata: Metadata = { title: 'صفحه پیدا نشد', robots: { index: false, follow: false } }

const QUICK_LINKS = [
  { href: '/free-lessons', label: 'آموزش رایگان' },
  { href: '/services', label: 'خدمات سالن' },
  { href: '/contact', label: 'تماس با ما' },
]

export default function NotFound() {
  return (
    <ErrorScreen
      mark={<strong className="text-[2.75rem] font-[250] tracking-[0.02em] text-[var(--color-primary)]">۴۰۴</strong>}
      title="این صفحه پیدا نشد"
      lead="ممکن است آدرس اشتباه تایپ شده باشد یا این صفحه دیگر وجود نداشته باشد."
      primary={
        <Link href="/" className="btn btn-primary">
          بازگشت به صفحه اصلی
        </Link>
      }
      secondary={{ href: '/packages', label: 'مشاهده دوره‌ها' }}
    >
      <nav
        aria-label="پیوندهای سریع"
        className="mx-auto mt-9 flex max-w-sm flex-wrap justify-center gap-x-6 gap-y-2 border-t border-[var(--gold-soft)] pt-6 text-[0.875rem]"
      >
        {QUICK_LINKS.map((item) => (
          <Link key={item.href} href={item.href} className="py-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
            {item.label}
          </Link>
        ))}
      </nav>
    </ErrorScreen>
  )
}
