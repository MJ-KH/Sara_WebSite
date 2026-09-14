import type { CollectionConfig } from 'payload'
import { isOwnerOrBusinessAdmin, publishedOrAdmin } from '@/access/roles'

/**
 * آموزش رایگان عمومی (مقاله/ویدئو/فایل). محتوای ویدئویی این کالکشن روی media عمومی است
 * (نه media-private) چون هدف دیدن آزاد است. requiresLoginForDownload فقط برای فایل ضمیمه
 * قابل دانلود کاربرد دارد و باید پیش از دانلود به کاربر اعلام شود (در رابط کاربری).
 */
export const FreeLessons: CollectionConfig = {
  slug: 'free-lessons',
  admin: { useAsTitle: 'title', group: 'آموزش‌ها' },
  access: {
    read: publishedOrAdmin,
    create: isOwnerOrBusinessAdmin,
    update: isOwnerOrBusinessAdmin,
    delete: isOwnerOrBusinessAdmin,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'category', type: 'relationship', relationTo: 'free-lesson-categories' },
    {
      name: 'contentType',
      type: 'select',
      required: true,
      defaultValue: 'article',
      options: [
        { label: 'مقاله', value: 'article' },
        { label: 'ویدئو', value: 'video' },
        { label: 'فایل دانلودی', value: 'file' },
      ],
    },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'body', type: 'richText', label: 'متن/توضیح' },
    { name: 'videoUrl', type: 'text', label: 'آدرس ویدئو (در صورت میزبانی خارجی)' },
    { name: 'downloadFile', type: 'upload', relationTo: 'media', label: 'فایل دانلودی عمومی' },
    {
      name: 'requiresLoginForDownload',
      type: 'checkbox',
      defaultValue: false,
      label: 'برای دانلود نیاز به ورود دارد',
    },
    { name: 'relatedPackage', type: 'relationship', relationTo: 'packages', label: 'پکیج مرتبط' },
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
