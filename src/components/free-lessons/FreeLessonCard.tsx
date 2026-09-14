import Image from 'next/image'
import Link from 'next/link'

const CONTENT_TYPE_LABELS: Record<string, string> = {
  article: 'مقاله',
  video: 'ویدئو',
  file: 'فایل دانلودی',
}

export type FreeLessonCardData = {
  slug: string
  title: string
  contentType: string
  coverImage?: { url?: string | null; alt?: string | null } | null
}

export function FreeLessonCard({ item }: { item: FreeLessonCardData }) {
  return (
    <Link
      href={`/free-lessons/${item.slug}`}
      className="flex flex-col overflow-hidden rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <div className="relative aspect-video w-full bg-[var(--color-accent-soft)]">
        {item.coverImage?.url ? (
          <Image src={item.coverImage.url} alt={item.coverImage.alt || item.title} fill className="object-cover" />
        ) : null}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <span className="text-xs text-[var(--color-text-muted)]">{CONTENT_TYPE_LABELS[item.contentType] ?? ''}</span>
        <h3 className="font-bold leading-relaxed">{item.title}</h3>
      </div>
    </Link>
  )
}
