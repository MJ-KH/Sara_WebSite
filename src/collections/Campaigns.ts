import type { CollectionConfig } from 'payload'
import { isOwnerOrBusinessAdmin } from '@/access/roles'

/**
 * کمپین دستی پیامکی برای گروه انتخابی. پیش از ارسال، تعداد مخاطبان و پیش‌نمایش باید در
 * پنل نمایش داده شود و تأیید نهایی مدیر لازم است (ر.ک. src/app/(admin-ui)/campaigns).
 */
export const Campaigns: CollectionConfig = {
  slug: 'campaigns',
  admin: { useAsTitle: 'name', group: 'ارتباطات' },
  access: {
    read: isOwnerOrBusinessAdmin,
    create: isOwnerOrBusinessAdmin,
    update: isOwnerOrBusinessAdmin,
    delete: isOwnerOrBusinessAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'نام کمپین (داخلی)' },
    { name: 'body', type: 'textarea', required: true, label: 'متن پیام' },
    {
      name: 'audienceFilter',
      type: 'group',
      label: 'گروه مخاطب',
      fields: [
        { name: 'onlyMarketingConsent', type: 'checkbox', defaultValue: true, label: 'فقط دارای رضایت تبلیغاتی' },
        { name: 'city', type: 'text', label: 'فقط این شهر (خالی = همه)' },
        { name: 'tag', type: 'text', label: 'فقط دارای این برچسب (خالی = همه)' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'پیش‌نویس', value: 'draft' },
        { label: 'در صف ارسال', value: 'queued' },
        { label: 'ارسال‌شده', value: 'sent' },
      ],
    },
    { name: 'approvedBy', type: 'relationship', relationTo: 'admin-users', admin: { readOnly: true } },
    { name: 'approvedAt', type: 'date', admin: { readOnly: true } },
    { name: 'audienceCountAtApproval', type: 'number', admin: { readOnly: true } },
  ],
}
