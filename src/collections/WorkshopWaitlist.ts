import type { Access, CollectionConfig } from 'payload'
import { isAdminCollection, isOwnerOrBusinessAdmin } from '@/access/roles'

type ReqUser = { collection?: string; id?: string | number } | null | undefined

const readOwnOrAdminStaff: Access = ({ req }) => {
  const user = req.user as ReqUser
  if (isAdminCollection(user)) return true
  if (user?.collection === 'students') return { student: { equals: user.id } }
  return false
}

export const WorkshopWaitlist: CollectionConfig = {
  slug: 'workshop-waitlist',
  admin: { useAsTitle: 'id', group: 'دوره حضوری' },
  access: {
    read: readOwnOrAdminStaff,
    create: () => false,
    update: isOwnerOrBusinessAdmin,
    delete: isOwnerOrBusinessAdmin,
  },
  fields: [
    { name: 'session', type: 'relationship', relationTo: 'workshop-sessions', required: true },
    { name: 'student', type: 'relationship', relationTo: 'students', required: true },
    { name: 'joinedAt', type: 'date', required: true },
    { name: 'notifiedAt', type: 'date' },
  ],
}
