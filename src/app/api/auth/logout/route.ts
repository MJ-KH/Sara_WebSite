import { NextResponse } from 'next/server'
import { getStudentSessionCookieName } from '@/lib/auth/student-jwt'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(getStudentSessionCookieName(), '', { path: '/', maxAge: 0 })
  return response
}
