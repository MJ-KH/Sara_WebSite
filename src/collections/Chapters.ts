import type { CollectionConfig } from 'payload'
import { isOwnerOrBusinessAdmin, publishedOrAdmin } from '@/access/roles'

export const Chapters: CollectionConfig = {
  slug: 'chapters',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'package', 'order'],
    group: 'آموزش‌ها',
  },
  access: {
    read: publishedOrAdmin,
    create: isOwnerOrBusinessAdmin,
    update: isOwnerOrBusinessAdmin,
    delete: isOwnerOrBusinessAdmin,
  },
  fields: [
    { name: 'package', type: 'relationship', relationTo: 'packages', required: true, label: 'پکیج' },
    { name: 'title', type: 'text', required: true, label: 'عنوان فصل' },
    { name: 'order', type: 'number', required: true, defaultValue: 0, label: 'ترتیب' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'پیش‌نویس', value: 'draft' },
        { label: 'منتشرشده', value: 'published' },
      ],
    },
  ],
}
