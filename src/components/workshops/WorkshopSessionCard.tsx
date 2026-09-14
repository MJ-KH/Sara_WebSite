import Link from 'next/link'
import { formatJalaliDate } from '@/lib/jalali'
import { Money } from '@/components/ui/Money'

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
  return (
    <Link
      href={workshop ? `/workshops/${workshop.slug}` : '#'}
      className="flex flex-col gap-2 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
    >
      <h3 className="font-bold">{workshop?.title ?? 'دوره حضوری'}</h3>
      <p className="text-sm text-[var(--color-text-muted)]">{formatJalaliDate(new Date(session.startAt))}</p>
      {session.location ? <p className="text-sm text-[var(--color-text-muted)]">{session.location}</p> : null}
      <div className="mt-2 flex items-center justify-between">
        <Money rial={session.priceRial} className="font-bold text-[var(--color-primary)]" />
        <span className="text-xs text-[var(--color-text-muted)]">
          {seatsLeft > 0 ? `${seatsLeft} صندلی باقی‌مانده` : 'تکمیل ظرفیت'}
        </span>
      </div>
    </Link>
  )
}
