import Image from 'next/image'
import { toPersianDigits } from '@/lib/digits'

/**
 * کارت عضویت بالای حساب (نمونه «الف» تأییدشده کارفرما): زمینه تیره آلویی با لوگوی طلایی،
 * نام هنرجو و سه داده کوتاه. قاب طلایی داخلی همان حس دوخت قاب‌های طاقی سایت را دارد.
 */
export function MemberCard({
  name,
  mobile,
  memberSince,
  courseCount,
  logo,
}: {
  name: string
  mobile: string
  memberSince: string
  courseCount: number
  logo: { url: string; width: number; height: number } | null
}) {
  return (
    <section
      aria-label="کارت عضویت"
      className="member-card relative overflow-hidden rounded-[1.25rem] px-6 pb-5 pt-5 text-[#f4ecee] md:px-7"
    >
      {logo ? <Image src={logo.url} alt="" width={logo.width} height={logo.height} className="-ms-1 h-16 w-auto" /> : null}
      <h1 className="mt-5 text-[1.375rem] font-medium leading-snug">{name}</h1>
      <p className="mt-0.5 text-[0.8125rem] text-[#d9c3a5]">هنرجوی آکادمی سارا نقی‌زاده</p>
      <dl className="mt-5 flex justify-between gap-3 border-t border-[rgba(196,164,124,0.25)] pt-3.5 text-[0.75rem] text-[#cbb7bd]">
        <div>
          <dt>عضو از</dt>
          <dd className="mt-0.5 text-[0.9375rem] font-medium text-[#f4ecee]">{memberSince}</dd>
        </div>
        <div>
          <dt>دوره‌ها</dt>
          <dd className="mt-0.5 text-[0.9375rem] font-medium text-[#f4ecee]">{toPersianDigits(courseCount)} دوره</dd>
        </div>
        <div>
          <dt>موبایل</dt>
          <dd dir="ltr" className="mt-0.5 text-end text-[0.9375rem] font-medium text-[#f4ecee]">
            {toPersianDigits(mobile)}
          </dd>
        </div>
      </dl>
    </section>
  )
}
