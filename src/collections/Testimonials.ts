import type { Access, CollectionConfig } from 'payload'
import { isAdminCollection, isOwnerOrBusinessAdmin } from '@/access/roles'

const readApprovedOrAdmin: Access = ({ req }) => {
  if (isAdminCollection(req.user as { collection?: string } | undefined)) return true
  return { approved: { equals: true } }
}

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: { useAsTitle: 'studentName', group: 'صفحات و ظاهر' },
  access: {
    read: readApprovedOrAdmin,
    create: isOwnerOrBusinessAdmin,
    update: isOwnerOrBusinessAdmin,
    delete: isOwnerOrBusinessAdmin,
  },
  fields: [
    { name: 'studentName', type: 'text', required: true, label: 'نام (طبق رضایت خود فرد)' },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'textarea', required: true, label: 'متن نظر' },
    { name: 'workSample', type: 'upload', relationTo: 'media', label: 'نمونه‌کار' },
    { name: 'relatedPackage', type: 'relationship', relationTo: 'packages' },
    {
      name: 'approved',
      type: 'checkbox',
      defaultValue: false,
      label: 'تأییدشده برای نمایش عمومی',
    },
  ],
}
