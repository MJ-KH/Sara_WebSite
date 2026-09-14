import type { CollectionConfig } from 'payload'
import { isOwner, isOwnerOrBusinessAdmin } from '@/access/roles'
import { describeActor, recordAuditLog } from '@/lib/audit/log'

/**
 * مدیران و پشتیبان‌ها — با ایمیل/پسورد داخلی Payload وارد می‌شوند، کاملاً جدا از هنرجویان.
 * نقش عمومی نمی‌تواند این کالکشن را بسازد یا نقش خودش را ارتقا دهد (create/update محدود
 * به owner است؛ حتی مدیر کسب‌وکار نمی‌تواند نقش بسازد یا تغییر دهد).
 */
export const AdminUsers: CollectionConfig = {
  slug: 'admin-users',
  auth: {
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 8,
    lockTime: 10 * 60 * 1000,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'تنظیمات',
    description: 'حساب‌های مدیر و پشتیبان — برای هنرجویان از کالکشن «هنرجویان» استفاده کنید.',
  },
  access: {
    read: isOwnerOrBusinessAdmin,
    create: isOwner,
    update: isOwner,
    delete: isOwner,
    admin: ({ req }) => Boolean(req.user && (req.user as { collection?: string }).collection === 'admin-users'),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'نام',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'support',
      label: 'نقش',
      options: [
        { label: 'مالک / مدیر فنی', value: 'owner' },
        { label: 'مدیر کسب‌وکار (سارا)', value: 'business_admin' },
        { label: 'پشتیبان', value: 'support' },
      ],
      access: {
        // حتی مدیر کسب‌وکار حق تغییر نقش (ارتقای خود یا دیگران) را ندارد؛ فقط owner.
        update: isOwner,
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ req, doc, previousDoc, operation }) => {
        if (operation === 'update' && previousDoc && previousDoc.role !== doc.role) {
          await recordAuditLog(req.payload, {
            action: 'admin_role_changed',
            entityType: 'admin-users',
            entityId: String(doc.id),
            actorLabel: describeActor(req.user as never),
            beforeJson: { role: previousDoc.role },
            afterJson: { role: doc.role },
          })
        }
        if (operation === 'create') {
          await recordAuditLog(req.payload, {
            action: 'admin_created',
            entityType: 'admin-users',
            entityId: String(doc.id),
            actorLabel: describeActor(req.user as never),
            afterJson: { role: doc.role, email: doc.email },
          })
        }
      },
    ],
  },
}
