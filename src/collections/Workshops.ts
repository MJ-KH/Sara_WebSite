import type { CollectionConfig } from 'payload'
import { isOwnerOrBusinessAdmin, publishedOrAdmin } from '@/access/roles'

export const Workshops: CollectionConfig = {
  slug: 'workshops',
  admin: { useAsTitle: 'title', group: 'دوره حضوری' },
  access: {
    read: publishedOrAdmin,
    create: isOwnerOrBusinessAdmin,
    update: isOwnerOrBusinessAdmin,
    delete: isOwnerOrBusinessAdmin,
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'عنوان دوره' },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'coverImage', type: 'upload', relationTo: 'media', label: 'تصویر' },
    {
      name: 'level',
      type: 'select',
      options: [
        { label: 'مبتدی', value: 'beginner' },
        { label: 'متوسط', value: 'intermediate' },
        { label: 'پیشرفته', value: 'advanced' },
      ],
    },
    { name: 'description', type: 'richText', label: 'معرفی دوره' },
    { name: 'syllabus', type: 'richText', label: 'سرفصل‌ها' },
    { name: 'certificateType', type: 'text', label: 'نوع گواهی' },
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
