import { describe, expect, it } from 'vitest'
import { toCsv } from '@/lib/csv/export'

describe('toCsv formula injection guard', () => {
  it('مقادیری که با =, +, -, @ شروع می‌شوند را خنثی می‌کند', () => {
    const csv = toCsv([{ name: '=cmd|calc' }, { name: '+1234' }, { name: '-1234' }, { name: '@SUM(A1)' }], [
      { key: 'name', label: 'نام' },
    ])
    const lines = csv.split('\r\n').slice(1)
    for (const line of lines) {
      expect(line).not.toMatch(/^"[=+\-@]/)
    }
  })

  it('مقادیر عادی را دست‌نخورده نگه می‌دارد', () => {
    const csv = toCsv([{ name: 'سارا نقی‌زاده' }], [{ key: 'name', label: 'نام' }])
    expect(csv).toContain('سارا نقی‌زاده')
  })
})
