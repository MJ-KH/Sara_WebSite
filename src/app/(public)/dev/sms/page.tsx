import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageIntro } from '@/components/site/PageIntro'
import { toPersianDigits } from '@/lib/digits'
import { isSmsTestMode } from '@/lib/sms'
import { getMockOutbox } from '@/lib/sms/mock'

export const metadata: Metadata = { title: 'صندوق پیامک آزمایشی', robots: { index: false, follow: false } }

/**
 * صندوق پیامک آزمایشی برای تست ورود در محیط توسعه. فقط وقتی وجود دارد که سایت در حالت
 * توسعه و پیامک آزمایشی (SMS_PROVIDER=mock) باشد؛ در غیر این صورت ۴۰۴ است.
 */
export default function DevSmsInboxPage() {
  if (!isSmsTestMode()) notFound()
  const messages = getMockOutbox()

  return (
    <>
      <PageIntro
        title="صندوق پیامک آزمایشی"
        lead="سایت در حالت آزمایشی است و پیامک واقعی نمی‌فرستد. پیامک‌هایی که سایت «فرستاده» اینجا دیده می‌شوند؛ این صفحه روی سایت اصلی وجود ندارد."
      />
      <section className="section">
        <div className="container-narrow">
          <div className="mb-6 text-center">
            <Link href="/dev/sms" prefetch={false} className="btn btn-ghost">
              به‌روزرسانی
            </Link>
          </div>
          {messages.length === 0 ? (
            <p className="text-center text-[var(--color-text-muted)]">هنوز پیامکی فرستاده نشده. در صفحه ورود شماره را وارد کنید و «دریافت کد ورود» را بزنید.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {messages.map((message) => (
                <li key={`${message.sentAt}-${message.to}`} className="card-soft p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[0.8125rem] text-[var(--color-text-muted)]">
                    <span dir="ltr">{toPersianDigits(message.to.replace(/^\+98/, '0'))}</span>
                    <time dateTime={message.sentAt}>
                      {toPersianDigits(new Date(message.sentAt).toLocaleTimeString('fa-IR', { timeZone: 'Asia/Tehran' }))}
                    </time>
                  </div>
                  <p className="mt-2 text-[1.0625rem] font-bold">{message.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}
