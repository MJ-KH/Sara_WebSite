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

/**
 * آموزش رایگان به سبک فهرست مقاله‌های مجله: خط مویی طلایی بالا، عکس ۴ به ۳، نوع محتوا و عنوان.
 * در موبایل افقی است (عکس کوچک کنار عنوان، مثل کارت دوره) تا هر آموزش کل صفحه را نگیرد.
 */
export function FreeLessonCard({ item }: { item: FreeLessonCardData }) {
  const title = splitSampleMarker(item.title)
  return (
    <Link
      href={`/free-lessons/${item.slug}`}
      className="group flex gap-4 border-t border-[var(--gold)] pt-5 focus-visible:outline-offset-4 sm:flex-col sm:gap-0"
    >
      {item.coverImage?.url ? (
        <div className="relative aspect-[4/3] w-[38%] shrink-0 self-start overflow-hidden rounded-[var(--radius-media)] bg-[var(--color-bg-alt)] sm:mb-5 sm:w-full">
          <Image
            src={item.coverImage.url}
            alt={item.coverImage.alt || title.text}
            fill
            sizes="(max-width: 640px) 38vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-[var(--dur-4)] ease-[var(--ease)] group-hover:scale-[1.03]"
          />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[0.8125rem] text-[var(--color-text-muted)]">
          <span>{CONTENT_TYPE_LABELS[item.contentType] ?? ''}</span>
          {title.isSample ? <SampleBadge /> : null}
        </div>
        <h3 className="mt-1.5 text-[1.0625rem] font-normal leading-[1.75] text-[var(--color-text)] transition-colors group-hover:text-[var(--color-primary)] sm:mt-2 sm:text-[1.15rem]">
          {title.text}
        </h3>
      </div>
    </Link>
  )
}
