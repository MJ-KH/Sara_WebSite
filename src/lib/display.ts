import { toPersianDigits } from './digits'
import { formatIranMobileForDisplay, normalizeIranMobile } from './phone'

/** لینک «پیام در واتساپ» با متن آماده اختیاری (شماره ایران به قالب بین‌المللی تبدیل می‌شود). */
export function whatsappLink(number: string | null | undefined, greeting?: string | null): string | null {
  if (!number) return null
  const e164 = normalizeIranMobile(number)
  const digits = (e164 ?? number).replace(/\D/g, '').replace(/^0/, '98')
  return `https://wa.me/${digits}${greeting ? `?text=${encodeURIComponent(greeting)}` : ''}`
}

/** شماره تماس برای نمایش (ارقام فارسی، گروه‌بندی‌شده) و لینک tel: قابل لمس در موبایل. */
export function phoneForDisplay(raw: string | null | undefined): { text: string; href: string } | null {
  if (!raw) return null
  const e164 = normalizeIranMobile(raw)
  if (!e164) {
    // تلفن ثابت (مثلاً ۰۲۱۸۸۶۸۳۵۰۲): کد شهر جدا نمایش داده می‌شود
    const digits = raw.replace(/\D/g, '')
    const text = /^0\d{10}$/.test(digits) ? `${digits.slice(0, 3)}-${digits.slice(3)}` : raw
    return { text: toPersianDigits(text), href: `tel:${digits || raw}` }
  }
  return { text: toPersianDigits(formatIranMobileForDisplay(e164)), href: `tel:${e164}` }
}

const SAMPLE_MARKER = /^\s*\[نمونه\]\s*/

/**
 * داده نمونه در دیتابیس با پیشوند «[نمونه]» علامت خورده تا قابل شناسایی و پاک‌سازی باشد.
 * در نمایش، پیشوند خام را برمی‌داریم و به‌جایش یک برچسب طراحی‌شده نشان می‌دهیم.
 */
export function splitSampleMarker(text: string | null | undefined): { text: string; isSample: boolean } {
  const value = text ?? ''
  return SAMPLE_MARKER.test(value)
    ? { text: value.replace(SAMPLE_MARKER, ''), isSample: true }
    : { text: value, isSample: false }
}

/** مدت آموزش به فارسی روان، مثلاً «۴ ساعت و ۲۰ دقیقه» یا «۴۵ دقیقه». */
export function formatDurationFa(totalSeconds: number): string {
  const minutes = Math.round(totalSeconds / 60)
  if (minutes < 60) return `${toPersianDigits(Math.max(minutes, 1))} دقیقه`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0
    ? `${toPersianDigits(hours)} ساعت`
    : `${toPersianDigits(hours)} ساعت و ${toPersianDigits(rest)} دقیقه`
}
