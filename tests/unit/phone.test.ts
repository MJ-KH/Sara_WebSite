import { describe, expect, it } from 'vitest'
import { normalizeIranMobile } from '@/lib/phone'

describe('normalizeIranMobile', () => {
  it('شکل‌های رایج شماره ایران را به یک فرم استاندارد نرمال می‌کند', () => {
    const expected = '+989121234567'
    expect(normalizeIranMobile('09121234567')).toBe(expected)
    expect(normalizeIranMobile('9121234567')).toBe(expected)
    expect(normalizeIranMobile('+989121234567')).toBe(expected)
    expect(normalizeIranMobile('00989121234567')).toBe(expected)
  })

  it('اعداد فارسی و عربی را قبول می‌کند', () => {
    expect(normalizeIranMobile('۰۹۱۲۱۲۳۴۵۶۷')).toBe('+989121234567')
    expect(normalizeIranMobile('٠٩١٢١٢٣٤٥٦٧')).toBe('+989121234567')
  })

  it('فاصله و خط تیره را نادیده می‌گیرد', () => {
    expect(normalizeIranMobile('0912-123-4567')).toBe('+989121234567')
    expect(normalizeIranMobile('0912 123 4567')).toBe('+989121234567')
  })

  it('شماره نامعتبر را رد می‌کند', () => {
    expect(normalizeIranMobile('123')).toBeNull()
    expect(normalizeIranMobile('+14155552671')).toBeNull()
    expect(normalizeIranMobile('')).toBeNull()
  })
})
