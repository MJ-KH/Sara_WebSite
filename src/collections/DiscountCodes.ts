import type { CollectionConfig } from 'payload'
import { isOwnerOrBusinessAdmin } from '@/access/roles'

export const DiscountCodes: CollectionConfig = {
  slug: 'discount-codes',
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'type', 'value', 'validFrom', 'validTo', 'usedCount', 'maxUses'],
    group: 'فروش',
  },
  access: {
    // فقط از سرور (محاسبه قیمت) خوانده می‌شود، نه مستقیم از کلاینت — کد را کاربر در فرم می‌نویسد
    // و سرور اعتبار را بررسی می‌کند؛ به همین دلیل خواندن مستقیم فهرست کدها برای عموم مسدود است.
    read: isOwnerOrBusinessAdmin,
    create: isOwnerOrBusinessAdmin,
    update: isOwnerOrBusinessAdmin,
    delete: isOwnerOrBusinessAdmin,
  },
  fields: [
    { name: 'code', type: 'text', required: true, unique: true, index: true, label: 'کد تخفیف' },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'percent',
      label: 'نوع',
      options: [
        { label: 'درصدی', value: 'percent' },
        { label: 'مبلغ ثابت (ریال)', value: 'fixed' },
      ],
    },
    { name: 'value', type: 'number', required: true, min: 0, label: 'مقدار (درصد یا ریال)' },
    { name: 'validFrom', type: 'date', label: 'شروع اعتبار' },
    { name: 'validTo', type: 'date', label: 'پایان اعتبار' },
    { name: 'maxUses', type: 'number', min: 0, label: 'سقف استفاده کل (خالی = نامحدود)' },
    { name: 'maxUsesPerStudent', type: 'number', min: 0, defaultValue: 1, label: 'سقف استفاده هر هنرجو' },
    { name: 'usedCount', type: 'number', defaultValue: 0, admin: { readOnly: true }, label: 'تعداد استفاده‌شده' },
    {
      name: 'applicablePackages',
      type: 'relationship',
      relationTo: 'packages',
      hasMany: true,
      label: 'پکیج‌های مجاز (خالی = همه پکیج‌ها)',
    },
    { name: 'active', type: 'checkbox', defaultValue: true, label: 'فعال' },
  ],
}
