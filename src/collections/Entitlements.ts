import type { Access, CollectionConfig } from 'payload'
import { isAdminCollection, isOwnerOrBusinessAdmin } from '@/access/roles'
import { describeActor, recordAuditLog } from '@/lib/audit/log'
import { SPOTPLAYER_DEVICE_OPTIONS, SPOTPLAYER_JOB_TYPE } from '@/lib/spotplayer/constants'

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
      name: 'spotplayer',
      type: 'group',
      label: 'لایسنس اسپات‌پلیر',
      admin: {
        description:
          'برای دوره‌هایی که شناسه اسپات‌پلیر دارند خودکار پر می‌شود. اگر صدور ناموفق بود، وضعیت را روی «در انتظار صدور» بگذارید و ذخیره کنید تا دوباره تلاش شود. اسپات‌پلیر API لغو لایسنس ندارد؛ برای بازگشت وجه، لایسنس را در پنل اسپات‌پلیر غیرفعال کنید.',
      },
      fields: [
        {
          name: 'status',
          type: 'select',
          label: 'وضعیت',
          options: [
            { label: 'در انتظار صدور', value: 'pending' },
            { label: 'در حال صدور', value: 'issuing' },
            { label: 'صادر شد', value: 'issued' },
            { label: 'ناموفق', value: 'failed' },
          ],
        },
        {
          name: 'device',
          type: 'select',
          label: 'دستگاه',
          options: SPOTPLAYER_DEVICE_OPTIONS,
          admin: { description: 'لایسنس برای همین دستگاه ساخته می‌شود (یک دستگاه). خالی = پیش‌فرض پنل اسپات‌پلیر.' },
        },
        { name: 'licenseKey', type: 'text', label: 'کلید لایسنس', admin: { readOnly: true } },
        { name: 'licenseId', type: 'text', label: 'شناسه لایسنس در اسپات‌پلیر', admin: { readOnly: true } },
        { name: 'downloadUrl', type: 'text', label: 'صفحه دانلود', admin: { readOnly: true } },
        { name: 'issuedAt', type: 'date', label: 'زمان صدور', admin: { readOnly: true } },
        { name: 'isTest', type: 'checkbox', label: 'لایسنس آزمایشی', admin: { readOnly: true } },
        { name: 'lastError', type: 'text', label: 'آخرین خطا', admin: { readOnly: true } },
      ],
    },
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
          return
        }
        // تلاش دوباره دستی مدیر: وضعیت لایسنس از «ناموفق» به «در انتظار صدور» برگشته است
        if (previousDoc?.spotplayer?.status === 'failed' && doc.spotplayer?.status === 'pending') {
          await req.payload.create({
            collection: 'jobs',
            data: {
              type: SPOTPLAYER_JOB_TYPE,
              uniqueKey: `spotplayer:${doc.id}:${Date.now()}`,
              payload: { entitlementId: doc.id },
              scheduledFor: new Date().toISOString(),
              status: 'pending',
              attempts: 0,
            },
            req,
            overrideAccess: true,
          })
        }
        if (previousDoc && (previousDoc.expiresAt !== doc.expiresAt || previousDoc.revokedAt !== doc.revokedAt)) {
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
