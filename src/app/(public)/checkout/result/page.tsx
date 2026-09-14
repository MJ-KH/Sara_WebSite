import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { robots: { index: false, follow: false } }

type SearchParams = Promise<{ status?: string; ref?: string }>

const MESSAGES: Record<string, { title: string; body: string }> = {
  success: { title: 'پرداخت با موفقیت انجام شد', body: 'دسترسی شما فعال شد. می‌توانید از حساب کاربری آموزش را شروع کنید.' },
  failed: { title: 'پرداخت ناموفق بود', body: 'مبلغی از حساب شما کسر نشده یا تراکنش تأیید نشد. می‌توانید دوباره تلاش کنید.' },
  error: { title: 'خطا در بررسی پرداخت', body: 'در بررسی وضعیت تراکنش خطایی رخ داد. اگر مبلغی کسر شده، از بخش پشتیبانی پیگیری کنید.' },
}

export default async function CheckoutResultPage({ searchParams }: { searchParams: SearchParams }) {
  const { status } = await searchParams
  const info = MESSAGES[status || ''] ?? MESSAGES.error ?? MESSAGES.failed!

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">{info.title}</h1>
      <p className="mt-4 text-[var(--color-text-muted)]">{info.body}</p>
      <div className="mt-8 flex flex-col gap-3">
        <Link href="/account/my-packages" className="btn btn-primary p-3 font-bold">
          مشاهده آموزش‌های من
        </Link>
        <Link href="/contact" className="text-sm text-[var(--color-text-muted)] underline">
          نیاز به پشتیبانی دارم
        </Link>
      </div>
    </div>
  )
}
