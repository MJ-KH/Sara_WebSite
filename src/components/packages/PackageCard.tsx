import Image from 'next/image'
import Link from 'next/link'
import { Money } from '@/components/ui/Money'

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
  priceRial: number
  compareAtPriceRial?: number | null
  coverImage?: { url?: string | null; alt?: string | null } | null
}

export function PackageCard({ pkg }: { pkg: PackageCardData }) {
  const hasDiscount = Boolean(pkg.compareAtPriceRial && pkg.compareAtPriceRial > pkg.priceRial)
  return (
    <Link
      href={`/packages/${pkg.slug}`}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-accent-soft)]">
        {pkg.coverImage?.url ? (
          <Image
            src={pkg.coverImage.url}
            alt={pkg.coverImage.alt || pkg.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs text-[var(--color-text-muted)]">{LEVEL_LABELS[pkg.level] ?? pkg.level}</span>
        <h3 className="font-bold leading-relaxed">{pkg.title}</h3>
        {pkg.subtitle ? <p className="text-sm text-[var(--color-text-muted)]">{pkg.subtitle}</p> : null}
        <div className="mt-auto flex items-center gap-2 pt-2">
          {hasDiscount ? (
            <span className="text-sm text-[var(--color-text-muted)] line-through">
              <Money rial={pkg.compareAtPriceRial as number} />
            </span>
          ) : null}
          <Money rial={pkg.priceRial} className="font-bold text-[var(--color-primary)]" />
        </div>
      </div>
    </Link>
  )
}
