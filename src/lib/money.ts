/**
 * واحد مرجع دیتابیس همیشه ریال و عدد صحیح است. تبدیل به تومان فقط برای نمایش UI است.
 * تبدیل به واحد مورد انتظار درگاه پرداخت (تومان برای زرین‌پال) فقط داخل adapter درگاه انجام می‌شود.
 */
import { toPersianDigits } from './digits'

export function assertIntegerRial(rial: number, label = 'amount'): void {
  if (!Number.isInteger(rial) || rial < 0) {
    throw new Error(`${label} must be a non-negative integer (Rial)`)
  }
}

export function rialToToman(rial: number): number {
  assertIntegerRial(rial)
  return Math.trunc(rial / 10)
}

export function tomanToRial(toman: number): number {
  if (!Number.isInteger(toman) || toman < 0) {
    throw new Error('toman amount must be a non-negative integer')
  }
  return toman * 10
}

/** با ارقام فارسی، جداکننده هزارگان هم فارسی (٬) می‌شود نه ویرگول لاتین. */
function localizeNumber(formatted: string, persianDigits: boolean | undefined): string {
  return persianDigits === false ? formatted : toPersianDigits(formatted).replace(/,/g, '٬')
}

export function formatToman(rial: number, options: { persianDigits?: boolean } = {}): string {
  const toman = rialToToman(rial)
  const formatted = new Intl.NumberFormat('en-US').format(toman)
  return `${localizeNumber(formatted, options.persianDigits)} تومان`
}

export function formatRial(rial: number, options: { persianDigits?: boolean } = {}): string {
  assertIntegerRial(rial)
  const formatted = new Intl.NumberFormat('en-US').format(rial)
  return `${localizeNumber(formatted, options.persianDigits)} ریال`
}

/** درصد تخفیف را روی مبلغ ریالی اعمال می‌کند و به عدد صحیح گرد می‌کند. */
export function applyPercentDiscount(rial: number, percent: number): number {
  assertIntegerRial(rial)
  if (percent < 0 || percent > 100) throw new Error('percent must be between 0 and 100')
  return Math.round(rial * (1 - percent / 100))
}

export function applyFixedDiscount(rial: number, discountRial: number): number {
  assertIntegerRial(rial)
  assertIntegerRial(discountRial, 'discountRial')
  return Math.max(0, rial - discountRial)
}

/**
 * درصد تخفیف نسبت به قیمت قبل، رو به پایین گرد می‌شود تا هیچ‌وقت بیشتر از واقعیت اعلام نشود
 * (۷۶٫۴٪ ← ۷۶٪). اگر قیمت قبل نباشد یا از قیمت فعلی بیشتر نباشد، صفر.
 */
export function discountPercent(priceRial: number, compareAtPriceRial?: number | null): number {
  if (!compareAtPriceRial || compareAtPriceRial <= priceRial) return 0
  return Math.floor(((compareAtPriceRial - priceRial) / compareAtPriceRial) * 100)
}
