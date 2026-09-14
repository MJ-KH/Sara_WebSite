import type { Payload } from 'payload'
import { getPaymentGateway } from '@/lib/payments'
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

  const existingEntitlement = await payload.find({
    collection: 'entitlements',
    where: {
      and: [
        { student: { equals: student.id } },
        { package: { equals: pkg.id } },
        { revokedAt: { equals: null } },
        { or: [{ expiresAt: { equals: null } }, { expiresAt: { greater_than: new Date().toISOString() } }] },
      ],
    },
    limit: 1,
    overrideAccess: true,
  })
  if (existingEntitlement.totalDocs > 0) return { ok: false, error: 'already_has_access' }

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
      status: 'pending',
    },
    overrideAccess: true,
  })

  const gateway = getPaymentGateway()
  const callbackUrl = `${callbackBaseUrl}/api/payments/callback`
  const paymentResult = await gateway.createPayment({
    orderId: String(order.id),
    amountRial: price.totalRial,
    description: `خرید پکیج «${pkg.title}»`,
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
