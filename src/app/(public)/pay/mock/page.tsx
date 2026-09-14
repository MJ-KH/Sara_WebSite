import type { Metadata } from 'next'

export const metadata: Metadata = { robots: { index: false, follow: false } }

type SearchParams = Promise<{ authority?: string; callback?: string; desc?: string }>

/**
 * شبیه‌ساز درگاه پرداخت آزمایشی. فقط وقتی PAYMENT_PROVIDER=mock فعال است استفاده می‌شود
 * (ر.ک. src/lib/payments/mock.ts) و در محیط عملیاتی هرگز به این مسیر هدایت نمی‌شود چون
 * getPaymentGateway در NODE_ENV=production با mock خطا می‌دهد.
 */
export default async function MockPaymentPage({ searchParams }: { searchParams: SearchParams }) {
  const { authority, callback, desc } = await searchParams
  if (!authority || !callback) {
    return <div className="mx-auto max-w-md px-4 py-20 text-center">پارامترهای درگاه آزمایشی ناقص است.</div>
  }

  const successUrl = `${callback}${callback.includes('?') ? '&' : '?'}Authority=${encodeURIComponent(authority)}&Status=OK`
  const failUrl = `${callback}${callback.includes('?') ? '&' : '?'}Authority=${encodeURIComponent(authority)}&Status=NOK`

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="mb-6 rounded-[var(--radius-base)] bg-yellow-100 p-3 text-sm text-yellow-900">
        این یک درگاه پرداخت آزمایشی برای محیط توسعه است — هیچ مبلغ واقعی جابه‌جا نمی‌شود.
      </div>
      <h1 className="text-xl font-bold">تأیید پرداخت آزمایشی</h1>
      {desc ? <p className="mt-2 text-[var(--color-text-muted)]">{desc}</p> : null}
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">شناسه: {authority}</p>
      <div className="mt-8 flex flex-col gap-3">
        <a href={successUrl} className="btn btn-primary p-3 font-bold">
          پرداخت موفق (آزمایشی)
        </a>
        <a href={failUrl} className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-3 font-bold">
          پرداخت ناموفق (آزمایشی)
        </a>
      </div>
    </div>
  )
}
