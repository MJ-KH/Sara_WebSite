import type { CollectionConfig } from 'payload'
import { isOwnerOrBusinessAdmin, publishedOrAdmin } from '@/access/roles'

/**
 * occupiedCount = تعداد صندلی رزروشده (holding معتبر) + ثبت‌نام‌شده قطعی. این فیلد فقط
 * توسط src/lib/workshops (با الگوی compare-and-swap روی همین فیلد) تغییر می‌کند تا از
 * فروش بیش از ظرفیت در رزرو هم‌زمان جلوگیری شود؛ هرگز مستقیم از پنل تغییرش ندهید مگر برای
 * اصلاح دستی با آگاهی کامل.
 */
export const WorkshopSessions: CollectionConfig = {
  slug: 'workshop-sessions',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['workshop', 'startAt', 'capacity', 'occupiedCount', 'status'],
    group: 'دوره حضوری',
  },
  access: {
    read: publishedOrAdmin,
    create: isOwnerOrBusinessAdmin,
    update: isOwnerOrBusinessAdmin,
    delete: isOwnerOrBusinessAdmin,
  },
  fields: [
    { name: 'workshop', type: 'relationship', relationTo: 'workshops', required: true },
    {
      name: 'startAt',
      type: 'date',
      required: true,
      label: 'تاریخ و ساعت شروع',
      admin: { date: { pickerAppearance: 'dayAndTime' }, description: 'در سایت به‌صورت خودکار شمسی نمایش داده می‌شود.' },
    },
    { name: 'endAt', type: 'date', label: 'تاریخ و ساعت پایان', admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'location', type: 'text', label: 'محل برگزاری' },
    { name: 'capacity', type: 'number', required: true, min: 1, label: 'ظرفیت' },
    {
      name: 'occupiedCount',
      type: 'number',
      required: true,
      defaultValue: 0,
      label: 'صندلی اشغال‌شده (رزرو موقت + قطعی)',
      admin: { readOnly: true },
    },
    { name: 'priceRial', type: 'number', required: true, min: 0, label: 'هزینه (ریال)' },
    { name: 'toolsNeeded', type: 'textarea', label: 'ابزار لازم' },
    { name: 'practiceRequirements', type: 'textarea', label: 'شرایط تمرین' },
    { name: 'cancellationPolicy', type: 'textarea', label: 'شرایط لغو و انتقال ثبت‌نام' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'پیش‌نویس', value: 'draft' },
        { label: 'منتشرشده', value: 'published' },
        { label: 'تکمیل‌ظرفیت/بسته', value: 'closed' },
        { label: 'برگزارشده', value: 'completed' },
        { label: 'لغوشده', value: 'canceled' },
      ],
    },
  ],
}
