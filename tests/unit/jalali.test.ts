import { describe, expect, it } from 'vitest'
import { businessWallClockToUtc, gregorianToJalali, nextBirthdaySendUtc, resolveBirthdayDayForJalaliYear } from '@/lib/jalali'

describe('jalali birthday scheduling', () => {
  it('در سال غیرکبیسه، ۳۰ اسفند به ۲۹ اسفند کاهش می‌یابد', () => {
    // ۱۴۰۲ سال غیرکبیسه است (اسفند ۲۹ روزه)
    const day = resolveBirthdayDayForJalaliYear({ day: 30, month: 12 }, 1402)
    expect(day).toBe(29)
  })

  it('در سال کبیسه، ۳۰ اسفند همان ۳۰ اسفند باقی می‌ماند', () => {
    // ۱۴۰۳ سال کبیسه است (اسفند ۳۰ روزه)
    const day = resolveBirthdayDayForJalaliYear({ day: 30, month: 12 }, 1403)
    expect(day).toBe(30)
  })

  it('روزهای معمولی بدون تغییر باقی می‌مانند', () => {
    const day = resolveBirthdayDayForJalaliYear({ day: 15, month: 1 }, 1403)
    expect(day).toBe(15)
  })

  it('سالگرد بعدی وقتی امسال هنوز نرسیده، همان‌سال محاسبه می‌شود', () => {
    // «امروز» را وسط سال جلالی فرض کن و تولدی در آینده نزدیک همان سال بگذار
    const now = businessWallClockToUtc({ year: 2024, month: 3, day: 21, hour: 8, minute: 0 }) // نزدیک ابتدای ۱۴۰۳
    const nowJalali = gregorianToJalali(now)
    const { occurrenceUtc, targetJalaliYear } = nextBirthdaySendUtc({ day: 1, month: 2 }, now, 9)
    expect(targetJalaliYear).toBe(nowJalali.jy)
    expect(occurrenceUtc.getTime()).toBeGreaterThan(now.getTime())
  })

  it('اگر سالگرد امسال گذشته باشد، سال بعد محاسبه می‌شود', () => {
    const now = businessWallClockToUtc({ year: 2024, month: 6, day: 1, hour: 8, minute: 0 })
    const nowJalali = gregorianToJalali(now)
    const { occurrenceUtc, targetJalaliYear } = nextBirthdaySendUtc({ day: 1, month: 1 }, now, 9)
    expect(targetJalaliYear).toBe(nowJalali.jy + 1)
    expect(occurrenceUtc.getTime()).toBeGreaterThan(now.getTime())
  })

  it('هر بار اجرا حداکثر یک رویداد در سال تولید می‌کند (کلید یکتا شامل سال جلالی هدف)', () => {
    const now = new Date()
    const first = nextBirthdaySendUtc({ day: 10, month: 5 }, now)
    const second = nextBirthdaySendUtc({ day: 10, month: 5 }, now)
    expect(first.targetJalaliYear).toBe(second.targetJalaliYear)
    expect(first.occurrenceUtc.getTime()).toBe(second.occurrenceUtc.getTime())
  })
})
