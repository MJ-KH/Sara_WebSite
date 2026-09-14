import Link from 'next/link'

export function AnnouncementBar({ text, href }: { text?: string | null; href?: string | null }) {
  if (!text) return null
  const content = <span>{text}</span>
  return (
    <div className="bg-[var(--color-primary)] px-4 py-2 text-center text-sm text-[var(--color-primary-contrast)]">
      {href ? <Link href={href}>{content}</Link> : content}
    </div>
  )
}
