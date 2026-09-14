import { jwtVerify, SignJWT } from 'jose'

const STUDENT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30 // ۳۰ روز

function getSecretKey(): Uint8Array {
  const secret = process.env.STUDENT_JWT_SECRET
  if (!secret || secret.length < 16) {
    throw new Error('STUDENT_JWT_SECRET تنظیم نشده یا خیلی کوتاه است')
  }
  return new TextEncoder().encode(secret)
}

export async function signStudentSessionToken(studentId: string): Promise<string> {
  return new SignJWT({ collection: 'students' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(studentId)
    .setIssuedAt()
    .setExpirationTime(`${STUDENT_SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey())
}

export async function verifyStudentSessionToken(token: string): Promise<{ studentId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    if (!payload.sub) return null
    return { studentId: payload.sub }
  } catch {
    return null
  }
}

export function getStudentSessionCookieName(): string {
  return process.env.STUDENT_SESSION_COOKIE_NAME || 'sn_student_session'
}

export const STUDENT_SESSION_MAX_AGE_SECONDS = STUDENT_SESSION_TTL_SECONDS
