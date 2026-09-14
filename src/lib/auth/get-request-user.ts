import 'server-only'
import config from '@payload-config'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'

export type AdminAuthedUser = { collection: 'admin-users'; id: number; role: string; name: string }
export type StudentAuthedUser = { collection: 'students'; id: number; mobile: string; name?: string | null }

/** احراز هویت درخواست جاری از روی کوکی — برای هر دو نوع کاربر (مدیر/هنرجو) کار می‌کند. */
export async function getRequestUser(): Promise<AdminAuthedUser | StudentAuthedUser | null> {
  const payload = await getPayload({ config })
  const headersList = await nextHeaders()
  const { user } = await payload.auth({ headers: headersList })
  return (user as AdminAuthedUser | StudentAuthedUser | null) ?? null
}

export async function requireStudent(): Promise<StudentAuthedUser | null> {
  const user = await getRequestUser()
  return user?.collection === 'students' ? user : null
}

export async function requireAdminStaff(): Promise<AdminAuthedUser | null> {
  const user = await getRequestUser()
  return user?.collection === 'admin-users' ? user : null
}
