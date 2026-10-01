import Image from 'next/image'
import Link from 'next/link'
import { SampleBadge } from '@/components/ui/SampleBadge'
import { splitSampleMarker } from '@/lib/display'

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

/** آموزش رایگان به سبک فهرست مقاله‌های مجله: خط مویی طلایی بالا، نوع محتوا و عنوان. */
export function FreeLessonCard({ item }: { item: FreeLessonCardData }) {
  const title = splitSampleMarker(item.title)
  return (
    <Link href={`/free-lessons/${item.slug}`} className="group flex flex-col border-t border-[var(--gold)] pt-5 focus-visible:outline-offset-4">
      {item.coverImage?.url ? (
        <div className="relative mb-5 aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-media)] bg-[var(--color-bg-alt)]">
          <Image
            src={item.coverImage.url}
            alt={item.coverImage.alt || title.text}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="flex items-center gap-2 text-[0.8125rem] text-[var(--color-text-muted)]">
        <span>{CONTENT_TYPE_LABELS[item.contentType] ?? ''}</span>
        {title.isSample ? <SampleBadge /> : null}
      </div>
      <h3 className="mt-2 text-[1.15rem] font-normal leading-[1.75] text-[var(--color-text)] transition-colors group-hover:text-[var(--color-primary)]">
        {title.text}
      </h3>
    </Link>
  )
}
