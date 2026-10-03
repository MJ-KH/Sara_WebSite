'use client'

import Image from 'next/image'
import Link from 'next/link'
import { OtpLoginForm } from './OtpLoginForm'

/** صفحه ورود حساب کاربری: نوار بالا با راه بازگشت به سایت، و فرم ورود در کارت وسط صفحه. */
export function AccountLoginGate({
  brandName,
  logo,
}: {
  brandName: string
  logo?: { url: string; width: number; height: number } | null
}) {
  return (
    <div className="band-alt flex min-h-screen flex-col">
      <header className="container-x relative flex h-16 items-center justify-between md:h-20">
        <Link href="/" className="flex min-h-11 items-center gap-1.5 text-[0.9375rem] text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          <span aria-hidden="true">→</span>
          بازگشت به سایت
        </Link>
        <Link href="/" className="absolute left-1/2 -translate-x-1/2" aria-label={brandName}>
          {logo ? (
            <Image src={logo.url} alt="" width={logo.width} height={logo.height} priority className="h-8 w-auto md:h-10" />
          ) : (
            <span className="font-semibold">{brandName}</span>
          )}
        </Link>
        <span aria-hidden="true" />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-6 md:items-center md:pt-0">
        <div className="card-soft w-full max-w-sm p-6 md:p-8">
          <h1 className="title-1 text-center">ورود / ثبت‌نام</h1>
          <p className="mb-6 mt-2 text-center text-[0.9375rem] text-[var(--color-text-muted)]">
            با شماره موبایل وارد شوید؛ اگر حساب ندارید، همین‌جا ساخته می‌شود.
          </p>
          <OtpLoginForm onSuccess={() => window.location.reload()} />
        </div>
      </main>
    </div>
  )
}
