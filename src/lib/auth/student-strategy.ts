import type { AuthStrategy } from 'payload'
import { getStudentSessionCookieName, verifyStudentSessionToken } from './student-jwt'

/**
 * استراتژی احراز هویت سفارشی برای کالکشن Students. برخلاف مدیران (که با ایمیل/پسورد
 * داخلی Payload وارد می‌شوند)، هنرجو با موبایل+OTP وارد می‌شود و یک JWT سفارشی
 * (src/lib/auth/student-jwt.ts) در کوکی httpOnly دریافت می‌کند. این استراتژی همان JWT را
 * می‌خواند و req.user را برای بقیه access control کالکشن‌ها پر می‌کند.
 * طبق مستندات رسمی Payload: https://payloadcms.com/docs/authentication/custom-strategies
 */
export const studentJwtStrategy: AuthStrategy = {
  name: 'student-jwt',
  authenticate: async ({ payload, headers }) => {
    const cookieHeader = headers.get('cookie')
    if (!cookieHeader) return { user: null }

    const cookieName = getStudentSessionCookieName()
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`))
    if (!match?.[1]) return { user: null }

    const verified = await verifyStudentSessionToken(decodeURIComponent(match[1]))
    if (!verified) return { user: null }

    const student = await payload.findByID({
      collection: 'students',
      id: verified.studentId,
      disableErrors: true,
      overrideAccess: true,
    })
    if (!student) return { user: null }

    return { user: { ...student, collection: 'students' } }
  },
}
