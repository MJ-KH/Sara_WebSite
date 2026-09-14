import type { CollectionConfig } from 'payload'
import { isOwnerOrBusinessAdmin } from '@/access/roles'

/**
 * قالب پیامک برای رویدادهای خودکار. متغیرهای مجاز هر قالب در description مستند شده و در
 * worker با جایگزینی ساده {{variable}} پردازش می‌شوند (ر.ک. src/worker/jobs).
 */
export const MessageTemplates: CollectionConfig = {
  slug: 'message-templates',
  admin: { useAsTitle: 'key', group: 'ارتباطات' },
  access: {
    read: isOwnerOrBusinessAdmin,
    create: isOwnerOrBusinessAdmin,
    update: isOwnerOrBusinessAdmin,
    delete: isOwnerOrBusinessAdmin,
  },
  fields: [
    {
      name: 'key',
      type: 'select',
      required: true,
      unique: true,
      label: 'رویداد',
      options: [
        { label: 'تأیید خرید پکیج', value: 'purchase_confirm' },
        { label: 'تأیید ثبت‌نام حضوری', value: 'workshop_enrollment_confirm' },
        { label: 'یادآوری دوره حضوری', value: 'workshop_reminder' },
        { label: 'تبریک تولد', value: 'birthday' },
        { label: 'اطلاع‌رسانی به‌روزرسانی پکیج', value: 'package_updated' },
        { label: 'اعلام ظرفیت به فهرست انتظار', value: 'waitlist_seat_available' },
      ],
    },
    { name: 'category', type: 'select', required: true, options: [
      { label: 'تراکنشی', value: 'transactional' },
      { label: 'تبلیغاتی', value: 'marketing' },
    ] },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      label: 'متن پیام',
      admin: { description: 'متغیرهای مجاز بسته به رویداد: {{name}}، {{title}}، {{amount}}، {{date}} و ...' },
    },
    { name: 'active', type: 'checkbox', defaultValue: true, label: 'فعال' },
  ],
}
