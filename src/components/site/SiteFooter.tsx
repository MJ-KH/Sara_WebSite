import Image from 'next/image'
import Link from 'next/link'
import { phoneForDisplay } from '@/lib/display'

type FooterColumn = { title: string; links: { label: string; href: string }[] }
type InstagramPage = { handle?: string | null; label: string }

export function SiteFooter({
  brandName,
  tagline,
  logo,
  phone,
  landline,
  whatsapp,
  columns,
  copyrightText,
  instagram,
  youtube,
  telegram,
}: {
  brandName: string
  tagline?: string | null
  /** نسخه روشن لوگوی کامل برای زمینه تیره فوتر */
  logo?: { url: string; width: number; height: number } | null
  phone?: string | null
  landline?: string | null
  whatsapp?: string | null
  columns: FooterColumn[]
  copyrightText?: string | null
  instagram: InstagramPage[]
  youtube?: string | null
  telegram?: string | null
}) {
  const mobile = phoneForDisplay(phone)
  const fixed = phoneForDisplay(landline)
  const pages = instagram.filter((page): page is { handle: string; label: string } => Boolean(page.handle))
  const hasSocial = pages.length > 0 || youtube || telegram

  return (
    <footer className="band-ink">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 md:py-16 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          {logo ? (
            <Image src={logo.url} alt={brandName} width={logo.width} height={logo.height} className="h-auto w-56 md:w-64" />
          ) : (
            <>
              <p className="text-[1.6rem] font-light">{brandName}</p>
              {tagline ? <p className="mt-1 text-[var(--color-text-muted)]">{tagline}</p> : null}
            </>
          )}
          <div className="mt-5 flex flex-col gap-2">
            {mobile ? (
              <a href={mobile.href} dir="ltr" className="self-start text-[1.125rem] font-medium text-[var(--color-primary)]">
                {mobile.text}
              </a>
            ) : null}
            {fixed ? (
              <a href={fixed.href} dir="ltr" className="self-start text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
                {fixed.text}
              </a>
            ) : null}
          </div>
          {whatsapp ? (
            <a href={whatsapp} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm mt-5">
              پیام در واتساپ
            </a>
          ) : null}
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="mb-4 text-[0.875rem] font-medium text-[var(--color-primary)]">{col.title}</h3>
            <ul className="flex flex-col gap-3 text-[0.9375rem] text-[var(--color-text-muted)]">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[var(--color-primary)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {hasSocial ? (
          <nav aria-label="شبکه‌های اجتماعی">
            <h3 className="mb-4 text-[0.875rem] font-medium text-[var(--color-primary)]">شبکه‌های اجتماعی</h3>
            <ul className="flex flex-col gap-3 text-[0.9375rem] text-[var(--color-text-muted)]">
              {pages.map((page) => (
                <li key={page.handle}>
                  <a href={`https://instagram.com/${page.handle}`} target="_blank" rel="noreferrer" className="hover:text-[var(--color-primary)]">
                    <span className="block">اینستاگرام {page.label}</span>
                    <span dir="ltr" className="text-[0.8125rem]">
                      @{page.handle}
                    </span>
                  </a>
                </li>
              ))}
              {youtube ? (
                <li>
                  <a href={youtube} target="_blank" rel="noreferrer" className="hover:text-[var(--color-primary)]">
                    کانال یوتیوب
                  </a>
                </li>
              ) : null}
              {telegram ? (
                <li>
                  <a href={`https://t.me/${telegram}`} target="_blank" rel="noreferrer" className="hover:text-[var(--color-primary)]">
                    تلگرام
                  </a>
                </li>
              ) : null}
            </ul>
          </nav>
        ) : null}
      </div>
      {copyrightText ? (
        <div className="border-t border-[var(--color-border)] py-5 text-center text-[0.8125rem] text-[var(--color-text-muted)]">{copyrightText}</div>
      ) : null}
    </footer>
  )
}
