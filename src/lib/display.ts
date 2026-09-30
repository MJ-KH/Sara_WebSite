import { toPersianDigits } from './digits'

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
