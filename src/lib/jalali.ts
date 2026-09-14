import * as jalaali from 'jalaali-js'
import { toPersianDigits } from './digits'

/**
 * ایران از سال ۱۴۰۱ (۲۰۲۲ میلادی) تغییر ساعت تابستانی/زمستانی (DST) را متوقف کرده و
 * منطقه‌زمانی Asia/Tehran به‌صورت ثابت UTC+03:30 است. به همین دلیل به‌جای وابستگی به
 * کتابخانه‌های سنگین منطقه‌زمانی، از افست ثابت استفاده می‌کنیم. اگر این فرض در آینده
 * توسط دولت ایران تغییر کند، فقط همین مقدار باید به‌روزرسانی شود.
 */
export const BUSINESS_UTC_OFFSET_MINUTES = 210

export type JalaliBirthday = {
  day: number
  month: number
  /** اختیاری؛ طبق سند سال تولد اجباری نیست */
  year?: number
}

type WallClockParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

export function utcToBusinessWallClock(date: Date): WallClockParts {
  const shifted = new Date(date.getTime() + BUSINESS_UTC_OFFSET_MINUTES * 60_000)
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  }
}

export function businessWallClockToUtc(parts: {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}): Date {
  const utcMillis =
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute) -
    BUSINESS_UTC_OFFSET_MINUTES * 60_000
  return new Date(utcMillis)
}

export function gregorianToJalali(date: Date): { jy: number; jm: number; jd: number } {
  const local = utcToBusinessWallClock(date)
  return jalaali.toJalaali(local.year, local.month, local.day)
}

export function jalaliMonthLength(jy: number, jm: number): number {
  return jalaali.jalaaliMonthLength(jy, jm)
}

export function isJalaliLeapYear(jy: number): boolean {
  return jalaali.isLeapJalaaliYear(jy)
}

/** روزهای هفته و ماه‌های فارسی برای نمایش */
export const JALALI_MONTH_NAMES_FA = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
]

export function formatJalaliDate(date: Date): string {
  const { jy, jm, jd } = gregorianToJalali(date)
  return toPersianDigits(`${jd} ${JALALI_MONTH_NAMES_FA[jm - 1]} ${jy}`)
}

/**
 * اگر روز تولد (مثلاً ۳۰ اسفند) در سال جلالی هدف وجود نداشته باشد (اسفند ۲۹ روزه در سال
 * غیرکبیسه)، به آخرین روز همان ماه (۲۹ اسفند) کاهش می‌یابد. این رفتار طبق سند صراحتاً
 * انتخاب و باید آزمون شود (ر.ک. tests/unit/jalali.test.ts).
 */
export function resolveBirthdayDayForJalaliYear(birthday: JalaliBirthday, targetJy: number): number {
  const monthLength = jalaliMonthLength(targetJy, birthday.month)
  return Math.min(birthday.day, monthLength)
}

/**
 * زمان UTC بعدیِ ارسال پیام تبریک تولد را محاسبه می‌کند؛ ساعت ارسال به وقت محلی کسب‌وکار
 * (پیش‌فرض ۹ صبح) قابل تنظیم است. اگر سالگرد امسال از «fromUtc» گذشته باشد، سال بعد
 * محاسبه می‌شود — به همین دلیل هر بار اجرای worker حداکثر یک رویداد در سال برای هر نفر
 * تولید می‌کند (به‌همراه کلید یکتای صف بر اساس سال جلالی هدف).
 */
export function nextBirthdaySendUtc(
  birthday: JalaliBirthday,
  fromUtc: Date,
  sendHourLocal = 9,
): { occurrenceUtc: Date; targetJalaliYear: number } {
  const nowJalali = gregorianToJalali(fromUtc)
  let targetJy = nowJalali.jy

  const computeOccurrence = (jy: number) => {
    const day = resolveBirthdayDayForJalaliYear(birthday, jy)
    const { gy, gm, gd } = jalaali.toGregorian(jy, birthday.month, day)
    return businessWallClockToUtc({ year: gy, month: gm, day: gd, hour: sendHourLocal, minute: 0 })
  }

  let occurrenceUtc = computeOccurrence(targetJy)
  if (occurrenceUtc.getTime() <= fromUtc.getTime()) {
    targetJy += 1
    occurrenceUtc = computeOccurrence(targetJy)
  }

  return { occurrenceUtc, targetJalaliYear: targetJy }
}
