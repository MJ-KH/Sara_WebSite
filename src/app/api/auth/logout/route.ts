import { type NextRequest, NextResponse } from 'next/server'
import { getStudentSessionCookieName } from '@/lib/auth/student-jwt'

/**
 * خروج هنرجو. دکمه «خروج از حساب» یک فرم معمولی است، پس بعد از پاک کردن کوکی به صفحه اصلی
 * برگردانده می‌شود (۳۰۳ تا مرورگر با GET برود)؛ درخواست fetch/JSON همان پاسخ JSON را می‌گیرد.
 */
export async function POST(req: NextRequest) {
  const wantsJson = req.headers.get('accept')?.includes('application/json') && !req.headers.get('accept')?.includes('text/html')
  const base = process.env.NEXT_PUBLIC_SERVER_URL || new URL(req.url).origin
  const response = wantsJson ? NextResponse.json({ ok: true }) : NextResponse.redirect(new URL('/', base), 303)
  // همان ویژگی‌های کوکی ورود، تا مرورگر حتماً همان کوکی را پاک کند
  response.cookies.set(getStudentSessionCookieName(), '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })
  return response
}
