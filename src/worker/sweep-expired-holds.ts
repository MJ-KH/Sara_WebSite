import type { Payload } from 'payload'
import { releaseWorkshopSeat } from '@/lib/workshops/reserve-seat'

/** رزروهای موقت منقضی‌شده را آزاد می‌کند تا صندلی برای دیگران باز شود. */
export async function sweepExpiredHolds(payload: Payload): Promise<void> {
  const expired = await payload.find({
    collection: 'workshop-reservations',
    where: { and: [{ status: { equals: 'holding' } }, { expiresAt: { less_than: new Date().toISOString() } }] },
    limit: 100,
    overrideAccess: true,
  })

  for (const reservation of expired.docs) {
    await releaseWorkshopSeat(payload, String(reservation.id), 'expired')
  }
}
