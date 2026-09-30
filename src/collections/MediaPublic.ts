import type { CollectionConfig } from 'payload'
import { isOwnerOrBusinessAdmin } from '@/access/roles'

const MAX_IMAGE_MB = Number(process.env.UPLOAD_MAX_IMAGE_MB || 8)
const MAX_PUBLIC_VIDEO_MB = Number(process.env.UPLOAD_MAX_PUBLIC_VIDEO_MB || 200)

/**
 * رسانه عمومی (تصاویر سایت، جلد دوره‌ها، ویدئوی معرفی) — روی bucket عمومی با URL مستقیم.
 * ویدئوی درس‌های پولی اینجا نیست؛ آن‌ها در media-private با لینک موقت سرو می‌شوند.
 */
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
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'video/mp4'],
    filesRequiredOnCreate: true,
    imageSizes: [
      { name: 'thumbnail', width: 400, height: undefined, position: 'centre' },
      { name: 'card', width: 800, height: undefined, position: 'centre' },
      { name: 'hero', width: 1600, height: undefined, position: 'centre' },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'متن جایگزین (ضروری برای دسترس‌پذیری و SEO)',
      admin: { description: 'توصیف کوتاه آنچه در تصویر/ویدئو دیده می‌شود، مثلاً «کاشت پودر بادامی با فرنچ صورتی».' },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ operation, data }) => {
        if (operation === 'create' && data?.filesize) {
          const isVideo = data.mimeType === 'video/mp4'
          const maxMb = isVideo ? MAX_PUBLIC_VIDEO_MB : MAX_IMAGE_MB
          if (data.filesize > maxMb * 1024 * 1024) {
            throw new Error(`حجم ${isVideo ? 'ویدئو' : 'تصویر'} نباید بیشتر از ${maxMb} مگابایت باشد`)
          }
        }
        return data
      },
    ],
  },
}
