import type { CollectionConfig } from 'payload'
import { denyAll, isOwner } from '@/access/roles'

/**
 * صف پایدار کارهای زمان‌بندی‌شده (پیامک تراکنشی/تبلیغاتی/تولد/یادآوری). worker با
 * poll و uniqueKey از ارسال تکراری جلوگیری می‌کند (ر.ک. src/worker).
 */
export const Jobs: CollectionConfig = {
  slug: 'jobs',
  admin: {
    useAsTitle: 'type',
    defaultColumns: ['type', 'status', 'scheduledFor', 'attempts'],
    group: 'ارتباطات',
    hidden: ({ user }) => !(user && (user as { role?: string }).role === 'owner'),
  },
  access: {
    read: isOwner,
    create: denyAll,
    update: denyAll,
    delete: isOwner,
  },
  fields: [
    { name: 'type', type: 'text', required: true, index: true },
    {
      name: 'uniqueKey',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'کلید یکتا (نوع + مخاطب + نوبت) برای جلوگیری از ارسال تکراری' },
    },
    { name: 'payload', type: 'json', required: true },
    { name: 'scheduledFor', type: 'date', required: true, index: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'در انتظار', value: 'pending' },
        { label: 'در حال پردازش', value: 'processing' },
        { label: 'ارسال‌شده', value: 'sent' },
        { label: 'ناموفق', value: 'failed' },
      ],
    },
    { name: 'attempts', type: 'number', required: true, defaultValue: 0 },
    { name: 'lastError', type: 'text' },
    { name: 'providerMessageId', type: 'text' },
  ],
}
