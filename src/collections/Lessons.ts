import type { CollectionConfig } from 'payload'
import { isOwnerOrBusinessAdmin, publishedOrAdmin } from '@/access/roles'

/**
 * درس. فیلدهای videoPrivate/attachments عمداً در سطح فیلد به مدیران محدودند تا حتی اگر
 * لیست درس‌ها عمومی خوانده شود، شناسه فایل خصوصی در پاسخ API نمایان نشود. تماشای واقعی
 * از src/app/api/lessons/[id]/stream-url (با overrideAccess داخلی) انجام می‌شود.
 */
export const Lessons: CollectionConfig = {
  slug: 'lessons',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'chapter', 'order', 'isFreePreview', 'status'],
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
    { name: 'chapter', type: 'relationship', relationTo: 'chapters', required: true, label: 'فصل' },
    { name: 'title', type: 'text', required: true, label: 'عنوان درس' },
    { name: 'order', type: 'number', required: true, defaultValue: 0, label: 'ترتیب' },
    { name: 'summary', type: 'textarea', label: 'توضیح کوتاه (در فهرست نمایش داده می‌شود)' },
    {
      name: 'videoPrivate',
      type: 'upload',
      relationTo: 'media-private',
      label: 'ویدئوی درس',
      access: { read: isOwnerOrBusinessAdmin },
    },
    {
      name: 'attachments',
      type: 'relationship',
      relationTo: 'media-private',
      hasMany: true,
      label: 'فایل‌های مکمل',
      access: { read: isOwnerOrBusinessAdmin },
    },
    { name: 'durationSeconds', type: 'number', min: 0, label: 'مدت زمان (ثانیه)' },
    {
      name: 'isFreePreview',
      type: 'checkbox',
      defaultValue: false,
      label: 'نمونه رایگان (بدون نیاز به خرید)',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      label: 'وضعیت',
      options: [
        { label: 'پیش‌نویس', value: 'draft' },
        { label: 'منتشرشده', value: 'published' },
      ],
    },
  ],
}
