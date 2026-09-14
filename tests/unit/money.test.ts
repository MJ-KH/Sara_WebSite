import { describe, expect, it } from 'vitest'
import { applyFixedDiscount, applyPercentDiscount, formatToman, rialToToman, tomanToRial } from '@/lib/money'

describe('money helpers', () => {
  it('ریال را درست به تومان تبدیل می‌کند', () => {
    expect(rialToToman(10_000)).toBe(1000)
    expect(rialToToman(15)).toBe(1)
  })

  it('تومان را درست به ریال تبدیل می‌کند', () => {
    expect(tomanToRial(1000)).toBe(10_000)
  })

  it('روی مقدار غیرصحیح خطا می‌دهد', () => {
    expect(() => rialToToman(10.5)).toThrow()
    expect(() => rialToToman(-1)).toThrow()
  })

  it('تخفیف درصدی را درست اعمال می‌کند', () => {
    expect(applyPercentDiscount(100_000, 20)).toBe(80_000)
  })

  it('تخفیف ثابت را درست اعمال می‌کند و منفی نمی‌شود', () => {
    expect(applyFixedDiscount(10_000, 5_000)).toBe(5_000)
    expect(applyFixedDiscount(10_000, 50_000)).toBe(0)
  })

  it('واحد تومان را با برچسب فارسی نمایش می‌دهد', () => {
    expect(formatToman(250_000, { persianDigits: false })).toContain('تومان')
  })
})
