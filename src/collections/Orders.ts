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
 * سفارش خرید پکیج دیجیتال یا ثبت‌نام دوره حضوری (هرگز هر دو با هم — طبق سند در سفارش‌های
 * جدا خریداری می‌شوند). تمام مقادیر مالی snapshot هستند و با ویرایش بعدی پکیج/دوره تغییر
 * نمی‌کنند. ساخت/تغییر وضعیت فقط از مسیرهای سرویس سرور (src/lib/orders) با overrideAccess
 * انجام می‌شود، نه مستقیم از REST/GraphQL عمومی.
 */
export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['id', 'student', 'subjectType', 'titleSnapshot', 'totalRialSnapshot', 'status', 'createdAt'],
    group: 'فروش',
  },
  access: {
    read: readOwnOrAdminStaff,
    create: () => false,
    update: isOwnerOrBusinessAdmin,
    delete: () => false,
  },
  fields: [
    { name: 'student', type: 'relationship', relationTo: 'students', required: true, label: 'هنرجو' },
    {
      name: 'subjectType',
      type: 'select',
      required: true,
      label: 'نوع سفارش',
      options: [
        { label: 'خرید پکیج', value: 'package' },
        { label: 'ثبت‌نام دوره حضوری', value: 'workshop_session' },
      ],
    },
    {
      name: 'subjectPackage',
      type: 'relationship',
      relationTo: 'packages',
      label: 'پکیج',
      admin: { condition: (_, siblingData) => siblingData?.subjectType === 'package' },
    },
    {
      name: 'subjectWorkshopSession',
      type: 'relationship',
      relationTo: 'workshop-sessions',
      label: 'نوبت دوره حضوری',
      admin: { condition: (_, siblingData) => siblingData?.subjectType === 'workshop_session' },
    },
    { name: 'titleSnapshot', type: 'text', required: true, label: 'عنوان (در زمان سفارش)' },
    { name: 'unitPriceRialSnapshot', type: 'number', required: true, label: 'قیمت پایه (ریال)' },
    { name: 'discountCode', type: 'relationship', relationTo: 'discount-codes', label: 'کد تخفیف استفاده‌شده' },
    { name: 'discountCodeSnapshot', type: 'text', label: 'متن کد تخفیف (در زمان سفارش)' },
    { name: 'discountAmountRialSnapshot', type: 'number', defaultValue: 0, label: 'مبلغ تخفیف (ریال)' },
    { name: 'totalRialSnapshot', type: 'number', required: true, label: 'مبلغ نهایی قابل پرداخت (ریال)' },
    { name: 'accessDurationDaysSnapshot', type: 'number', label: 'مدت دسترسی در زمان خرید (روز، فقط پکیج)' },
    { name: 'termsVersionSnapshot', type: 'text', label: 'نسخه شرایط خرید در زمان سفارش' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      label: 'وضعیت',
      options: [
        { label: 'در انتظار پرداخت', value: 'pending' },
        { label: 'پرداخت‌شده', value: 'paid' },
        { label: 'ناموفق', value: 'failed' },
        { label: 'لغوشده', value: 'canceled' },
        { label: 'درخواست بازگشت وجه', value: 'refund_requested' },
        { label: 'بازگشت‌داده‌شده', value: 'refunded' },
      ],
    },
    { name: 'paidAt', type: 'date', label: 'زمان پرداخت' },
    {
      name: 'refund',
      type: 'group',
      label: 'بازپرداخت',
      fields: [
        { name: 'requestedAt', type: 'date' },
        { name: 'reason', type: 'textarea' },
        {
          name: 'method',
          type: 'select',
          options: [
            { label: 'آنلاین از درگاه', value: 'online' },
            { label: 'ثبت دستی (واریز خارج از سیستم)', value: 'manual' },
          ],
        },
        { name: 'amountRial', type: 'number', min: 0 },
        { name: 'note', type: 'textarea', label: 'یادداشت مدیر' },
        { name: 'completedAt', type: 'date' },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async ({ req, doc, previousDoc, operation }) => {
        if (operation === 'update' && previousDoc && previousDoc.status !== doc.status) {
          await recordAuditLog(req.payload, {
            action: 'order_status_changed',
            entityType: 'orders',
            entityId: String(doc.id),
            actorLabel: describeActor(req.user as never),
            beforeJson: { status: previousDoc.status },
            afterJson: { status: doc.status, totalRialSnapshot: doc.totalRialSnapshot },
          })
        }
      },
    ],
  },
}
