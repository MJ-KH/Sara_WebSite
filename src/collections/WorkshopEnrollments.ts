import type { Access, CollectionConfig } from 'payload'
import { isAdminCollection, isOwnerOrBusinessAdmin } from '@/access/roles'

type ReqUser = { collection?: string; id?: string | number } | null | undefined

const readOwnOrAdminStaff: Access = ({ req }) => {
  const user = req.user as ReqUser
  if (isAdminCollection(user)) return true
  if (user?.collection === 'students') return { student: { equals: user.id } }
  return false
}

export const WorkshopEnrollments: CollectionConfig = {
  slug: 'workshop-enrollments',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['session', 'student', 'status', 'createdAt'],
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
    { name: 'order', type: 'relationship', relationTo: 'orders', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'confirmed',
      options: [
        { label: 'قطعی', value: 'confirmed' },
        { label: 'لغوشده', value: 'canceled' },
      ],
    },
  ],
}
