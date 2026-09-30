import Image from 'next/image'
import Link from 'next/link'
import { SwatchFan } from '@/components/brand/SwatchFan'
import { Money } from '@/components/ui/Money'
import { SampleBadge } from '@/components/ui/SampleBadge'
import { paletteForPackage } from '@/lib/brand/swatches'
import { toPersianDigits } from '@/lib/digits'
import { formatDurationFa, splitSampleMarker } from '@/lib/display'

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'مبتدی',
  intermediate: 'متوسط',
  advanced: 'پیشرفته',
}

export type PackageCardData = {
  slug: string
  title: string
  subtitle?: string | null
  level: string
  topics?: string[] | null
  priceRial: number
  compareAtPriceRial?: number | null
  coverImage?: { url?: string | null; alt?: string | null } | null
}

export type PackageStats = { lessonCount: number; totalSeconds: number }

export function PackageCard({ pkg, stats }: { pkg: PackageCardData; stats?: PackageStats }) {
  const hasDiscount = Boolean(pkg.compareAtPriceRial && pkg.compareAtPriceRial > pkg.priceRial)
  const title = splitSampleMarker(pkg.title)
  const subtitle = splitSampleMarker(pkg.subtitle)
  const level = LEVEL_LABELS[pkg.level] ?? pkg.level

  return (
    <Link
      href={`/packages/${pkg.slug}`}
      className="card-soft group flex flex-col p-2.5 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-offset-4"
    >
      {pkg.coverImage?.url ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[calc(var(--radius-media)-0.5rem)] bg-[var(--color-bg-alt)]">
          <Image
            src={pkg.coverImage.url}
            alt={pkg.coverImage.alt || title.text}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="pkg-cover rounded-[calc(var(--radius-media)-0.5rem)]">
          <SwatchFan id={`pkg-${pkg.slug}`} colors={paletteForPackage(pkg)} spread={58} />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 px-3 pb-3 pt-5">
        <div className="flex items-center gap-2 text-[0.8125rem] font-semibold text-[var(--color-text-muted)]">
          <span>{level}</span>
          {title.isSample ? <SampleBadge /> : null}
        </div>

        <h3 className="title-2 font-display text-[1.35rem] text-[var(--color-text)]">{title.text}</h3>

        {subtitle.text ? <p className="text-[0.9375rem] leading-[1.9] text-[var(--color-text-muted)]">{subtitle.text}</p> : null}

        {stats && stats.lessonCount > 0 ? (
          <p className="text-[0.875rem] text-[var(--color-text-muted)]">
            {toPersianDigits(stats.lessonCount)} درس
            {stats.totalSeconds > 0 ? `، ${formatDurationFa(stats.totalSeconds)} آموزش` : null}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-[var(--color-border)] pt-4">
          <Money rial={pkg.priceRial} className="text-[1.15rem] font-extrabold text-[var(--color-text)]" />
          {hasDiscount ? (
            <span className="text-[0.875rem] text-[var(--color-text-muted)] line-through decoration-[var(--color-primary)]">
              <Money rial={pkg.compareAtPriceRial as number} />
            </span>
          ) : null}
          <span className="ms-auto text-[0.875rem] font-bold text-[var(--color-primary)] group-hover:underline">
            مشاهده دوره
          </span>
        </div>
      </div>
    </Link>
  )
}
