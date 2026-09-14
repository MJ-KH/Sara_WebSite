import type { CollectionConfig } from 'payload'
import { denyAll, isOwnerOrBusinessAdmin } from '@/access/roles'

/**
 * هر تلاش پرداخت برای یک سفارش. providerRefId (مثلاً authority زرین‌پال) یکتا و اندیس‌دار
 * است و به‌عنوان کلید جلوگیری از پردازش مضاعف callback استفاده می‌شود: پیش از اعطای
 * دسترسی، وضعیت این رکورد بررسی می‌شود؛ اگر already succeeded باشد، callback تکراری هیچ
 * اثر اضافه‌ای ندارد. amountRialSnapshot تنها منبع حقیقت مبلغ است و هرگز از callback
 * خوانده نمی‌شود.
 */
export const PaymentAttempts: CollectionConfig = {
  slug: 'payment-attempts',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['order', 'gateway', 'providerRefId', 'status', 'createdAt'],
    group: 'فروش',
  },
  access: {
    read: isOwnerOrBusinessAdmin,
    create: denyAll,
    update: denyAll,
    delete: denyAll,
  },
  fields: [
    { name: 'order', type: 'relationship', relationTo: 'orders', required: true },
    { name: 'gateway', type: 'text', required: true },
    { name: 'providerRefId', type: 'text', required: true, unique: true, index: true },
    { name: 'amountRialSnapshot', type: 'number', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'initiated',
      options: [
        { label: 'شروع‌شده', value: 'initiated' },
        { label: 'موفق', value: 'succeeded' },
        { label: 'ناموفق', value: 'failed' },
      ],
    },
    { name: 'providerTransactionId', type: 'text' },
    { name: 'rawResponseRedacted', type: 'json' },
  ],
}
