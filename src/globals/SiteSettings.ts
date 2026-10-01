import type { GlobalConfig } from 'payload'
import { isOwnerOrBusinessAdmin } from '@/access/roles'

/**
 * تنظیمات عمومی سایت. گزینه‌های ظاهری (رنگ/فونت/گردی/دکمه) عمداً select با مقادیر
 * از‌پیش‌تعریف‌شده هستند، نه رنگ آزاد، تا سارا نتواند خوانایی یا چیدمان موبایل را خراب کند.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: { group: 'تنظیمات' },
  access: {
    read: () => true,
    update: isOwnerOrBusinessAdmin,
  },
  fields: [
    {
      name: 'brand',
      type: 'group',
      label: 'برند',
      fields: [
        { name: 'nameFa', type: 'text', required: true, defaultValue: 'سارا نقی‌زاده' },
        { name: 'nameEn', type: 'text', required: true, defaultValue: 'Sara Naghizadeh' },
        { name: 'tagline', type: 'text', label: 'شعار کوتاه' },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          label: 'لوگو (سربرگ، روی زمینه روشن)',
          admin: { description: 'در سربرگ کنار نام سایت با ارتفاع حدود ۴۴ پیکسل می‌نشیند؛ نشانه کوچک (مونوگرام) بهتر از لوگوی کامل دیده می‌شود.' },
        },
        {
          name: 'logoOnDark',
          type: 'upload',
          relationTo: 'media',
          label: 'لوگو روی زمینه تیره (فوتر)',
          admin: { description: 'نسخه روشن/سفید لوگوی کامل برای فوتر تیره.' },
        },
        { name: 'favicon', type: 'upload', relationTo: 'media', label: 'favicon' },
      ],
    },
    {
      name: 'instagram',
      type: 'group',
      label: 'اینستاگرام',
      admin: { description: 'فقط نام کاربری، بدون @ و بدون آدرس کامل.' },
      fields: [
        {
          name: 'academyHandle',
          type: 'text',
          defaultValue: 'saranaghizadeh_nailacademy',
          label: 'پیج آکادمی (اصلی؛ همه‌جای سایت)',
        },
        { name: 'servicesHandle', type: 'text', defaultValue: 'sara_vip_nailfashion', label: 'پیج خدمات ناخن (فوتر و صفحه خدمات)' },
        { name: 'salonHandle', type: 'text', label: 'پیج سالن زیبایی (فوتر و صفحه خدمات)' },
      ],
    },
    {
      name: 'socials',
      type: 'group',
      label: 'سایر شبکه‌ها',
      fields: [
        { name: 'youtubeUrl', type: 'text', label: 'آدرس کانال یوتیوب' },
        { name: 'telegramHandle', type: 'text', label: 'نام کاربری تلگرام (بدون @)' },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      label: 'اطلاعات تماس',
      fields: [
        { name: 'phone', type: 'text', label: 'موبایل' },
        { name: 'landline', type: 'text', label: 'تلفن ثابت' },
        {
          name: 'whatsapp',
          type: 'text',
          label: 'شماره واتساپ',
          admin: { description: 'دکمه «پیام در واتساپ» با این شماره ساخته می‌شود.' },
        },
        {
          name: 'whatsappGreeting',
          type: 'text',
          label: 'پیام آماده واتساپ',
          admin: { description: 'متنی که هنگام باز شدن واتساپ از قبل نوشته شده است (اختیاری).' },
        },
        { name: 'email', type: 'email', label: 'ایمیل' },
        { name: 'address', type: 'textarea', label: 'آدرس سالن' },
        { name: 'neshanUrl', type: 'text', label: 'لینک مسیریابی نشان' },
        { name: 'googleMapsUrl', type: 'text', label: 'لینک مسیریابی گوگل' },
        {
          name: 'visitNotes',
          type: 'textarea',
          label: 'نکات مراجعه حضوری',
          admin: { description: 'مثلاً پارکینگ، نحوه پرداخت در سالن، قانون لغو وقت. هر مورد در یک خط.' },
        },
      ],
    },
    {
      name: 'headerMenu',
      type: 'array',
      label: 'منوی سربرگ',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
        {
          name: 'children',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'href', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      name: 'footer',
      type: 'group',
      label: 'فوتر',
      fields: [
        {
          name: 'columns',
          type: 'array',
          fields: [
            { name: 'title', type: 'text', required: true },
            {
              name: 'links',
              type: 'array',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'href', type: 'text', required: true },
              ],
            },
          ],
        },
        { name: 'copyrightText', type: 'text', defaultValue: '© سارا نقی‌زاده — آموزش تخصصی ناخن' },
      ],
    },
    {
      name: 'announcementBar',
      type: 'group',
      label: 'اعلان بالای سایت',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false },
        { name: 'text', type: 'text' },
        { name: 'href', type: 'text' },
      ],
    },
    {
      name: 'theme',
      type: 'group',
      label: 'ظاهر',
      fields: [
        {
          name: 'primaryColor',
          type: 'select',
          defaultValue: 'gold-dark',
          label: 'رنگ اصلی تأکید',
          options: [
            // مقدارها برای سازگاری با تنظیمات ذخیره‌شده ثابت مانده‌اند؛ فقط برچسب با ظاهر فعلی هماهنگ شده.
            { label: 'قرمز لاکی تیره (پیش‌فرض)', value: 'gold-dark' },
            { label: 'رز خاکی', value: 'gold-rose' },
            { label: 'مسی', value: 'copper' },
          ],
        },
        {
          name: 'fontScale',
          type: 'select',
          defaultValue: 'md',
          label: 'اندازه پایه متن',
          options: [
            { label: 'کوچک', value: 'sm' },
            { label: 'متوسط', value: 'md' },
            { label: 'بزرگ', value: 'lg' },
          ],
        },
        {
          name: 'radius',
          type: 'select',
          defaultValue: 'md',
          label: 'گردی اجزا',
          options: [
            { label: 'کم', value: 'sm' },
            { label: 'متوسط', value: 'md' },
            { label: 'زیاد', value: 'lg' },
          ],
        },
        {
          name: 'buttonStyle',
          type: 'select',
          defaultValue: 'solid',
          label: 'سبک دکمه',
          options: [
            { label: 'توپر', value: 'solid' },
            { label: 'خطی', value: 'outline' },
          ],
        },
      ],
    },
    {
      name: 'legal',
      type: 'group',
      label: 'حقوقی',
      fields: [
        { name: 'purchaseTermsVersion', type: 'text', required: true, defaultValue: '1' },
        { name: 'purchaseTermsText', type: 'richText', label: 'شرایط خرید' },
        { name: 'privacyText', type: 'richText', label: 'حریم خصوصی' },
      ],
      access: { update: isOwnerOrBusinessAdmin },
    },
    {
      name: 'seoDefaults',
      type: 'group',
      label: 'سئوی پیش‌فرض',
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
