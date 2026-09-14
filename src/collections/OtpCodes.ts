import type { CollectionConfig } from 'payload'
import { denyAll, isOwner } from '@/access/roles'

/**
 * کدهای یک‌بارمصرف ورود. هرگز از API عمومی قابل خواندن/نوشتن نیست — فقط از طریق
 * src/lib/auth/otp.ts با overrideAccess: true. حتی مدیران دسترسی معمولی به مقدار کد
 * ندارند (فقط هش ذخیره می‌شود).
 */
export const OtpCodes: CollectionConfig = {
  slug: 'otp-codes',
  admin: {
    useAsTitle: 'mobile',
    group: 'تنظیمات',
    description: 'فقط برای دیباگ فنی — کد واقعی هرگز ذخیره نمی‌شود، فقط هش آن.',
    hidden: ({ user }) => !(user && (user as { role?: string }).role === 'owner'),
  },
  access: {
    read: isOwner,
    create: denyAll,
    update: denyAll,
    delete: isOwner,
  },
  fields: [
    { name: 'mobile', type: 'text', required: true, index: true },
    { name: 'codeHash', type: 'text', required: true },
    { name: 'expiresAt', type: 'date', required: true },
    { name: 'attempts', type: 'number', required: true, defaultValue: 0 },
    { name: 'consumedAt', type: 'date' },
  ],
}
