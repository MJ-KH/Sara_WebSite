import type { Metadata } from 'next'
import type React from 'react'
import { AccountFrame, AccountMenu, type AccountMenuItem, AccountTopBar } from '@/components/account/AccountChrome'
import { MemberCard } from '@/components/account/MemberCard'
import { AccountLoginGate } from '@/components/auth/AccountLoginGate'
import { FontPreload } from '@/components/site/FontPreload'
import { getRequestUser } from '@/lib/auth/get-request-user'
import { toPersianDigits } from '@/lib/digits'
import { getPayloadClient } from '@/lib/get-payload'
import { getSiteSettings } from '@/lib/get-site-settings'
import { gregorianToJalali, JALALI_MONTH_NAMES_FA } from '@/lib/jalali'
import { formatIranMobileForDisplay } from '@/lib/phone'
import '../globals.css'

export const metadata: Metadata = { robots: { index: false, follow: false } }
// حساب کاربری کاملاً به نشست و داده لحظه‌ای وابسته است؛ هرگز استاتیک پیش‌تولید نشود.
export const dynamic = 'force-dynamic'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  const theme = settings.theme || {}
  const user = await getRequestUser()
  const brandName = settings.brand?.nameFa || 'سارا نقی‌زاده'
  const logo = typeof settings.brand?.logo === 'object' && settings.brand?.logo?.url ? settings.brand.logo : null
  const logoOnDark = typeof settings.brand?.logoOnDark === 'object' && settings.brand?.logoOnDark?.url ? settings.brand.logoOnDark : null
  const toLogo = (media: typeof logo, fallback: { width: number; height: number }) =>
    media?.url ? { url: media.url, width: media.width ?? fallback.width, height: media.height ?? fallback.height } : null

  return (
    <html
      lang="fa"
      dir="rtl"
      data-theme-color={theme.primaryColor || 'gold-dark'}
      data-radius={theme.radius || 'md'}
      data-font-scale={theme.fontScale || 'md'}
      data-button-style={theme.buttonStyle || 'solid'}
    >
      <head>
        <FontPreload />
      </head>
      <body className="min-h-screen">
        {user?.collection === 'students' ? (
          <div className="account-shell flex min-h-screen flex-col">
            <AccountTopBar logo={toLogo(logo, { width: 200, height: 66 })} brandName={brandName} />
            <AccountFrame
              sidebar={<AccountSidebar studentId={user.id} logoOnDark={toLogo(logoOnDark, { width: 400, height: 300 })} />}
            >
              {children}
            </AccountFrame>
          </div>
        ) : (
          <AccountLoginGate brandName={brandName} logo={toLogo(logo, { width: 200, height: 66 })} />
        )}
      </body>
    </html>
  )
}

/** کارت عضویت + منو + خروج؛ در موبایل صفحه اول حساب است و در دسکتاپ ستون کنار همه صفحه‌ها. */
async function AccountSidebar({ studentId, logoOnDark }: { studentId: number; logoOnDark: { url: string; width: number; height: number } | null }) {
  const payload = await getPayloadClient()
  const [student, courses, workshops] = await Promise.all([
    payload.findByID({ collection: 'students', id: studentId, depth: 0, overrideAccess: true }),
    payload.count({
      collection: 'entitlements',
      where: {
        and: [
          { student: { equals: studentId } },
          { revokedAt: { equals: null } },
          { or: [{ expiresAt: { equals: null } }, { expiresAt: { greater_than: new Date().toISOString() } }] },
        ],
      },
      overrideAccess: true,
    }),
    payload.count({ collection: 'workshop-enrollments', where: { student: { equals: studentId } }, overrideAccess: true }),
  ])
  const joined = gregorianToJalali(new Date(student.createdAt))

  const items: AccountMenuItem[] = [
    { href: '/account/my-packages', label: 'دوره‌های من', hint: 'کد لایسنس و راهنمای تماشا', icon: 'play', badge: courses.totalDocs || undefined },
    // بخش ورکشاپ از سایت پنهان است؛ فقط اگر هنرجو ثبت‌نامی دارد نمایش داده می‌شود
    ...(workshops.totalDocs > 0
      ? [{ href: '/account/workshops', label: 'ورکشاپ‌های من', hint: 'زمان و وضعیت ثبت‌نام', icon: 'calendar' as const }]
      : []),
    { href: '/account/orders', label: 'سفارش‌ها', hint: 'خریدها و وضعیت پرداخت', icon: 'bag' },
    { href: '/account/support', label: 'پشتیبانی', hint: 'پیام به تیم سارا', icon: 'chat' },
    { href: '/account/profile', label: 'اطلاعات من', hint: 'نام، استان، تاریخ تولد', icon: 'user' },
  ]

  return (
    <div className="flex flex-col gap-5">
      <MemberCard
        name={student.name?.trim() || 'هنرجوی عزیز'}
        mobile={formatIranMobileForDisplay(student.mobile)}
        memberSince={toPersianDigits(`${JALALI_MONTH_NAMES_FA[joined.jm - 1]} ${joined.jy}`)}
        courseCount={courses.totalDocs}
        logo={logoOnDark}
      />
      <AccountMenu items={items} />
      <form action="/api/auth/logout" method="post" className="text-center">
        <button type="submit" className="min-h-11 px-4 text-[0.875rem] text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          خروج از حساب
        </button>
      </form>
    </div>
  )
}
