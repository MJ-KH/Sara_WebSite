import Image from 'next/image'
import Link from 'next/link'
import { SwatchFan } from '@/components/brand/SwatchFan'
import { SampleBadge } from '@/components/ui/SampleBadge'
import { paletteForPackage } from '@/lib/brand/swatches'
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

export function FreeLessonCard({ item }: { item: FreeLessonCardData }) {
  const title = splitSampleMarker(item.title)
  return (
    <Link
      href={`/free-lessons/${item.slug}`}
      className="card-soft group flex flex-col p-2.5 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-offset-4"
    >
      {item.coverImage?.url ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-[calc(var(--radius-media)-0.5rem)] bg-[var(--color-bg-alt)]">
          <Image
            src={item.coverImage.url}
            alt={item.coverImage.alt || title.text}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className={`flex flex-col gap-2 px-3 pb-3 ${item.coverImage?.url ? 'pt-4' : 'pt-3'}`}>
        <div className="flex items-center gap-2 text-[0.8125rem] font-semibold text-[var(--color-text-muted)]">
          {item.coverImage?.url ? null : (
            <span className="block w-7 shrink-0" aria-hidden="true">
              <SwatchFan id={`free-${item.slug}`} colors={paletteForPackage({ slug: item.slug })} spread={50} />
            </span>
          )}
          <span>{CONTENT_TYPE_LABELS[item.contentType] ?? ''}</span>
          {title.isSample ? <SampleBadge /> : null}
        </div>
        <h3 className="title-2 font-display text-[1.2rem] text-[var(--color-text)]">{title.text}</h3>
      </div>
    </Link>
  )
}
