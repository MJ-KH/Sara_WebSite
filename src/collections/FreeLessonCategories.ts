import type { CollectionConfig } from 'payload'
import { isOwnerOrBusinessAdmin } from '@/access/roles'

export const FreeLessonCategories: CollectionConfig = {
  slug: 'free-lesson-categories',
  admin: { useAsTitle: 'title', group: 'آموزش‌ها' },
  access: {
    read: () => true,
    create: isOwnerOrBusinessAdmin,
    update: isOwnerOrBusinessAdmin,
    delete: isOwnerOrBusinessAdmin,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
  ],
}
