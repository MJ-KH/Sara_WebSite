import { beforeAll, describe, expect, it } from 'vitest'
import { releaseWorkshopSeat, reserveWorkshopSeat } from '@/lib/workshops/reserve-seat'
import { createTestStudent, getTestPayload, randomSuffix } from './helpers'

describe('ظرفیت دوره حضوری (معیار پذیرش #۹)', () => {
  let payload: Awaited<ReturnType<typeof getTestPayload>>

  beforeAll(async () => {
    payload = await getTestPayload()
  })

  it('دو رزرو هم‌زمان برای آخرین صندلی، فقط یکی موفق می‌شود', async () => {
    const workshop = await payload.create({
      collection: 'workshops',
      data: { slug: `test-ws-${randomSuffix()}`, title: '[تست] دوره', status: 'published' },
      overrideAccess: true,
    })
    const session = await payload.create({
      collection: 'workshop-sessions',
      data: {
        workshop: workshop.id,
        startAt: new Date(Date.now() + 86_400_000).toISOString(),
        capacity: 1,
        occupiedCount: 0,
        priceRial: 1_000_000,
        status: 'published',
      },
      overrideAccess: true,
    })
    const studentA = await createTestStudent(payload)
    const studentB = await createTestStudent(payload)

    const [resultA, resultB] = await Promise.all([
      reserveWorkshopSeat(payload, String(session.id), String(studentA.id)),
      reserveWorkshopSeat(payload, String(session.id), String(studentB.id)),
    ])

    const results = [resultA, resultB]
    const succeeded = results.filter((r) => r.ok)
    const failed = results.filter((r) => !r.ok)

    expect(succeeded).toHaveLength(1)
    expect(failed).toHaveLength(1)
    const failedResult = failed[0]
    if (failedResult && !failedResult.ok) expect(failedResult.error).toBe('sold_out')

    const refreshedSession = await payload.findByID({ collection: 'workshop-sessions', id: session.id, overrideAccess: true })
    expect(refreshedSession.occupiedCount).toBe(1)
    expect(refreshedSession.occupiedCount).toBeLessThanOrEqual(refreshedSession.capacity)
  })

  it('آزادسازی رزرو منقضی، صندلی را برای رزرو بعدی باز می‌کند', async () => {
    const workshop = await payload.create({
      collection: 'workshops',
      data: { slug: `test-ws-${randomSuffix()}`, title: '[تست] دوره', status: 'published' },
      overrideAccess: true,
    })
    const session = await payload.create({
      collection: 'workshop-sessions',
      data: {
        workshop: workshop.id,
        startAt: new Date(Date.now() + 86_400_000).toISOString(),
        capacity: 1,
        occupiedCount: 0,
        priceRial: 1_000_000,
        status: 'published',
      },
      overrideAccess: true,
    })
    const studentA = await createTestStudent(payload)
    const studentB = await createTestStudent(payload)

    const first = await reserveWorkshopSeat(payload, String(session.id), String(studentA.id))
    expect(first.ok).toBe(true)

    const blocked = await reserveWorkshopSeat(payload, String(session.id), String(studentB.id))
    expect(blocked.ok).toBe(false)

    if (first.ok) await releaseWorkshopSeat(payload, first.reservationId, 'expired')

    const afterRelease = await reserveWorkshopSeat(payload, String(session.id), String(studentB.id))
    expect(afterRelease.ok).toBe(true)
  })
})
