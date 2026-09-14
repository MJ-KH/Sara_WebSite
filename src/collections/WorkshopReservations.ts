import type { Access, CollectionConfig } from 'payload'
import { isAdminCollection, isOwnerOrBusinessAdmin } from '@/access/roles'

type ReqUser = { collection?: string; id?: string | number } | null | undefined

const readOwnOrAdminStaff: Access = ({ req }) => {
  const user = req.user as ReqUser
  if (isAdminCollection(user)) return true
  if (user?.collection === 'students') return { student: { equals: user.id } }
  return false
}

/**
 * رزرو موقت صندلی دوره حضوری در زمان پرداخت. ساخت/تغییر فقط از src/lib/workshops
 * (الگوی compare-and-swap روی WorkshopSessions.occupiedCount) انجام می‌شود.
 */
export const WorkshopReservations: CollectionConfig = {
  slug: 'workshop-reservations',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['session', 'student', 'status', 'expiresAt'],
    group: 'دوره حضوری',
  },
  access: {
    read: readOwnOrAdminStaff,
    create: () => false,
    update: isOwnerOrBusinessAdmin,
    delete: () => false,
  },
  fields: [
    { name: 'session', type: 'relationship', relationTo: 'workshop-sessions', required: true },
    { name: 'student', type: 'relationship', relationTo: 'students', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'holding',
      options: [
        { label: 'رزرو موقت (در انتظار پرداخت)', value: 'holding' },
        { label: 'تأییدشده', value: 'confirmed' },
        { label: 'منقضی‌شده', value: 'expired' },
        { label: 'آزادشده', value: 'released' },
      ],
    },
    { name: 'expiresAt', type: 'date', required: true, label: 'مهلت رزرو موقت' },
    { name: 'order', type: 'relationship', relationTo: 'orders' },
  ],
}
