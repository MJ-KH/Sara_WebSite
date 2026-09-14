import type { Payload } from 'payload'
import { applyFixedDiscount, applyPercentDiscount, assertIntegerRial } from '@/lib/money'
import { extractIdString } from '@/lib/relation'

export type PriceComputation = {
  unitPriceRial: number
  discountAmountRial: number
  totalRial: number
  discountCodeId: string | number | null
  discountCodeText: string | null
}

export type PriceComputationResult = { ok: true; price: PriceComputation } | { ok: false; error: string }

/**
 * قیمت نهایی همیشه اینجا (سرور) محاسبه می‌شود؛ هیچ‌گاه از کلاینت گرفته نمی‌شود.
 */
export async function computePackagePrice(
  payload: Payload,
  packageDoc: { id: string | number; priceRial: number },
  studentId: string | number,
  discountCodeText?: string | null,
): Promise<PriceComputationResult> {
  assertIntegerRial(packageDoc.priceRial)
  let discountAmountRial = 0
  let discountCodeId: string | number | null = null
  let normalizedCode: string | null = null

  if (discountCodeText?.trim()) {
    normalizedCode = discountCodeText.trim().toUpperCase()
    const result = await payload.find({
      collection: 'discount-codes',
      where: { code: { equals: normalizedCode } },
      limit: 1,
      overrideAccess: true,
    })
    const discount = result.docs[0]
    if (!discount || !discount.active) return { ok: false, error: 'discount_code_invalid' }

    const now = Date.now()
    if (discount.validFrom && new Date(discount.validFrom).getTime() > now) {
      return { ok: false, error: 'discount_code_not_started' }
    }
    if (discount.validTo && new Date(discount.validTo).getTime() < now) {
      return { ok: false, error: 'discount_code_expired' }
    }
    if (discount.maxUses && (discount.usedCount ?? 0) >= discount.maxUses) {
      return { ok: false, error: 'discount_code_exhausted' }
    }

    const applicable = discount.applicablePackages || []
    if (applicable.length > 0) {
      const applicableIds = applicable.map((p) => extractIdString(p))
      if (!applicableIds.includes(String(packageDoc.id))) {
        return { ok: false, error: 'discount_code_not_applicable' }
      }
    }

    if (discount.maxUsesPerStudent) {
      const priorUses = await payload.find({
        collection: 'orders',
        where: {
          and: [
            { student: { equals: studentId } },
            { discountCode: { equals: discount.id } },
            { status: { equals: 'paid' } },
          ],
        },
        limit: 1,
        overrideAccess: true,
      })
      if (priorUses.totalDocs >= discount.maxUsesPerStudent) {
        return { ok: false, error: 'discount_code_already_used' }
      }
    }

    discountAmountRial =
      discount.type === 'percent'
        ? packageDoc.priceRial - applyPercentDiscount(packageDoc.priceRial, discount.value)
        : packageDoc.priceRial - applyFixedDiscount(packageDoc.priceRial, discount.value)
    discountCodeId = discount.id
  }

  const totalRial = Math.max(0, packageDoc.priceRial - discountAmountRial)

  return {
    ok: true,
    price: {
      unitPriceRial: packageDoc.priceRial,
      discountAmountRial,
      totalRial,
      discountCodeId,
      discountCodeText: normalizedCode,
    },
  }
}
