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
  logo,
  menu,
  isStudentLoggedIn,
}: {
  brandName: string
  tagline?: string | null
  logo?: { url: string; width: number; height: number } | null
  menu: MenuItem[]
  isStudentLoggedIn: boolean
}) {
  return (
    // سربرگ شناور (مثل مرجع Gloss Bar): کارت گرد با سایه نرم که روی صفحه می‌ماند
    <header className="sticky top-0 z-40 px-3 pt-3 md:px-6 md:pt-4">
      <div className="relative mx-auto flex h-16 max-w-[var(--container-wide)] items-center gap-4 rounded-[var(--radius-media)] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_90%,transparent)] px-4 shadow-[var(--shadow-soft)] backdrop-blur-md md:h-20 md:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          {/* نام سایت کنارش نوشته شده، پس تصویر لوگو برای صفحه‌خوان تزئینی است */}
          {/* در موبایل جای مونوگرام کنار نام و دو دکمه نیست؛ از عرض تبلت نمایش داده می‌شود */}
          {logo ? (
            <Image src={logo.url} alt="" width={logo.width} height={logo.height} priority className="hidden h-9 w-auto sm:block md:h-11" />
          ) : (
            <TipMark />
          )}
          <span className="flex flex-col leading-tight">
            <span className="text-[1.0625rem] font-semibold">{brandName}</span>
            {tagline ? <span className="hidden text-[0.75rem] text-[var(--color-text-muted)] sm:block">{tagline}</span> : null}
          </span>
        </Link>

        {/* ۷ آیتم منو در عرض تبلت جا نمی‌شود؛ زیر ۱۰۲۴ پیکسل منوی کشویی استفاده می‌شود */}
        <nav className="ms-auto hidden items-center gap-6 text-[0.9375rem] lg:flex" aria-label="منوی اصلی">
          {menu.map((item) => (
            <div key={item.href} className="group relative">
              <Link href={item.href} className="nav-link whitespace-nowrap">
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
        </nav>

        <div className="ms-auto flex items-center gap-2 lg:ms-0">
          <Link href="/account" className="btn btn-primary btn-sm whitespace-nowrap">
            {isStudentLoggedIn ? 'حساب من' : 'ورود / ثبت‌نام'}
          </Link>
          <MobileMenu menu={menu} />
        </div>
      </div>
    </header>
  )
}
