import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { convertDigitsToEnglish } from './digits'

/**
 * موبایل ایران را از شکل‌های رایج (۰۹۱۲..., 09121234567, +989121234567, 00989121234567،
 * با اعداد فارسی یا انگلیسی) نرمال‌سازی می‌کند و شکل استاندارد E.164 برمی‌گرداند.
 * این مقدار مبنای یکتابودن پرونده هنرجو است. ورودی نامعتبر null برمی‌گرداند.
 */
export function normalizeIranMobile(raw: string): string | null {
  const ascii = convertDigitsToEnglish(raw).trim().replace(/[\s-]/g, '')
  if (!ascii) return null
  const phone = parsePhoneNumberFromString(ascii, 'IR')
  if (!phone || !phone.isValid() || phone.country !== 'IR') return null
  return phone.number
}

/** نمایش خوانا با صفر ابتدایی، مثلاً +989121234567 -> 0912 123 4567 */
export function formatIranMobileForDisplay(e164: string): string {
  const phone = parsePhoneNumberFromString(e164)
  if (!phone) return e164
  const national = phone.formatNational().replace(/\D/g, '')
  return national.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3')
}
