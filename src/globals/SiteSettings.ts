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
        { name: 'logo', type: 'upload', relationTo: 'media', label: 'لوگو' },
        { name: 'favicon', type: 'upload', relationTo: 'media', label: 'favicon' },
      ],
    },
    {
      name: 'instagram',
      type: 'group',
      label: 'اینستاگرام',
      fields: [
        { name: 'academyHandle', type: 'text', defaultValue: 'saranaghizadeh_nailacademy', label: 'پیج آموزش' },
        { name: 'servicesHandle', type: 'text', defaultValue: 'sara_vip_nailfashion', label: 'پیج خدمات' },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      label: 'اطلاعات تماس',
      fields: [
        { name: 'phone', type: 'text', label: 'تلفن (نمونه — پیش از انتشار عمومی تکمیل شود)' },
        { name: 'email', type: 'email', label: 'ایمیل' },
        { name: 'address', type: 'textarea', label: 'آدرس (نمونه — پیش از انتشار عمومی تکمیل شود)' },
        { name: 'mapEmbedUrl', type: 'text', label: 'لینک نقشه (اختیاری)' },
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
            { label: 'طلایی روی تیره', value: 'gold-dark' },
            { label: 'طلایی روی صورتی ملایم', value: 'gold-rose' },
            { label: 'مسی گرم', value: 'copper' },
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
