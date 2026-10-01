'use client'

import Link from 'next/link'
import { OtpLoginForm } from './OtpLoginForm'

/** صفحه ورود حساب کاربری: نوار بالا با راه بازگشت به سایت، و فرم ورود در کارت وسط صفحه. */
export function AccountLoginGate({ brandName }: { brandName: string }) {
  return (
    <div className="band-alt flex min-h-screen flex-col">
      <header className="container-x flex items-center justify-between gap-4 py-5">
        <Link href="/" className="font-bold">
          {brandName}
        </Link>
        <Link href="/" className="btn btn-ghost btn-sm bg-[var(--color-surface)]">
          → بازگشت به سایت
        </Link>
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
