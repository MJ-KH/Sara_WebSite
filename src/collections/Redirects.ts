import type { CollectionConfig } from 'payload'
import { isOwnerOrBusinessAdmin } from '@/access/roles'

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  admin: { useAsTitle: 'fromPath', group: 'صفحات و ظاهر' },
  access: {
    read: () => true,
    create: isOwnerOrBusinessAdmin,
    update: isOwnerOrBusinessAdmin,
    delete: isOwnerOrBusinessAdmin,
  },
  fields: [
    { name: 'fromPath', type: 'text', required: true, unique: true, index: true, label: 'مسیر قدیم' },
    { name: 'toPath', type: 'text', required: true, label: 'مسیر جدید' },
    {
      name: 'statusCode',
      type: 'select',
      required: true,
      defaultValue: '301',
      options: [
        { label: '301 (دائمی)', value: '301' },
        { label: '302 (موقت)', value: '302' },
      ],
    },
  ],
}
