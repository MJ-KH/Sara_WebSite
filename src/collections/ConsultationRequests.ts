import type { Access, CollectionConfig } from 'payload'
import { isAdminCollection, isAnyAdminStaff } from '@/access/roles'
import { normalizeIranMobile } from '@/lib/phone'

type ReqUser = { collection?: string; id?: string | number } | null | undefined

/** ثبت عمومی مجاز (فرم مشاوره در صفحات فروش)؛ خواندن فقط برای مدیر/پشتیبان یا صاحب فرم پس از تأیید هویت. */
const readOwnLinkedOrAdminStaff: Access = ({ req }) => {
  const user = req.user as ReqUser
  if (isAdminCollection(user)) return true
  if (user?.collection === 'students') return { linkedStudent: { equals: user.id } }
  return false
}

export const ConsultationRequests: CollectionConfig = {
  slug: 'consultation-requests',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'mobile', 'status', 'createdAt'],
    group: 'ارتباطات',
  },
  access: {
    read: readOwnLinkedOrAdminStaff,
    create: () => true,
    update: isAnyAdminStaff,
    delete: isAnyAdminStaff,
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'نام' },
    { name: 'mobile', type: 'text', required: true, label: 'موبایل' },
    { name: 'city', type: 'text', label: 'شهر' },
    { name: 'skillLevel', type: 'text', label: 'سطح' },
    { name: 'goal', type: 'textarea', label: 'هدف آموزشی' },
    { name: 'linkedStudent', type: 'relationship', relationTo: 'students', label: 'حساب مرتبط (پس از تأیید هویت)' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'جدید', value: 'new' },
        { label: 'در حال پیگیری', value: 'following' },
        { label: 'رسیدگی‌شده', value: 'done' },
      ],
    },
    { name: 'internalNote', type: 'textarea', label: 'یادداشت داخلی' },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // نرمال‌سازی موبایل مستقل از مسیر ورودی (REST سفارشی، REST عمومی Payload یا GraphQL)
        if (data?.mobile) {
          const normalized = normalizeIranMobile(data.mobile)
          if (normalized) data.mobile = normalized
        }
        return data
      },
    ],
  },
}
