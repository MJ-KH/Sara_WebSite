import Image from 'next/image'
import Link from 'next/link'

type MenuChild = { label: string; href: string }
type MenuItem = { label: string; href: string; children?: MenuChild[] | null }

export function SiteHeader({
  brandName,
  logoUrl,
  menu,
}: {
  brandName: string
  logoUrl?: string | null
  menu: MenuItem[]
}) {
  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold">
          {logoUrl ? (
            <Image src={logoUrl} alt={brandName} width={40} height={40} className="rounded-full" />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-primary)]">
              {brandName.charAt(0)}
            </span>
          )}
          <span>{brandName}</span>
        </Link>
        <nav className="hidden gap-6 text-sm md:flex" aria-label="منوی اصلی">
          {menu.map((item) => (
            <div key={item.href} className="group relative">
              <Link href={item.href} className="hover:text-[var(--color-primary)]">
                {item.label}
              </Link>
              {item.children?.length ? (
                <div className="absolute right-0 hidden min-w-40 flex-col gap-1 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-md group-hover:flex group-focus-within:flex">
                  {item.children.map((child) => (
                    <Link key={child.href} href={child.href} className="rounded p-2 hover:bg-[var(--color-accent-soft)]">
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
        <Link href="/packages" className="btn btn-primary px-4 py-2 text-sm font-bold">
          خرید پکیج
        </Link>
      </div>
    </header>
  )
}
