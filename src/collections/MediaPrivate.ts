import type { CollectionConfig } from 'payload'
import { isOwnerOrBusinessAdmin } from '@/access/roles'

const MAX_VIDEO_MB = Number(process.env.UPLOAD_MAX_VIDEO_MB || 2048)
const MAX_DOC_MB = Number(process.env.UPLOAD_MAX_DOC_MB || 25)

/**
 * رسانه خصوصی (ویدئوی درس، فایل مکمل پولی). این کالکشن هرگز مستقیماً برای هنرجو قابل
 * خواندن نیست — پخش/دانلود فقط از طریق src/app/api/lessons/[id]/stream-url که ابتدا
 * entitlement را بررسی و سپس URL موقت امضاشده صادر می‌کند (ر.ک. src/lib/media/signed-url.ts).
 * بنابراین متادیتای این کالکشن هم از پاسخ عمومی API مخفی می‌ماند.
 *
 * نکته صداقت فنی: در نسخه اول هیچ pipeline تبدیل/فشرده‌سازی ویدئو وجود ندارد؛ فایل MP4
 * آپلودشده همان فایلی است که پخش می‌شود (با پشتیبانی HTTP Range برای seek). استریم تطبیقی
 * (HLS/DASH) پیاده‌سازی نشده است.
 */
export const MediaPrivate: CollectionConfig = {
  slug: 'media-private',
  admin: {
    group: 'آموزش‌ها',
    description: 'فایل خصوصی ویدئو/ضمیمه — فقط برای مدیران قابل مشاهده در پنل.',
  },
  access: {
    read: isOwnerOrBusinessAdmin,
    create: isOwnerOrBusinessAdmin,
    update: isOwnerOrBusinessAdmin,
    delete: isOwnerOrBusinessAdmin,
  },
  upload: {
    mimeTypes: [
      'video/mp4',
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/zip',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    filesRequiredOnCreate: true,
  },
  fields: [
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'video',
      label: 'نوع فایل',
      options: [
        { label: 'ویدئوی درس', value: 'video' },
        { label: 'فایل مکمل', value: 'attachment' },
      ],
    },
    {
      name: 'processingStatus',
      type: 'select',
      defaultValue: 'ready',
      label: 'وضعیت پردازش',
      options: [
        { label: 'آماده پخش', value: 'ready' },
        { label: 'خطا', value: 'error' },
      ],
      admin: { description: 'در نسخه اول پردازش/تبدیل خودکار وجود ندارد؛ فایل آپلودشده مستقیماً پخش می‌شود.' },
    },
    { name: 'errorMessage', type: 'text', admin: { condition: (_, siblingData) => siblingData?.processingStatus === 'error' } },
  ],
  hooks: {
    beforeValidate: [
      ({ operation, data }) => {
        if (operation === 'create' && data?.filesize) {
          const isVideo = data.mimeType === 'video/mp4'
          const maxMb = isVideo ? MAX_VIDEO_MB : MAX_DOC_MB
          if (data.filesize > maxMb * 1024 * 1024) {
            throw new Error(`حجم فایل نباید بیشتر از ${maxMb} مگابایت باشد`)
          }
        }
        return data
      },
    ],
  },
}
