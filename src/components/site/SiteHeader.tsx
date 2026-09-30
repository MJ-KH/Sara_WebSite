import Image from 'next/image'
import Link from 'next/link'
import { SwatchFan } from '@/components/brand/SwatchFan'
import { SHADES } from '@/lib/brand/swatches'
import { MobileMenu } from './MobileMenu'

type MenuChild = { label: string; href: string }
type MenuItem = { label: string; href: string; children?: MenuChild[] | null }

/** نشان موقت برند تا وقتی لوگوی رسمی بارگذاری نشده: بادبزن کوچک سه‌تیپی، هم‌خانواده بادبزن صفحه اصلی. */
function TipMark() {
  return (
    <span className="block w-10">
      <SwatchFan id="brand-mark" colors={[SHADES.petal, SHADES.rose, SHADES.raspberry]} spread={50} />
    </span>
  )
}

export function SiteHeader({
  brandName,
  tagline,
  logoUrl,
  menu,
}: {
  brandName: string
  tagline?: string | null
  logoUrl?: string | null
  menu: MenuItem[]
}) {
  return (
    // سربرگ شناور (مثل مرجع Gloss Bar): کارت گرد با سایه نرم که روی صفحه می‌ماند
    <header className="sticky top-0 z-40 px-3 pt-3 md:px-6 md:pt-4">
      <div className="relative mx-auto flex h-16 max-w-[var(--container-wide)] items-center gap-4 rounded-[1.75rem] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] px-4 shadow-[var(--shadow-float)] backdrop-blur-md md:h-20 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          {logoUrl ? <Image src={logoUrl} alt={brandName} width={44} height={44} className="h-11 w-auto" /> : <TipMark />}
          <span className="flex flex-col leading-tight">
            <span className="text-[1.0625rem] font-extrabold">{brandName}</span>
            {tagline ? <span className="hidden text-[0.75rem] text-[var(--color-text-muted)] sm:block">{tagline}</span> : null}
          </span>
        </Link>

        <nav className="ms-auto hidden items-center gap-7 text-[0.9375rem] md:flex" aria-label="منوی اصلی">
          {menu.map((item) => (
            <div key={item.href} className="group relative">
              <Link href={item.href} className="nav-link">
                {item.label}
              </Link>
              {item.children?.length ? (
                <div className="absolute end-0 top-full hidden min-w-44 flex-col gap-1 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] p-2 group-hover:flex group-focus-within:flex">
                  {item.children.map((child) => (
                    <Link key={child.href} href={child.href} className="rounded-[var(--radius-base)] p-2 hover:bg-[var(--color-bg-alt)]">
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          <Link href="/account" className="nav-link text-[var(--color-text-muted)]">
            حساب من
          </Link>
        </nav>

        <div className="ms-auto flex items-center gap-2 md:ms-0">
          <Link href="/packages" className="btn btn-primary btn-sm">
            خرید پکیج
          </Link>
          <MobileMenu menu={menu} />
        </div>
      </div>
    </header>
  )
}
