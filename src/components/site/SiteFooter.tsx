import Link from 'next/link'
import { phoneForDisplay } from '@/lib/display'

type FooterColumn = { title: string; links: { label: string; href: string }[] }

export function SiteFooter({
  brandName,
  tagline,
  phone,
  columns,
  copyrightText,
  instagramAcademy,
  instagramServices,
}: {
  brandName: string
  tagline?: string | null
  phone?: string | null
  columns: FooterColumn[]
  copyrightText?: string | null
  instagramAcademy?: string | null
  instagramServices?: string | null
}) {
  const tel = phoneForDisplay(phone)
  return (
    <footer className="band-alt border-t border-[var(--color-border)]">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.3fr_repeat(3,1fr)] md:py-16">
        <div>
          <p className="text-[1.25rem] font-extrabold">{brandName}</p>
          {tagline ? <p className="mt-1 text-[var(--color-text-muted)]">{tagline}</p> : null}
          {tel ? (
            <a href={tel.href} className="mt-5 inline-flex items-center gap-2 text-[1.125rem] font-bold text-[var(--color-primary)]" dir="ltr">
              {tel.text}
            </a>
          ) : null}
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="mb-4 font-bold">{col.title}</h3>
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

        {instagramAcademy || instagramServices ? (
          <div>
            <h3 className="mb-4 font-bold">اینستاگرام</h3>
            <ul className="flex flex-col gap-3 text-[0.9375rem] text-[var(--color-text-muted)]">
              {instagramAcademy ? (
                <li>
                  <a href={`https://instagram.com/${instagramAcademy}`} target="_blank" rel="noreferrer" className="hover:text-[var(--color-primary)]">
                    <span className="block">آموزش</span>
                    <span dir="ltr" className="text-[0.8125rem]">
                      @{instagramAcademy}
                    </span>
                  </a>
                </li>
              ) : null}
              {instagramServices ? (
                <li>
                  <a href={`https://instagram.com/${instagramServices}`} target="_blank" rel="noreferrer" className="hover:text-[var(--color-primary)]">
                    <span className="block">خدمات ناخن</span>
                    <span dir="ltr" className="text-[0.8125rem]">
                      @{instagramServices}
                    </span>
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </div>
      {copyrightText ? (
        <div className="border-t border-[var(--color-border)] py-5 text-center text-[0.8125rem] text-[var(--color-text-muted)]">{copyrightText}</div>
      ) : null}
    </footer>
  )
}
