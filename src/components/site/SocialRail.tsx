/**
 * ستون شناور کنار صفحه (فقط دسکتاپ): اینستاگرام آکادمی، واتساپ، تلگرام و یوتیوب.
 * پیج‌های خدمات و سالن عمداً اینجا نیستند تا تمرکز سایت روی آموزش بماند؛ آن‌ها در فوتر
 * و صفحه خدمات آمده‌اند. آیکون‌ها طرح ساده عمومی‌اند، نه لوگوی رسمی برندها.
 */
const ICONS = {
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20z" />
      <path d="M9.2 8.8c.2 2.4 1.9 4.4 4.3 5.1" />
    </>
  ),
  // هواپیمای کاغذی ساده (نماد عمومی پیام‌رسان، نه لوگوی رسمی تلگرام)
  telegram: (
    <>
      <path d="M21 4L3 11.2l6.3 2.3L19 7l-7.6 8.1.3 4.9 3-3.6 4.4 3.4z" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.8" y="5.5" width="18.4" height="13" rx="4" />
      <path d="M10.3 9.3v5.4l4.6-2.7z" fill="currentColor" stroke="none" />
    </>
  ),
}

export function SocialRail({
  academy,
  whatsapp,
  telegram,
  youtube,
}: {
  academy?: string | null
  whatsapp?: string | null
  telegram?: string | null
  youtube?: string | null
}) {
  const links = [
    academy ? { href: `https://instagram.com/${academy}`, label: `اینستاگرام آکادمی (@${academy})`, icon: ICONS.instagram } : null,
    whatsapp ? { href: whatsapp, label: 'پیام در واتساپ', icon: ICONS.whatsapp } : null,
    telegram ? { href: `https://t.me/${telegram}`, label: `تلگرام (@${telegram})`, icon: ICONS.telegram } : null,
    youtube ? { href: youtube, label: 'کانال یوتیوب', icon: ICONS.youtube } : null,
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[]
  if (links.length === 0) return null
  return (
    <nav aria-label="شبکه‌های اجتماعی" className="fixed end-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          aria-label={link.label}
          title={link.label}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-primary)] shadow-[var(--shadow-float)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-primary)] hover:text-white"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" focusable="false">
            {link.icon}
          </svg>
        </a>
      ))}
    </nav>
  )
}
