/** ستون شناور شبکه‌های اجتماعی کنار صفحه (فقط دسکتاپ) — مخاطب سارا بیشتر از اینستاگرام می‌آید. */
function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" focusable="false">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function SocialRail({ academy, services }: { academy?: string | null; services?: string | null }) {
  const links = [
    academy ? { handle: academy, label: 'اینستاگرام آموزش' } : null,
    services ? { handle: services, label: 'اینستاگرام خدمات ناخن' } : null,
  ].filter(Boolean) as { handle: string; label: string }[]
  if (links.length === 0) return null
  return (
    <nav aria-label="شبکه‌های اجتماعی" className="fixed end-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
      {links.map((link) => (
        <a
          key={link.handle}
          href={`https://instagram.com/${link.handle}`}
          target="_blank"
          rel="noreferrer"
          aria-label={`${link.label} (@${link.handle})`}
          title={`@${link.handle}`}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-primary)] shadow-[var(--shadow-float)] transition-transform hover:-translate-y-0.5"
        >
          <InstagramGlyph />
        </a>
      ))}
    </nav>
  )
}
