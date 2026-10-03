/**
 * یکسان‌سازی متن فارسی ورودی کاربر تا جست‌وجو و ذخیره یکدست باشد:
 * - «ي/ى» عربی ← «ی» فارسی، «ك» ← «ک»، «ة» ← «ه»
 * - حذف نویسه‌های نامرئی جهت‌دهی و فاصله صفر (به‌جز نیم‌فاصله ZWNJ که در فارسی معنا دارد)
 * - تبدیل فاصله‌های پشت‌سرهم و فاصله نشکن به یک فاصله، و حذف فاصله ابتدا و انتها
 * ارقام دست نمی‌خورند؛ هر فیلد عددی (موبایل، کد) نرمال‌ساز خودش را دارد.
 */
export function normalizePersianText(value: string): string {
  return value
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/[​‎‏‪-‮⁦-⁩﻿]/g, '')
    .replace(/‌{2,}/g, '‌')
    .replace(/[ \t   ]+/g, ' ')
    .trim()
}

/** نسخه چندخطی (برای متن پیام): خط‌های جدید حفظ می‌شوند و هر خط جدا مرتب می‌شود. */
export function normalizePersianMultiline(value: string): string {
  return value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(normalizePersianText)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
