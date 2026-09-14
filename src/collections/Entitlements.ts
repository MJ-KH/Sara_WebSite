import type { Access, CollectionConfig } from 'payload'
import { isAdminCollection, isOwnerOrBusinessAdmin } from '@/access/roles'
import { describeActor, recordAuditLog } from '@/lib/audit/log'

type ReqUser = { collection?: string; id?: string | number } | null | undefined

const readOwnOrAdminStaff: Access = ({ req }) => {
  const user = req.user as ReqUser
  if (isAdminCollection(user)) return true
  if (user?.collection === 'students') return { student: { equals: user.id } }
  return false
}

/**
 * دسترسی هر هنرجو به هر پکیج. expiresAt=null یعنی دسترسی مادام‌العمر. تغییر مدت دسترسی
 * برای خریداران قبلی یک عملیات جداگانه و ثبت‌شده است (history)، نه اثر جانبی ویرایش پکیج.
 * ساخت/تمدید فقط از src/lib/orders (بعد از تأیید پرداخت) یا توسط مدیر با ثبت تاریخچه.
 */
export const Entitlements: CollectionConfig = {
  slug: 'entitlements',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['student', 'package', 'grantedAt', 'expiresAt', 'revokedAt'],
    group: 'فروش',
  },
  access: {
    read: readOwnOrAdminStaff,
    create: isOwnerOrBusinessAdmin,
    update: isOwnerOrBusinessAdmin,
    delete: () => false,
  },
  fields: [
    { name: 'student', type: 'relationship', relationTo: 'students', required: true },
    { name: 'package', type: 'relationship', relationTo: 'packages', required: true },
    { name: 'sourceOrder', type: 'relationship', relationTo: 'orders' },
    { name: 'grantedAt', type: 'date', required: true },
    { name: 'expiresAt', type: 'date', label: 'انقضا (خالی = مادام‌العمر)' },
    { name: 'revokedAt', type: 'date' },
    {
      name: 'history',
      type: 'array',
      admin: { description: 'تاریخچه تغییر دستی مدت/وضعیت دسترسی توسط مدیر' },
      fields: [
        { name: 'changedAt', type: 'date', required: true },
        { name: 'changedBy', type: 'relationship', relationTo: 'admin-users' },
        { name: 'action', type: 'text', required: true },
        { name: 'note', type: 'textarea' },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ req, operation, data }) => {
        if (operation === 'create' && data?.student && data?.package) {
          const existing = await req.payload.find({
            collection: 'entitlements',
            where: { and: [{ student: { equals: data.student } }, { package: { equals: data.package } }] },
            limit: 1,
            overrideAccess: true,
          })
          if (existing.totalDocs > 0) {
            throw new Error('این هنرجو قبلاً به این پکیج دسترسی دارد؛ به‌جای ساخت رکورد جدید، رکورد موجود را تمدید کنید.')
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ req, doc, previousDoc, operation }) => {
        if (operation === 'create') {
          await recordAuditLog(req.payload, {
            action: 'entitlement_granted',
            entityType: 'entitlements',
            entityId: String(doc.id),
            actorLabel: describeActor(req.user as never),
            afterJson: { student: doc.student, package: doc.package, expiresAt: doc.expiresAt },
          })
        } else if (previousDoc && (previousDoc.expiresAt !== doc.expiresAt || previousDoc.revokedAt !== doc.revokedAt)) {
          await recordAuditLog(req.payload, {
            action: 'entitlement_modified',
            entityType: 'entitlements',
            entityId: String(doc.id),
            actorLabel: describeActor(req.user as never),
            beforeJson: { expiresAt: previousDoc.expiresAt, revokedAt: previousDoc.revokedAt },
            afterJson: { expiresAt: doc.expiresAt, revokedAt: doc.revokedAt },
          })
        }
      },
    ],
  },
}
