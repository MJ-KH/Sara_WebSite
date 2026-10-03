import Image from 'next/image'
import Link from 'next/link'
import { SwatchFan } from '@/components/brand/SwatchFan'
import { Money } from '@/components/ui/Money'
import { SampleBadge } from '@/components/ui/SampleBadge'
import { paletteForPackage } from '@/lib/brand/swatches'
import { toPersianDigits } from '@/lib/digits'
import { splitSampleMarker } from '@/lib/display'

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

export type PackageStats = { lessonCount: number }

/**
 * کارت دوره به سبک کاتالوگ: عکس عمودی بزرگ، بدون جعبه و سایه؛ متن زیر عکس روی زمینه صفحه.
 * در موبایل افقی است (عکس کوچک کنار متن) تا هر دوره یک صفحه کامل را نگیرد و مقایسه آسان باشد.
 */
export function PackageCard({ pkg, stats }: { pkg: PackageCardData; stats?: PackageStats }) {
  const hasDiscount = Boolean(pkg.compareAtPriceRial && pkg.compareAtPriceRial > pkg.priceRial)
  const title = splitSampleMarker(pkg.title)
  const subtitle = splitSampleMarker(pkg.subtitle)
  const level = LEVEL_LABELS[pkg.level] ?? pkg.level
  const meta = [level ? `سطح ${level}` : null, stats && stats.lessonCount > 0 ? `${toPersianDigits(stats.lessonCount)} درس` : null]
    .filter(Boolean)
    .join('، ')

  return (
    <Link href={`/packages/${pkg.slug}`} className="group flex gap-4 focus-visible:outline-offset-8 sm:flex-col sm:gap-0">
      <div className="relative aspect-[4/5] w-[36%] shrink-0 self-start overflow-hidden rounded-[var(--radius-media)] bg-[var(--color-bg-alt)] sm:w-full">
        {pkg.coverImage?.url ? (
          <Image
            src={pkg.coverImage.url}
            alt={pkg.coverImage.alt || title.text}
            fill
            sizes="(max-width: 640px) 36vw, (max-width: 1024px) 50vw, 26rem"
            className="object-cover transition-transform duration-[var(--dur-4)] ease-[var(--ease)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="pkg-cover absolute inset-0">
            <SwatchFan id={`pkg-${pkg.slug}`} colors={paletteForPackage(pkg)} spread={58} />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col sm:pt-5">
        <div className="flex items-center gap-2 text-[0.8125rem] text-[var(--color-text-muted)]">
          <span>{meta}</span>
          {title.isSample ? <SampleBadge /> : null}
        </div>
        <h3 className="mt-1.5 text-[1.15rem] font-light leading-[1.55] text-[var(--color-text)] sm:mt-2 sm:text-[1.45rem]">{title.text}</h3>
        {subtitle.text ? (
          <p className="mt-1.5 line-clamp-2 text-[0.875rem] leading-[1.9] text-[var(--color-text-muted)] sm:mt-2 sm:line-clamp-none sm:text-[0.9375rem]">{subtitle.text}</p>
        ) : null}

        {/* فاصله حداقلی تا خط قیمت؛ در ردیف کارت‌ها خط قیمت‌ها هم‌تراز می‌مانند */}
        <div className="min-h-3 flex-1 sm:min-h-5" aria-hidden="true" />
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-[var(--gold-soft)] pt-3 sm:pt-4">
          <Money rial={pkg.priceRial} className="text-[1.1rem] font-semibold text-[var(--color-text)]" />
          {hasDiscount ? (
            <span className="text-[0.875rem] text-[var(--color-text-muted)] line-through decoration-[var(--gold)]">
              <Money rial={pkg.compareAtPriceRial as number} />
            </span>
          ) : null}
          <span className="ms-auto border-b border-[var(--gold)] pb-0.5 text-[0.875rem] font-medium text-[var(--color-text)] transition-colors group-hover:border-[var(--color-text)]">
            مشاهده دوره
          </span>
        </div>
      </div>
    </Link>
  )
}
