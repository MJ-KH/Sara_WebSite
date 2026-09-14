import type { Metadata } from 'next'
import { ConsultationForm } from '@/components/forms/ConsultationForm'
import { getSiteSettings } from '@/lib/get-site-settings'

export const metadata: Metadata = { title: 'ارتباط با ما' }

export default async function ContactPage() {
  const settings = await getSiteSettings()
  const contact = settings.contact || {}

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">ارتباط با ما</h1>
      <div className="mb-10 grid grid-cols-1 gap-4 rounded-[var(--radius-base)] border border-[var(--color-border)] p-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-1 font-bold">تلفن</h2>
          <p className="text-[var(--color-text-muted)]">{contact.phone || 'به‌زودی تکمیل می‌شود'}</p>
        </div>
        <div>
          <h2 className="mb-1 font-bold">ایمیل</h2>
          <p className="text-[var(--color-text-muted)]">{contact.email || 'به‌زودی تکمیل می‌شود'}</p>
        </div>
        <div className="sm:col-span-2">
          <h2 className="mb-1 font-bold">آدرس</h2>
          <p className="text-[var(--color-text-muted)]">{contact.address || 'به‌زودی تکمیل می‌شود'}</p>
        </div>
      </div>
      <ConsultationForm heading="مشاوره رایگان انتخاب پکیج" description="فرم زیر را پر کنید تا در اولین فرصت با شما تماس بگیریم." />
    </div>
  )
}
