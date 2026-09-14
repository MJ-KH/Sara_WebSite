import type { Payload } from 'payload'
import { getPaymentGateway } from '@/lib/payments'
import { extractId } from '@/lib/relation'
import type { Order } from '@/payload-types'

export type CompletePaymentResult = { ok: true; alreadyProcessed: boolean } | { ok: false; error: string }

/**
 * منطق مرکزی تأیید پرداخت — برای هر دو نوع سفارش (پکیج/دوره حضوری) و هر دو درگاه
 * (mock/zarinpal) مشترک است. providerRefId کلید یکتای idempotency است: اگر تلاش پرداخت
 * قبلاً succeeded ثبت شده باشد، callback تکراری هیچ اثر اضافه‌ای ندارد (نه entitlement
 * دوباره، نه صف پیام دوباره). مبلغ همیشه از attempt.amountRialSnapshot خوانده می‌شود، هرگز
 * از callbackParams.
 */
export async function completeOrderPayment(
  payload: Payload,
  providerRefId: string,
  callbackParams: Record<string, string | string[] | undefined>,
): Promise<CompletePaymentResult> {
  const attempts = await payload.find({
    collection: 'payment-attempts',
    where: { providerRefId: { equals: providerRefId } },
    limit: 1,
    overrideAccess: true,
  })
  const attempt = attempts.docs[0]
  if (!attempt) return { ok: false, error: 'attempt_not_found' }

  if (attempt.status === 'succeeded') return { ok: true, alreadyProcessed: true }

  const gateway = getPaymentGateway()
  const verifyResult = await gateway.verifyPayment({
    providerRefId,
    expectedAmountRial: attempt.amountRialSnapshot,
    callbackParams,
  })

  const orderId = extractId(attempt.order)
  if (orderId === undefined) return { ok: false, error: 'order_not_found' }

  if (!verifyResult.ok) {
    await payload.update({
      collection: 'payment-attempts',
      id: attempt.id,
      data: { status: 'failed', rawResponseRedacted: (verifyResult.raw as object) ?? null },
      overrideAccess: true,
    })
    await payload.update({ collection: 'orders', id: orderId, data: { status: 'failed' }, overrideAccess: true })
    return { ok: false, error: verifyResult.error }
  }

  const order = await payload.findByID({ collection: 'orders', id: orderId, overrideAccess: true })
  if (!order) return { ok: false, error: 'order_not_found' }

  if (order.status === 'paid') {
    // محافظ اضافی در برابر race نادر بین دو callback هم‌زمان که هر دو از چک بالا رد شده باشند
    await payload.update({
      collection: 'payment-attempts',
      id: attempt.id,
      data: { status: 'succeeded', providerTransactionId: verifyResult.providerTransactionId },
      overrideAccess: true,
    })
    return { ok: true, alreadyProcessed: true }
  }

  const transactionID = await payload.db.beginTransaction()
  if (!transactionID) throw new Error('failed to begin database transaction')

  try {
    await payload.update({
      collection: 'payment-attempts',
      id: attempt.id,
      data: {
        status: 'succeeded',
        providerTransactionId: verifyResult.providerTransactionId,
        rawResponseRedacted: (verifyResult.raw as object) ?? null,
      },
      req: { transactionID },
      overrideAccess: true,
    })
    await payload.update({
      collection: 'orders',
      id: order.id,
      data: { status: 'paid', paidAt: new Date().toISOString() },
      req: { transactionID },
      overrideAccess: true,
    })

    if (order.subjectType === 'package') {
      await grantPackageEntitlement(payload, order, transactionID)
    } else if (order.subjectType === 'workshop_session') {
      await confirmWorkshopEnrollment(payload, order, transactionID)
    }

    if (order.discountCode) {
      const discountId = extractId(order.discountCode)
      if (discountId !== undefined) {
        const discount = await payload.findByID({
          collection: 'discount-codes',
          id: discountId,
          req: { transactionID },
          overrideAccess: true,
        })
        await payload.update({
          collection: 'discount-codes',
          id: discountId,
          data: { usedCount: (discount.usedCount || 0) + 1 },
          req: { transactionID },
          overrideAccess: true,
        })
      }
    }

    await payload.db.commitTransaction(transactionID)
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }

  return { ok: true, alreadyProcessed: false }
}

async function grantPackageEntitlement(payload: Payload, order: Order, transactionID: string | number) {
  const packageId = extractId(order.subjectPackage)
  const studentId = extractId(order.student)
  if (packageId === undefined || studentId === undefined) return

  const accessDurationDays = order.accessDurationDaysSnapshot ?? null
  const expiresAt = accessDurationDays
    ? new Date(Date.now() + accessDurationDays * 24 * 60 * 60 * 1000).toISOString()
    : null

  await payload.create({
    collection: 'entitlements',
    data: {
      student: Number(studentId),
      package: Number(packageId),
      sourceOrder: order.id,
      grantedAt: new Date().toISOString(),
      expiresAt,
    },
    req: { transactionID },
    overrideAccess: true,
  })

  await payload.create({
    collection: 'jobs',
    data: {
      type: 'sms_purchase_confirm',
      uniqueKey: `purchase_confirm:${order.id}`,
      payload: { orderId: order.id, studentId: Number(studentId), packageId: Number(packageId) },
      scheduledFor: new Date().toISOString(),
      status: 'pending',
            attempts: 0,
    },
    req: { transactionID },
    overrideAccess: true,
  })
}

async function confirmWorkshopEnrollment(payload: Payload, order: Order, transactionID: string | number) {
  const sessionId = extractId(order.subjectWorkshopSession)
  const studentId = extractId(order.student)
  if (sessionId === undefined || studentId === undefined) return

  const reservations = await payload.find({
    collection: 'workshop-reservations',
    where: { and: [{ order: { equals: order.id } }, { status: { equals: 'holding' } }] },
    limit: 1,
    req: { transactionID },
    overrideAccess: true,
  })
  const reservation = reservations.docs[0]
  if (!reservation) return

  await payload.update({
    collection: 'workshop-reservations',
    id: reservation.id,
    data: { status: 'confirmed' },
    req: { transactionID },
    overrideAccess: true,
  })

  await payload.create({
    collection: 'workshop-enrollments',
    data: { session: Number(sessionId), student: Number(studentId), order: order.id, status: 'confirmed' },
    req: { transactionID },
    overrideAccess: true,
  })

  await payload.create({
    collection: 'jobs',
    data: {
      type: 'sms_workshop_enrollment_confirm',
      uniqueKey: `workshop_confirm:${order.id}`,
      payload: { orderId: order.id, studentId: Number(studentId), sessionId: Number(sessionId) },
      scheduledFor: new Date().toISOString(),
      status: 'pending',
            attempts: 0,
    },
    req: { transactionID },
    overrideAccess: true,
  })
}
