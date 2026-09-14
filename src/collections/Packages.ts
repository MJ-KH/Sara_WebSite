import type { Access, CollectionConfig } from 'payload'
import { isAdminCollection, isOwnerOrBusinessAdmin } from '@/access/roles'
import { describeActor, recordAuditLog } from '@/lib/audit/log'

/**
 * برخلاف بقیه کالکشن‌های محتوایی (draft/published دوحالته)، پکیج سه وضعیت دارد. عموم باید
 * پکیج «متوقف از فروش» را هم بتواند از طریق لینک مستقیم ببیند (برای خریداران قبلی که لینک
 * را دارند) — فقط «پیش‌نویس» کاملاً مخفی است. فهرست عمومی پکیج‌ها (صفحه /packages) با
 * where جداگانه خودش را به «published» محدود می‌کند.
 */
const packageReadAccess: Access = ({ req }) => {
  if (isAdminCollection(req.user as { collection?: string } | undefined)) return true
  return { status: { not_equals: 'draft' } }
}

export const Packages: CollectionConfig = {
  slug: 'packages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'level', 'priceRial', 'status', 'updatedAt'],
    group: 'فروش',
    description: 'پکیج آموزشی ویدئویی — فصل‌ها و درس‌ها را از تب مربوطه در همین پکیج مدیریت کنید.',
  },
  access: {
    read: packageReadAccess,
    create: isOwnerOrBusinessAdmin,
    update: isOwnerOrBusinessAdmin,
    delete: isOwnerOrBusinessAdmin,
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'عنوان' },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, label: 'نامک (slug)' },
    { name: 'subtitle', type: 'text', label: 'زیرعنوان کوتاه' },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'تصویر جلد',
      admin: { description: 'پیش از انتشار عمومی حتماً تصویر واقعی اضافه کنید.' },
    },
    {
      name: 'level',
      type: 'select',
      required: true,
      label: 'سطح',
      options: [
        { label: 'مبتدی', value: 'beginner' },
        { label: 'متوسط', value: 'intermediate' },
        { label: 'پیشرفته', value: 'advanced' },
      ],
    },
    {
      name: 'topics',
      type: 'select',
      hasMany: true,
      label: 'موضوعات',
      options: [
        { label: 'پودر و ژل', value: 'powder_gel' },
        { label: 'موادگذاری', value: 'extensions' },
        { label: 'طراحی ناخن', value: 'nail_art' },
        { label: 'رفع اشکال', value: 'troubleshooting' },
        { label: 'مانیکور و زیرسازی', value: 'manicure_prep' },
      ],
    },
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'comprehensive',
      label: 'نوع پکیج',
      options: [
        { label: 'جامع', value: 'comprehensive' },
        { label: 'آموزش تخصصی کوتاه', value: 'short' },
      ],
    },
    { name: 'description', type: 'richText', label: 'توضیح کامل' },
    { name: 'targetAudience', type: 'textarea', label: 'مخاطب مناسب و پیش‌نیازها' },
    {
      name: 'expectedOutcome',
      type: 'textarea',
      label: 'نتیجه آموزشی مورد انتظار',
      admin: { description: 'هشدار: از وعده یا تضمین درآمد/جذب مشتری خودداری کنید.' },
    },
    { name: 'toolsAndMaterials', type: 'textarea', label: 'ابزار و مواد لازم' },
    {
      name: 'priceRial',
      type: 'number',
      required: true,
      min: 0,
      label: 'قیمت (ریال)',
      admin: { description: 'واحد: ریال — عدد صحیح. نمایش سایت به‌صورت خودکار به تومان تبدیل می‌شود.' },
    },
    {
      name: 'compareAtPriceRial',
      type: 'number',
      min: 0,
      label: 'قیمت قبل از تخفیف (ریال، اختیاری)',
      admin: { description: 'اگر بزرگ‌تر از قیمت فعلی باشد، به‌صورت خط‌خورده نمایش داده می‌شود.' },
    },
    {
      name: 'accessDurationDays',
      type: 'number',
      min: 0,
      label: 'مدت دسترسی (روز)',
      admin: { description: 'خالی یا صفر = دسترسی مادام‌العمر. تغییر این مقدار فقط روی خریدهای بعدی اثر دارد.' },
    },
    { name: 'supportScope', type: 'textarea', label: 'دامنه پشتیبانی' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      label: 'وضعیت فروش',
      options: [
        { label: 'پیش‌نویس', value: 'draft' },
        { label: 'منتشرشده (قابل فروش)', value: 'published' },
        { label: 'متوقف از فروش', value: 'stopped' },
      ],
      admin: {
        description: 'توقف فروش، دسترسی خریداران قبلی را قطع نمی‌کند؛ فقط از فهرست عمومی خارج می‌شود.',
      },
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, label: 'در صفحه اصلی نمایش داده شود' },
    { name: 'featuredOrder', type: 'number', label: 'ترتیب نمایش در صفحه اصلی' },
    {
      name: 'relatedPackages',
      type: 'relationship',
      relationTo: 'packages',
      hasMany: true,
      label: 'پکیج‌های مرتبط',
    },
    {
      name: 'faqs',
      type: 'array',
      label: 'پرسش‌های متداول این پکیج',
      fields: [
        { name: 'question', type: 'text', required: true, label: 'سؤال' },
        { name: 'answer', type: 'textarea', required: true, label: 'پاسخ' },
      ],
    },
    { name: 'cancellationPolicy', type: 'textarea', label: 'شرایط انصراف و بازگشت وجه' },
    {
      name: 'contentUpdatedAt',
      type: 'date',
      label: 'آخرین به‌روزرسانی محتوای آموزشی',
      admin: { description: 'هنگام افزودن درس جدید یا اصلاح محتوا این تاریخ را به‌روز کنید تا به خریداران نمایش داده شود.' },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'سئو',
      fields: [
        { name: 'metaTitle', type: 'text', label: 'عنوان متا' },
        { name: 'metaDescription', type: 'textarea', label: 'توضیح متا' },
        { name: 'ogImage', type: 'upload', relationTo: 'media', label: 'تصویر اشتراک‌گذاری' },
      ],
    },
  ],
  hooks: {
    beforeDelete: [
      async ({ req, id }) => {
        const entitlements = await req.payload.find({
          collection: 'entitlements',
          where: { package: { equals: id } },
          limit: 1,
          overrideAccess: true,
        })
        if (entitlements.totalDocs > 0) {
          throw new Error(
            'این پکیج خریدار فعال دارد و قابل حذف نیست. برای توقف فروش، وضعیت را «متوقف از فروش» کنید.',
          )
        }
      },
    ],
    afterChange: [
      async ({ req, doc, previousDoc, operation }) => {
        if (operation === 'update' && previousDoc && previousDoc.priceRial !== doc.priceRial) {
          await recordAuditLog(req.payload, {
            action: 'package_price_changed',
            entityType: 'packages',
            entityId: String(doc.id),
            actorLabel: describeActor(req.user as never),
            beforeJson: { priceRial: previousDoc.priceRial },
            afterJson: { priceRial: doc.priceRial },
          })
        }
      },
    ],
  },
}
