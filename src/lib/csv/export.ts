/**
 * خروجی CSV با محافظت در برابر formula injection: اگر مقدار یک سلول با =, +, -, @, tab
 * یا CR شروع شود، اکسل/شیت‌های مشابه ممکن است آن را به‌عنوان فرمول اجرا کنند؛ برای
 * خنثی‌سازی، یک آپاستروف در ابتدای مقدار اضافه می‌شود.
 */
function sanitizeCsvCell(value: unknown): string {
  const raw = value === null || value === undefined ? '' : String(value)
  const escaped = raw.replace(/"/g, '""')
  const needsFormulaGuard = /^[=+\-@\t\r]/.test(escaped)
  const guarded = needsFormulaGuard ? `'${escaped}` : escaped
  return `"${guarded}"`
}

export function toCsv(rows: Record<string, unknown>[], columns: { key: string; label: string }[]): string {
  const header = columns.map((c) => sanitizeCsvCell(c.label)).join(',')
  const lines = rows.map((row) => columns.map((c) => sanitizeCsvCell(row[c.key])).join(','))
  return [header, ...lines].join('\r\n')
}
