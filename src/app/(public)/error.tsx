'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { ErrorScreen, NailTipIcon } from '@/components/site/ErrorScreen'

export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // جزئیات فنی فقط در کنسول؛ به کاربر پیام ساده فارسی نشان داده می‌شود
    console.error(error)
  }, [error])

  return (
    <ErrorScreen
      mark={<NailTipIcon />}
      title="مشکلی پیش آمد"
      lead="بخشی از سایت در حال حاضر درست کار نمی‌کند. چند لحظه دیگر دوباره تلاش کنید."
      primary={
        <button type="button" onClick={reset} className="btn btn-primary">
          تلاش دوباره
        </button>
      }
      secondary={{ href: '/', label: 'بازگشت به صفحه اصلی' }}
    >
      <p className="mt-8 text-[0.8125rem] text-[var(--color-text-muted)]">
        اگر مشکل ادامه داشت، از{' '}
        <Link href="/contact" className="font-semibold text-[var(--color-primary)]">
          صفحه تماس
        </Link>{' '}
        در واتساپ پیام بدهید.
      </p>
    </ErrorScreen>
  )
}
