import Link from 'next/link'
import { formatJalaliDate } from '@/lib/jalali'
import { toPersianDigits } from '@/lib/digits'
import { splitSampleMarker } from '@/lib/display'
import { Money } from '@/components/ui/Money'
import { SampleBadge } from '@/components/ui/SampleBadge'

export type WorkshopSessionCardData = {
  id: string
  startAt: string
  location?: string | null
  capacity: number
  occupiedCount: number
  priceRial: number
  workshop: { slug: string; title: string } | string
}

export function WorkshopSessionCard({ session }: { session: WorkshopSessionCardData }) {
  const workshop = typeof session.workshop === 'string' ? null : session.workshop
  const seatsLeft = Math.max(session.capacity - session.occupiedCount, 0)
  const title = splitSampleMarker(workshop?.title ?? 'ورکشاپ')
  const location = splitSampleMarker(session.location)
  return (
    <Link
      href={workshop ? `/workshops/${workshop.slug}` : '#'}
      className="card-soft group flex flex-col gap-3 p-6 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-offset-4"
    >
      <div className="flex flex-wrap items-center gap-2 text-[0.8125rem] font-semibold text-[var(--color-primary)]">
        <span className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1">{formatJalaliDate(new Date(session.startAt))}</span>
        {title.isSample || location.isSample ? <SampleBadge /> : null}
      </div>
      <h3 className="title-2 font-display text-[1.3rem] text-[var(--color-text)]">{title.text}</h3>
      {location.text ? <p className="text-[0.9375rem] leading-[1.9] text-[var(--color-text-muted)]">{location.text}</p> : null}
      <div className="mt-auto flex items-baseline justify-between gap-3 border-t border-[var(--color-border)] pt-4">
        <Money rial={session.priceRial} className="text-[1.1rem] font-extrabold text-[var(--color-text)]" />
        <span className="text-[0.875rem] font-bold text-[var(--color-primary)]">
          {seatsLeft > 0 ? `${toPersianDigits(seatsLeft)} صندلی باقی‌مانده` : 'تکمیل ظرفیت'}
        </span>
      </div>
    </Link>
  )
}
