import type { Payload } from 'payload'
import { extractId } from '@/lib/relation'

const MAX_RETRIES = 8
const HOLD_MINUTES = Number(process.env.WORKSHOP_HOLD_MINUTES || 15)

export type ReserveSeatResult =
  | { ok: true; reservationId: string; expiresAt: string }
  | { ok: false; error: 'sold_out' | 'session_not_open' | 'conflict_retry_exhausted' }

/**
 * رزرو موقت صندلی با الگوی compare-and-swap روی WorkshopSessions.occupiedCount تا در
 * درخواست هم‌زمان برای آخرین صندلی، دو رزرو هم‌زمان یک ظرفیت را اشغال نکنند. اگر بین دو
 * خواندن، رکورد توسط درخواست دیگری تغییر کرده باشد (docs.length === 0)، دوباره تلاش می‌شود.
 */
export async function reserveWorkshopSeat(
  payload: Payload,
  sessionId: string | number,
  studentId: string | number,
): Promise<ReserveSeatResult> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const session = await payload.findByID({ collection: 'workshop-sessions', id: sessionId, overrideAccess: true })
    if (!session || session.status !== 'published') return { ok: false, error: 'session_not_open' }

    const currentOccupied = session.occupiedCount
    if (currentOccupied >= session.capacity) return { ok: false, error: 'sold_out' }

    const cas = await payload.update({
      collection: 'workshop-sessions',
      where: { and: [{ id: { equals: sessionId } }, { occupiedCount: { equals: currentOccupied } }] },
      data: { occupiedCount: currentOccupied + 1 },
      overrideAccess: true,
    })

    if (cas.docs.length === 0) continue // یک درخواست هم‌زمان دیگر رکورد را تغییر داد؛ دوباره تلاش کن

    const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60_000).toISOString()
    const reservation = await payload.create({
      collection: 'workshop-reservations',
      data: { session: Number(sessionId), student: Number(studentId), status: 'holding', expiresAt },
      overrideAccess: true,
    })

    return { ok: true, reservationId: String(reservation.id), expiresAt }
  }

  return { ok: false, error: 'conflict_retry_exhausted' }
}

/** آزادسازی صندلی (انقضا یا لغو) — کاهش اتمیک occupiedCount با همان الگو */
export async function releaseWorkshopSeat(
  payload: Payload,
  reservationId: string | number,
  newStatus: 'expired' | 'released',
) {
  const reservation = await payload.findByID({
    collection: 'workshop-reservations',
    id: reservationId,
    overrideAccess: true,
  })
  if (!reservation || reservation.status !== 'holding') return

  const sessionId = extractId(reservation.session)
  if (sessionId === undefined) return

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const session = await payload.findByID({ collection: 'workshop-sessions', id: sessionId, overrideAccess: true })
    if (!session) break
    const current = session.occupiedCount
    const next = Math.max(current - 1, 0)

    const cas = await payload.update({
      collection: 'workshop-sessions',
      where: { and: [{ id: { equals: sessionId } }, { occupiedCount: { equals: current } }] },
      data: { occupiedCount: next },
      overrideAccess: true,
    })
    if (cas.docs.length > 0) break
  }

  await payload.update({
    collection: 'workshop-reservations',
    id: reservationId,
    data: { status: newStatus },
    overrideAccess: true,
  })
}
