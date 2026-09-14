import type { Block } from 'payload'

/**
 * بلوک‌های صفحه‌ساز. هر بلوک فقط فیلدهای محتوایی محدود و معتبر دارد (بدون HTML/CSS آزاد)
 * تا سارا نتواند چیدمان یا خوانایی موبایل را با یک ویرایش اشتباه خراب کند. بلوک‌های فهرستی
 * (پکیج/حضوری/آموزش رایگان/نظرات) هم حالت «انتخاب دستی» و هم «فیلتر خودکار» دارند.
 */

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'معرفی تصویری', plural: 'معرفی‌های تصویری' },
  fields: [
    { name: 'heading', type: 'text', required: true, label: 'عنوان' },
    { name: 'subheading', type: 'textarea', label: 'زیرعنوان' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'تصویر' },
    { name: 'imagePosition', type: 'select', defaultValue: 'right', options: [{ label: 'راست', value: 'right' }, { label: 'چپ', value: 'left' }] },
    { name: 'ctaLabel', type: 'text', label: 'متن دکمه' },
    { name: 'ctaHref', type: 'text', label: 'لینک دکمه' },
  ],
}

export const TextBlock: Block = {
  slug: 'text',
  labels: { singular: 'متن', plural: 'متن‌ها' },
  fields: [
    { name: 'heading', type: 'text', label: 'عنوان (اختیاری)' },
    { name: 'content', type: 'richText', label: 'متن' },
  ],
}

export const ImageBlock: Block = {
  slug: 'image',
  labels: { singular: 'تصویر', plural: 'تصاویر' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'تصویر' },
    { name: 'caption', type: 'text', label: 'زیرنویس' },
  ],
}

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: 'گالری', plural: 'گالری‌ها' },
  fields: [
    { name: 'heading', type: 'text', label: 'عنوان (اختیاری)' },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
  ],
}

export const VideoBlock: Block = {
  slug: 'video',
  labels: { singular: 'ویدئو', plural: 'ویدئوها' },
  fields: [
    { name: 'heading', type: 'text', label: 'عنوان (اختیاری)' },
    { name: 'sourceType', type: 'select', required: true, defaultValue: 'upload', options: [
      { label: 'فایل آپلودی (عمومی)', value: 'upload' },
      { label: 'آدرس خارجی (آپارات/یوتیوب و ...)', value: 'external' },
    ] },
    { name: 'mediaFile', type: 'upload', relationTo: 'media', admin: { condition: (_, s) => s?.sourceType === 'upload' } },
    { name: 'externalUrl', type: 'text', admin: { condition: (_, s) => s?.sourceType === 'external' } },
    { name: 'posterImage', type: 'upload', relationTo: 'media', label: 'تصویر پیش‌نمایش' },
  ],
}

export const PackageListBlock: Block = {
  slug: 'packageList',
  labels: { singular: 'فهرست پکیج', plural: 'فهرست‌های پکیج' },
  fields: [
    { name: 'heading', type: 'text', label: 'عنوان' },
    { name: 'mode', type: 'select', required: true, defaultValue: 'featured', options: [
      { label: 'پکیج‌های منتخب (featured)', value: 'featured' },
      { label: 'جدیدترین‌ها', value: 'latest' },
      { label: 'انتخاب دستی', value: 'manual' },
    ] },
    { name: 'manualPackages', type: 'relationship', relationTo: 'packages', hasMany: true, admin: { condition: (_, s) => s?.mode === 'manual' } },
    { name: 'limit', type: 'number', defaultValue: 6, min: 1, max: 24 },
  ],
}

