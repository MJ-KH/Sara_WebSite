/**
 * فیلدهای رابطه‌ای Payload بسته به depth کوئری، یا فقط id (نوع id در این پروژه عدد صحیح
 * Postgres است) یا سند کامل populate‌شده هستند. extractId مقدار را در همان نوع اصلی
 * (برای نوشتن دوباره در data.*) برمی‌گرداند؛ extractIdString نسخه رشته‌ای برای JWT/کوکی/URL
 * و مقایسه است.
 */
export function extractId(
  value: string | number | { id: string | number } | null | undefined,
): string | number | undefined {
  if (value === null || value === undefined) return undefined
  if (typeof value === 'object') return value.id
  return value
}

export function extractIdString(
  value: string | number | { id: string | number } | null | undefined,
): string | undefined {
  const id = extractId(value)
  return id === undefined ? undefined : String(id)
}
