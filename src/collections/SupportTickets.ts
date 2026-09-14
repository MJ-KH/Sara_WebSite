import type { Access, CollectionConfig } from 'payload'
import { isAdminCollection, isAnyAdminStaff } from '@/access/roles'

type ReqUser = { collection?: string; id?: string | number } | null | undefined

const readOwnOrAdminStaff: Access = ({ req }) => {
  const user = req.user as ReqUser
  if (isAdminCollection(user)) return true
  if (user?.collection === 'students') return { student: { equals: user.id } }
  return false
}

export const SupportTickets: CollectionConfig = {
  slug: 'support-tickets',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'student', 'status', 'updatedAt'],
    group: 'ارتباطات',
  },
  access: {
    read: readOwnOrAdminStaff,
    create: ({ req }) => Boolean((req.user as ReqUser)?.collection === 'students'),
    update: ({ req }) => {
      const user = req.user as ReqUser
      return isAdminCollection(user) || user?.collection === 'students'
    },
    delete: isAnyAdminStaff,
  },
  fields: [
    { name: 'student', type: 'relationship', relationTo: 'students', required: true },
    { name: 'subject', type: 'text', required: true, label: 'موضوع' },
    { name: 'relatedOrder', type: 'relationship', relationTo: 'orders', label: 'سفارش مرتبط (اختیاری)' },
    { name: 'relatedPackage', type: 'relationship', relationTo: 'packages', label: 'پکیج مرتبط (اختیاری)' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'open',
      options: [
        { label: 'باز', value: 'open' },
        { label: 'پاسخ‌داده‌شده', value: 'answered' },
        { label: 'بسته', value: 'closed' },
      ],
    },
    {
      name: 'messages',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'from',
          type: 'select',
          required: true,
          options: [
            { label: 'هنرجو', value: 'student' },
            { label: 'پشتیبانی', value: 'staff' },
          ],
        },
        { name: 'body', type: 'textarea', required: true },
        { name: 'createdAt', type: 'date', required: true },
      ],
    },
  ],
}
