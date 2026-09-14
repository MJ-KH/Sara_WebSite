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

export function formatToman(rial: number, options: { persianDigits?: boolean } = {}): string {
  const toman = rialToToman(rial)
  const formatted = new Intl.NumberFormat('en-US').format(toman)
  const withUnit = `${formatted} تومان`
  return options.persianDigits === false ? withUnit : toPersianDigits(withUnit)
}

export function formatRial(rial: number, options: { persianDigits?: boolean } = {}): string {
  assertIntegerRial(rial)
  const formatted = new Intl.NumberFormat('en-US').format(rial)
  const withUnit = `${formatted} ریال`
  return options.persianDigits === false ? withUnit : toPersianDigits(withUnit)
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
