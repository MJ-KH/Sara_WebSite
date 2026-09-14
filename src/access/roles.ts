import type { Access, PayloadRequest } from 'payload'

export type AdminRole = 'owner' | 'business_admin' | 'support'

type AuthedUser = {
  collection?: string
  role?: AdminRole
  id?: string | number
} | null | undefined

export function isAdminCollection(user: AuthedUser): user is NonNullable<AuthedUser> & { collection: 'admin-users' } {
  return Boolean(user && user.collection === 'admin-users')
}

export function isStudentCollection(user: AuthedUser): user is NonNullable<AuthedUser> & { collection: 'students' } {
  return Boolean(user && user.collection === 'students')
}

/**
 * این توابع فقط boolean برمی‌گردانند (هرگز Where) بنابراین هم در access سطح کالکشن و هم
 * سطح فیلد (FieldAccess) قابل استفاده‌اند — امضای پارامتر عمداً به `{ req }` محدود شده تا
 * با هر دو نوع آرگومان (AccessArgs / FieldAccessArgs) سازگار باشد.
 */
type BooleanAccess = (args: { req: PayloadRequest }) => boolean

/** فقط مالک/مدیر فنی — تنظیمات حساس (اتصال‌ها، نقش‌ها) */
export const isOwner: BooleanAccess = ({ req }) => {
  const user = req.user as AuthedUser
  return isAdminCollection(user) && user.role === 'owner'
}

/** مالک یا مدیر کسب‌وکار — محتوا، محصولات، سفارش‌ها، مخاطبان */
export const isOwnerOrBusinessAdmin: BooleanAccess = ({ req }) => {
  const user = req.user as AuthedUser
  return isAdminCollection(user) && (user.role === 'owner' || user.role === 'business_admin')
}

/** هر نقش مدیریتی، شامل پشتیبان — برای مشاهده/رسیدگی به درخواست‌ها */
export const isAnyAdminStaff: BooleanAccess = ({ req }) => {
  return isAdminCollection(req.user as AuthedUser)
}

/** فقط پشتیبان یا بالاتر (در عمل معادل هر نقش مدیریتی چون سه نقش موجود همین سه‌تاست) */
export const isSupportOrAbove: BooleanAccess = ({ req }) => {
  const user = req.user as AuthedUser
  return isAdminCollection(user) && ['owner', 'business_admin', 'support'].includes(user.role ?? '')
}

export const isAuthenticatedStudent: BooleanAccess = ({ req }) => {
  return isStudentCollection(req.user as AuthedUser)
}

export const denyAll: BooleanAccess = () => false
export const allowAll: BooleanAccess = () => true

/** عمومی: فقط محتوای منتشرشده (فیلد status دستی)؛ مدیران همه‌چیز را می‌بینند — فقط سطح کالکشن (Where برمی‌گرداند) */
export const publishedOrAdmin: Access = ({ req }) => {
  if (isAdminCollection(req.user as AuthedUser)) return true
  return { status: { equals: 'published' } }
}

/** مخصوص کالکشن‌هایی با drafts/versions داخلی Payload (فیلد _status) مثل Pages */
export const publishedVersionOrAdmin: Access = ({ req }) => {
  if (isAdminCollection(req.user as AuthedUser)) return true
  return { _status: { equals: 'published' } }
}
