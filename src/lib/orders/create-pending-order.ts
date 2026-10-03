import type { Payload } from 'payload'
import { alreadyOwnsForPurchase, spotplayerCourseIdsFor } from '@/lib/packages/access'
import { getPaymentGateway } from '@/lib/payments'
import type { SpotPlayerDevice } from '@/lib/spotplayer/constants'
import { computePackagePrice } from './pricing'

export type CreatePackageOrderResult =
  | { ok: true; redirectUrl: string; orderId: string }
  | { ok: false; error: string }

export async function createPendingPackageOrder(
  payload: Payload,
  student: { id: string | number; mobile: string },
  packageSlug: string,
  discountCodeText: string | null,
  callbackBaseUrl: string,
  spotplayerDevice: SpotPlayerDevice | null = null,
): Promise<CreatePackageOrderResult> {
  const packages = await payload.find({
    collection: 'packages',
    where: { slug: { equals: packageSlug } },
    limit: 1,
    overrideAccess: true,
  })
  const pkg = packages.docs[0]
  if (!pkg || pkg.status === 'draft') return { ok: false, error: 'package_not_found' }
  if (pkg.status === 'stopped') return { ok: false, error: 'package_not_purchasable' }
  // دوره اسپات‌پلیر: لایسنس یک‌دستگاهی است، پس دستگاه باید قبل از پرداخت معلوم باشد
  const usesSpotPlayer = (await spotplayerCourseIdsFor(payload, pkg)).length > 0
  if (usesSpotPlayer && !spotplayerDevice) return { ok: false, error: 'device_required' }

  // دسترسی قبلی: مستقیم، از راه پکیج چنددوره‌ای، یا (برای پکیج) داشتن یکی از دوره‌های داخلش
  if (await alreadyOwnsForPurchase(payload, student.id, pkg)) {
    return { ok: false, error: pkg.kind === 'bundle' ? 'bundle_part_owned' : 'already_has_access' }
  }

  const priceResult = await computePackagePrice(payload, pkg, student.id, discountCodeText)
  if (!priceResult.ok) return { ok: false, error: priceResult.error }
  const { price } = priceResult

  const siteSettings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: true })

  const order = await payload.create({
    collection: 'orders',
    data: {
      student: Number(student.id),
      subjectType: 'package',
      subjectPackage: pkg.id,
      titleSnapshot: pkg.title,
      unitPriceRialSnapshot: price.unitPriceRial,
      discountCode: price.discountCodeId ? Number(price.discountCodeId) : null,
      discountCodeSnapshot: price.discountCodeText,
      discountAmountRialSnapshot: price.discountAmountRial,
      totalRialSnapshot: price.totalRial,
      accessDurationDaysSnapshot: pkg.accessDurationDays || null,
      termsVersionSnapshot: siteSettings.legal?.purchaseTermsVersion || '1',
      spotplayerDevice: usesSpotPlayer ? spotplayerDevice : null,
      status: 'pending',
    },
    overrideAccess: true,
  })

  const gateway = getPaymentGateway()
  const callbackUrl = `${callbackBaseUrl}/api/payments/callback`
  const paymentResult = await gateway.createPayment({
    orderId: String(order.id),
    amountRial: price.totalRial,
    description: `خرید دوره «${pkg.title}»`,
    callbackUrl,
    payerMobile: student.mobile,
  })

  if (!paymentResult.ok) {
    await payload.update({ collection: 'orders', id: order.id, data: { status: 'failed' }, overrideAccess: true })
    return { ok: false, error: paymentResult.error }
  }

  await payload.create({
    collection: 'payment-attempts',
    data: {
      order: order.id,
      gateway: gateway.name,
      providerRefId: paymentResult.providerRefId,
      amountRialSnapshot: price.totalRial,
      status: 'initiated',
    },
    overrideAccess: true,
  })

  return { ok: true, redirectUrl: paymentResult.redirectUrl, orderId: String(order.id) }
}
