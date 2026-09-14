import type { CollectionConfig } from 'payload'
import { isOwnerOrBusinessAdmin } from '@/access/roles'

const MAX_IMAGE_MB = Number(process.env.UPLOAD_MAX_IMAGE_MB || 8)

/** رسانه عمومی (تصاویر سایت، کاور پکیج و ...) — روی bucket عمومی با URL مستقیم. */
export const MediaPublic: CollectionConfig = {
  slug: 'media',
  admin: { group: 'صفحات و ظاهر' },
  access: {
    read: () => true,
    create: isOwnerOrBusinessAdmin,
    update: isOwnerOrBusinessAdmin,
    delete: isOwnerOrBusinessAdmin,
  },
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    filesRequiredOnCreate: true,
    imageSizes: [
      { name: 'thumbnail', width: 400, height: undefined, position: 'centre' },
      { name: 'card', width: 800, height: undefined, position: 'centre' },
      { name: 'hero', width: 1600, height: undefined, position: 'centre' },
    ],
  },
  fields: [
    { name: 'alt', type: 'text', required: true, label: 'متن جایگزین تصویر (ضروری برای دسترس‌پذیری و SEO)' },
  ],
  hooks: {
    beforeValidate: [
      ({ operation, data }) => {
        if (operation === 'create' && data?.filesize && data.filesize > MAX_IMAGE_MB * 1024 * 1024) {
          throw new Error(`حجم تصویر نباید بیشتر از ${MAX_IMAGE_MB} مگابایت باشد`)
        }
        return data
      },
    ],
  },
}
