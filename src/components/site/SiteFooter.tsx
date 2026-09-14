import Link from 'next/link'

type FooterColumn = { title: string; links: { label: string; href: string }[] }

export function SiteFooter({
  columns,
  copyrightText,
  instagramAcademy,
  instagramServices,
}: {
  columns: FooterColumn[]
  copyrightText?: string | null
  instagramAcademy?: string | null
  instagramServices?: string | null
}) {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4">
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 font-bold">{col.title}</h3>
            <ul className="flex flex-col gap-2 text-sm text-[var(--color-text-muted)]">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[var(--color-primary)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h3 className="mb-3 font-bold">شبکه‌های اجتماعی</h3>
          <ul className="flex flex-col gap-2 text-sm text-[var(--color-text-muted)]">
            {instagramAcademy ? (
              <li>
                <a href={`https://instagram.com/${instagramAcademy}`} target="_blank" rel="noreferrer" className="hover:text-[var(--color-primary)]">
                  اینستاگرام آموزش
                </a>
              </li>
            ) : null}
            {instagramServices ? (
              <li>
                <a href={`https://instagram.com/${instagramServices}`} target="_blank" rel="noreferrer" className="hover:text-[var(--color-primary)]">
                  اینستاگرام خدمات
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] px-4 py-4 text-center text-xs text-[var(--color-text-muted)]">
        {copyrightText}
      </div>
    </footer>
  )
}