export const WorkshopListBlock: Block = {
  slug: 'workshopList',
  labels: { singular: 'فهرست دوره حضوری', plural: 'فهرست‌های دوره حضوری' },
  fields: [
    { name: 'heading', type: 'text', label: 'عنوان' },
    { name: 'mode', type: 'select', required: true, defaultValue: 'upcoming', options: [
      { label: 'نوبت‌های آینده', value: 'upcoming' },
      { label: 'انتخاب دستی', value: 'manual' },
    ] },
    { name: 'manualSessions', type: 'relationship', relationTo: 'workshop-sessions', hasMany: true, admin: { condition: (_, s) => s?.mode === 'manual' } },
    { name: 'limit', type: 'number', defaultValue: 3, min: 1, max: 12 },
  ],
}

export const FreeLessonListBlock: Block = {
  slug: 'freeLessonList',
  labels: { singular: 'آموزش رایگان', plural: 'آموزش‌های رایگان' },
  fields: [
    { name: 'heading', type: 'text', label: 'عنوان' },
    { name: 'mode', type: 'select', required: true, defaultValue: 'latest', options: [
      { label: 'جدیدترین‌ها', value: 'latest' },
      { label: 'یک دسته خاص', value: 'category' },
      { label: 'انتخاب دستی', value: 'manual' },
    ] },
    { name: 'category', type: 'relationship', relationTo: 'free-lesson-categories', admin: { condition: (_, s) => s?.mode === 'category' } },
    { name: 'manualItems', type: 'relationship', relationTo: 'free-lessons', hasMany: true, admin: { condition: (_, s) => s?.mode === 'manual' } },
    { name: 'limit', type: 'number', defaultValue: 4, min: 1, max: 24 },
  ],
}

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  labels: { singular: 'نظرات', plural: 'بخش‌های نظرات' },
  fields: [
    { name: 'heading', type: 'text', label: 'عنوان' },
    { name: 'mode', type: 'select', required: true, defaultValue: 'all', options: [
      { label: 'همه نظرات تأییدشده', value: 'all' },
      { label: 'انتخاب دستی', value: 'manual' },
    ] },
    { name: 'manualItems', type: 'relationship', relationTo: 'testimonials', hasMany: true, admin: { condition: (_, s) => s?.mode === 'manual' } },
    { name: 'limit', type: 'number', defaultValue: 6, min: 1, max: 24 },
  ],
}

export const FaqBlock: Block = {
  slug: 'faq',
  labels: { singular: 'پرسش متداول', plural: 'پرسش‌های متداول' },
  fields: [
    { name: 'heading', type: 'text', label: 'عنوان', defaultValue: 'پرسش‌های متداول' },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
  ],
}

export const ConsultationFormBlock: Block = {
  slug: 'consultationForm',
  labels: { singular: 'فرم مشاوره', plural: 'فرم‌های مشاوره' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'مشاوره رایگان انتخاب پکیج' },
    { name: 'description', type: 'textarea' },
  ],
}

export const CtaBlock: Block = {
  slug: 'cta',
  labels: { singular: 'دعوت به اقدام', plural: 'دعوت‌های به اقدام' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'buttonLabel', type: 'text', required: true },
    { name: 'buttonHref', type: 'text', required: true },
    { name: 'style', type: 'select', defaultValue: 'primary', options: [
      { label: 'اصلی (طلایی/تیره)', value: 'primary' },
      { label: 'ثانویه', value: 'secondary' },
    ] },
  ],
}

const rawBlocks: Block[] = [
  HeroBlock,
  TextBlock,
  ImageBlock,
  GalleryBlock,
  VideoBlock,
  PackageListBlock,
  WorkshopListBlock,
  FreeLessonListBlock,
  TestimonialsBlock,
  FaqBlock,
  ConsultationFormBlock,
  CtaBlock,
]

/** به هر بلوک فیلد «مخفی‌کردن بدون حذف» اضافه می‌کند */
export const allBlocks: Block[] = rawBlocks.map((block) => ({
  ...block,
  fields: [
    {
      name: 'hidden',
      type: 'checkbox',
      defaultValue: false,
      label: 'مخفی (بدون حذف)',
      admin: { description: 'اگر فعال باشد، این بلوک در سایت عمومی نمایش داده نمی‌شود.' },
    },
    ...block.fields,
  ],
}))
