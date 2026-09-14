const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'
const ENGLISH_DIGITS = '0123456789'

/**
 * ورودی‌های فرم باید هم اعداد فارسی و هم انگلیسی را قبول کنند؛ این تابع قبل از هر
 * پردازش سرور روی ورودی عددی فراخوانی می‌شود.
 */
export function convertDigitsToEnglish(input: string): string {
  return input.replace(/[۰-۹٠-٩]/g, (ch) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(ch)
    if (persianIndex !== -1) return ENGLISH_DIGITS[persianIndex] as string
    const arabicIndex = ARABIC_DIGITS.indexOf(ch)
    if (arabicIndex !== -1) return ENGLISH_DIGITS[arabicIndex] as string
    return ch
  })
}

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)] as string)
}
