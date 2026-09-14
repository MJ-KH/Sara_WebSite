import type { CollectionConfig } from 'payload'
import { isOwnerOrBusinessAdmin, publishedVersionOrAdmin } from '@/access/roles'
import { allBlocks } from '@/blocks/blockConfigs'

/**
 * صفحه‌ساز بلوکی. drafts فعال است تا پیش‌نویس/پیش‌نمایش/انتشار/بازگرداندن نسخه از امکانات
 * داخلی Payload استفاده کند؛ نسخه منتشرشده از draft:false در کوئری‌های عمومی خوانده می‌شود.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'صفحات و ظاهر',
    preview: (doc) => {
      const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
      return `${base}/${doc?.slug === 'home' ? '' : doc?.slug}?preview=1`
    },
  },
  access: {
    read: publishedVersionOrAdmin,
    create: isOwnerOrBusinessAdmin,
    update: isOwnerOrBusinessAdmin,
    delete: isOwnerOrBusinessAdmin,
  },
  versions: {
    drafts: { autosave: { interval: 1500 } },
    maxPerDoc: 50,
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'عنوان (داخلی)' },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, label: 'نامک (slug)' },
    {
      name: 'layout',
      type: 'blocks',
      label: 'بلوک‌های صفحه',
      blocks: allBlocks,
      minRows: 1,
    },
    {
      name: 'seo',
      type: 'group',
      label: 'سئو',
      fields: [
        { name: 'metaTitle', type: 'text', label: 'عنوان متا' },
        { name: 'metaDescription', type: 'textarea', label: 'توضیح متا' },
        { name: 'ogImage', type: 'upload', relationTo: 'media', label: 'تصویر اشتراک‌گذاری' },
        { name: 'canonicalPath', type: 'text', label: 'Canonical (اختیاری)' },
        { name: 'noIndex', type: 'checkbox', defaultValue: false, label: 'noindex (از نتایج جست‌وجو مخفی شود)' },
      ],
    },
  ],
}
