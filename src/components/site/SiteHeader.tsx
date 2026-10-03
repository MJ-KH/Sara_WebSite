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
      <div className="relative mx-auto flex h-16 max-w-[var(--container-wide)] items-center gap-3 rounded-[var(--radius-media)] sm:gap-4 border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_90%,transparent)] px-4 shadow-[var(--shadow-soft)] backdrop-blur-md md:h-20 md:px-8">
        {/* راست‌چین: منوی همبرگری اول (سمت راست)، بعد لوگو؛ دکمه ورود در انتهای چپ */}
        <MobileMenu menu={menu} />
        {/* زیر دسکتاپ لوگو وسط سربرگ می‌نشیند (منو راست، دکمه ورود چپ)؛ در دسکتاپ کنار منو */}
        <Link
          href="/"
          className="absolute left-1/2 flex shrink-0 -translate-x-1/2 items-center gap-3 lg:static lg:translate-x-0"
        >
          {/* نام سایت کنارش نوشته شده، پس تصویر لوگو برای صفحه‌خوان تزئینی است */}
          {logo ? (
            <Image src={logo.url} alt="" width={logo.width} height={logo.height} priority className="h-7 w-auto sm:h-9 md:h-11" />
          ) : (
            <TipMark />
          )}
          {/* در موبایل فقط لوگو می‌ماند تا کنار منو و دکمه ورود جا شود؛ نام از عرض تبلت دیده می‌شود */}
          <span className={logo ? 'hidden flex-col leading-tight sm:flex' : 'flex flex-col leading-tight'}>
            <span className="text-[1.0625rem] font-semibold">{brandName}</span>
            {tagline ? <span className="hidden text-[0.75rem] text-[var(--color-text-muted)] sm:block">{tagline}</span> : null}
          </span>
        </Link>

        {/* ۷ آیتم منو در عرض تبلت جا نمی‌شود؛ زیر ۱۰۲۴ پیکسل منوی کشویی استفاده می‌شود */}
        {/* منو درست بعد از لوگو و از راست شروع می‌شود */}
        <nav className="ms-6 hidden items-center gap-6 text-[0.9375rem] lg:flex xl:ms-10" aria-label="منوی اصلی">
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

        <div className="ms-auto flex items-center">
          <Link href="/account" className="btn btn-primary btn-sm whitespace-nowrap max-sm:px-3.5">
            {isStudentLoggedIn ? (
              'حساب من'
            ) : (
              // یک span تا فاصله (gap) دکمه بین «ورود» و «/ ثبت‌نام» نیفتد؛ در گوشی خیلی باریک فقط «ورود»
              <span>
                ورود<span className="max-[369px]:hidden"> / ثبت‌نام</span>
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
