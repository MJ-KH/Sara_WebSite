import type { CollectionConfig } from 'payload'
import { denyAll, isOwner } from '@/access/roles'

/** ثبت رویدادهای حساس (تغییر قیمت، دسترسی، نقش، مالی، ارسال کمپین). فقط از سرور نوشته می‌شود. */
export const AuditLog: CollectionConfig = {
  slug: 'audit-log',
  admin: {
    useAsTitle: 'action',
    defaultColumns: ['action', 'entityType', 'entityId', 'actorLabel', 'createdAt'],
    group: 'تنظیمات',
  },
  access: {
    read: isOwner,
    create: denyAll,
    update: denyAll,
    delete: denyAll,
  },
  fields: [
    { name: 'action', type: 'text', required: true },
    { name: 'entityType', type: 'text', required: true },
    { name: 'entityId', type: 'text' },
    { name: 'actorLabel', type: 'text', label: 'انجام‌دهنده' },
    { name: 'beforeJson', type: 'json' },
    { name: 'afterJson', type: 'json' },
  ],
}
