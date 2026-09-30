import type { Metadata } from 'next'
import { ConsultationForm } from '@/components/forms/ConsultationForm'
import { phoneForDisplay } from '@/lib/display'
import { getSiteSettings } from '@/lib/get-site-settings'

export const metadata: Metadata = { title: 'ارتباط با ما' }

export default async function ContactPage() {
  const settings = await getSiteSettings()
  const contact = settings.contact || {}
  const tel = phoneForDisplay(contact.phone)
  const academy = settings.instagram?.academyHandle

  return (
    <div className="section">
      <div className="container-narrow">
        <h1 className="display-2">ارتباط با ما</h1>
        <dl className="mt-10 grid gap-6 border-y border-[var(--color-border)] py-8 sm:grid-cols-2">
          <div>
            <dt className="text-[0.875rem] text-[var(--color-text-muted)]">تلفن</dt>
            <dd className="mt-1 text-[1.125rem] font-bold">
              {tel ? (
                <a href={tel.href} dir="ltr" className="text-[var(--color-primary)]">
                  {tel.text}
                </a>
              ) : (
                'به‌زودی تکمیل می‌شود'
              )}
            </dd>
          </div>
          {academy ? (
            <div>
              <dt className="text-[0.875rem] text-[var(--color-text-muted)]">اینستاگرام</dt>
              <dd className="mt-1 text-[1.125rem] font-bold">
                <a href={`https://instagram.com/${academy}`} target="_blank" rel="noreferrer" dir="ltr" className="text-[var(--color-primary)]">
                  @{academy}
                </a>
              </dd>
            </div>
          ) : null}
          {contact.email ? (
            <div>
              <dt className="text-[0.875rem] text-[var(--color-text-muted)]">ایمیل</dt>
              <dd className="mt-1 font-bold" dir="ltr">
                {contact.email}
              </dd>
            </div>
          ) : null}
          {contact.address ? (
            <div className="sm:col-span-2">
              <dt className="text-[0.875rem] text-[var(--color-text-muted)]">آدرس</dt>
              <dd className="mt-1 whitespace-pre-line">{contact.address}</dd>
            </div>
          ) : null}
        </dl>
        <div className="mt-12">
          <ConsultationForm heading="مشاوره رایگان انتخاب پکیج" description="فرم زیر را پر کنید تا در اولین فرصت با شما تماس بگیریم." />
        </div>
      </div>
    </div>
  )
}
