import type { Access, CollectionConfig } from 'payload'
import type { AdminRole } from '@/access/roles'
import { isAdminCollection, isAnyAdminStaff, isOwnerOrBusinessAdmin } from '@/access/roles'
import { studentJwtStrategy } from '@/lib/auth/student-strategy'

type ReqUser = { collection?: string; role?: AdminRole; id?: string | number } | null | undefined

const readOwnOrAdminStaff: Access = ({ req, id }) => {
  if (isAdminCollection(req.user as ReqUser)) return true
  const user = req.user as ReqUser
  if (user?.collection === 'students') {
    return id ? String(user.id) === String(id) : { id: { equals: user.id } }
  }
  return false
}

const updateOwnOrBusinessAdmin: Access = ({ req, id }) => {
  const user = req.user as ReqUser
  if (isAdminCollection(user) && (user.role === 'owner' || user.role === 'business_admin')) return true
  if (user?.collection === 'students') {
    return id ? String(user.id) === String(id) : { id: { equals: user.id } }
  }
  return false
}

/**
 * هنرجو — بدون پسورد، با موبایل + OTP وارد می‌شود (ر.ک. src/lib/auth). ثبت‌نام اولیه
 * فقط موبایل است؛ بقیه فیلدها اختیاری و هنگام خرید/تکمیل پروفایل پر می‌شوند.
 */
export const Students: CollectionConfig = {
  slug: 'students',
  auth: {
    disableLocalStrategy: true,
    strategies: [studentJwtStrategy],
  },
  admin: {
    useAsTitle: 'mobile',
    defaultColumns: ['mobile', 'name', 'city', 'status', 'createdAt'],
    group: 'هنرجویان',
    description: 'بانک هنرجویان و علاقه‌مندان. ساخت پرونده فقط از طریق ورود با موبایل انجام می‌شود.',
  },
  access: {
    read: readOwnOrAdminStaff,
    update: updateOwnOrBusinessAdmin,
    // ساخت پرونده هنرجو فقط از مسیر داخلی OTP (overrideAccess) انجام می‌شود، نه مستقیم از API عمومی
    create: () => false,
    delete: isOwnerOrBusinessAdmin,
    // هنرجو هرگز نباید بتواند وارد پنل مدیریت Payload شود — ورود او فقط از حساب کاربری سایت است
    admin: () => false,
  },
  fields: [
    {
      name: 'mobile',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'موبایل (نرمال‌شده)',
      access: { update: isOwnerOrBusinessAdmin },
      admin: { description: 'شکل استاندارد E.164 — فقط پشتیبانی می‌تواند در موارد استثنایی ویرایش کند.' },
    },
    { name: 'name', type: 'text', label: 'نام' },
    { name: 'email', type: 'email', label: 'ایمیل (اختیاری)' },
    {
      name: 'birthdayJalali',
      type: 'group',
      label: 'تاریخ تولد شمسی (اختیاری)',
      fields: [
        { name: 'day', type: 'number', min: 1, max: 31, label: 'روز' },
        {
          name: 'month',
          type: 'number',
          min: 1,
          max: 12,
          label: 'ماه',
        },
        { name: 'year', type: 'number', label: 'سال (اختیاری)' },
      ],
    },
    { name: 'city', type: 'text', label: 'شهر' },
    {
      name: 'skillLevel',
      type: 'select',
      label: 'سطح مهارت',
      options: [
        { label: 'مبتدی', value: 'beginner' },
        { label: 'دارای تجربه', value: 'experienced' },
        { label: 'حرفه‌ای', value: 'professional' },
      ],
    },
    {
      name: 'interests',
      type: 'select',
      hasMany: true,
      label: 'علاقه‌مندی‌های آموزشی',
      options: [
        { label: 'پودر و ژل', value: 'powder_gel' },
        { label: 'موادگذاری', value: 'extensions' },
        { label: 'طراحی ناخن', value: 'nail_art' },
        { label: 'رفع اشکال', value: 'troubleshooting' },
        { label: 'مانیکور و زیرسازی', value: 'manicure_prep' },
      ],
    },
    {
      name: 'acquisition',
      type: 'group',
      label: 'منبع آشنایی',
      admin: { description: 'برای گزارش بازاریابی — از UTM لینک ورودی پر می‌شود.' },
      fields: [
        { name: 'source', type: 'text', label: 'منبع (utm_source)' },
        { name: 'medium', type: 'text', label: 'رسانه (utm_medium)' },
        { name: 'campaign', type: 'text', label: 'کمپین (utm_campaign)' },
      ],
    },
    {
      name: 'marketingConsent',
      type: 'checkbox',
      defaultValue: false,
      label: 'رضایت دریافت پیامک تبلیغاتی',
      admin: {
        description: 'جدا از پذیرش شرایط خرید است. کاربر هر زمان می‌تواند لغو کند.',
      },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      label: 'برچسب‌های داخلی',
      access: { read: isAnyAdminStaff, update: isOwnerOrBusinessAdmin },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      label: 'یادداشت داخلی مدیر',
      access: { read: isAnyAdminStaff, update: isAnyAdminStaff },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      label: 'وضعیت',
      options: [
        { label: 'فعال', value: 'active' },
        { label: 'مسدود', value: 'blocked' },
      ],
      access: { update: isOwnerOrBusinessAdmin },
    },
  ],
}
