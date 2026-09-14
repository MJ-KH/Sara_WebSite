import type { Payload } from 'payload'
import { getPaymentGateway } from '@/lib/payments'
import { releaseWorkshopSeat, reserveWorkshopSeat } from './reserve-seat'

export type CreateWorkshopOrderResult =
  | { ok: true; redirectUrl: string; orderId: string }
  | { ok: false; error: string }

export async function createPendingWorkshopOrder(
  payload: Payload,
  student: { id: string | number; mobile: string },
  sessionId: string | number,
  callbackBaseUrl: string,
): Promise<CreateWorkshopOrderResult> {
  const session = await payload.findByID({ collection: 'workshop-sessions', id: sessionId, overrideAccess: true, depth: 1 })
  if (!session || session.status !== 'published') return { ok: false, error: 'session_not_open' }

  const existingEnrollment = await payload.find({
    collection: 'workshop-enrollments',
    where: { and: [{ session: { equals: sessionId } }, { student: { equals: student.id } }, { status: { equals: 'confirmed' } }] },
    limit: 1,
    overrideAccess: true,
  })
  if (existingEnrollment.totalDocs > 0) return { ok: false, error: 'already_enrolled' }

  const reserveResult = await reserveWorkshopSeat(payload, sessionId, student.id)
  if (!reserveResult.ok) return { ok: false, error: reserveResult.error }

  const workshop = typeof session.workshop === 'object' ? session.workshop : null
  const siteSettings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: true })

  const order = await payload.create({
    collection: 'orders',
    data: {
      student: Number(student.id),
      subjectType: 'workshop_session',
      subjectWorkshopSession: Number(sessionId),
      titleSnapshot: workshop?.title || 'دوره حضوری',
      unitPriceRialSnapshot: session.priceRial,
      discountAmountRialSnapshot: 0,
      totalRialSnapshot: session.priceRial,
      termsVersionSnapshot: siteSettings.legal?.purchaseTermsVersion || '1',
      status: 'pending',
    },
    overrideAccess: true,
  })

  await payload.update({
    collection: 'workshop-reservations',
    id: reserveResult.reservationId,
    data: { order: order.id },
    overrideAccess: true,
  })

  const gateway = getPaymentGateway()
  const paymentResult = await gateway.createPayment({
    orderId: String(order.id),
    amountRial: session.priceRial,
    description: `ثبت‌نام دوره حضوری «${workshop?.title || ''}»`,
    callbackUrl: `${callbackBaseUrl}/api/payments/callback`,
    payerMobile: student.mobile,
  })

  if (!paymentResult.ok) {
    await payload.update({ collection: 'orders', id: order.id, data: { status: 'failed' }, overrideAccess: true })
    await releaseWorkshopSeat(payload, reserveResult.reservationId, 'released')
    return { ok: false, error: paymentResult.error }
  }

  await payload.create({
    collection: 'payment-attempts',
    data: {
      order: order.id,
      gateway: gateway.name,
      providerRefId: paymentResult.providerRefId,
      amountRialSnapshot: session.priceRial,
      status: 'initiated',
    },
    overrideAccess: true,
  })

  return { ok: true, redirectUrl: paymentResult.redirectUrl, orderId: String(order.id) }
}
