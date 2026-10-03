import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { PageIntro } from '@/components/site/PageIntro'
import { ConsultationForm } from '@/components/forms/ConsultationForm'
import { phoneForDisplay, whatsappLink } from '@/lib/display'
import { getSiteSettings } from '@/lib/get-site-settings'
import { buildSeoMetadata } from '@/lib/seo/metadata'

export function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: 'آدرس سالن ناخن سارا نقی‌زاده در سعادت‌آباد تهران',
    description:
      'آدرس، تلفن، واتساپ و مسیریابی سالن ناخن و زیبایی سارا نقی‌زاده در سعادت‌آباد تهران؛ رزرو وقت کاشت و ترمیم ناخن و مشاوره دوره آموزش کاشت ناخن.',
    path: '/contact',
  })
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[0.875rem] text-[var(--color-text-muted)]">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  )
}

export default async function ContactPage() {
  const settings = await getSiteSettings()
  const contact = settings.contact || {}
  const mobile = phoneForDisplay(contact.phone)
  const landline = phoneForDisplay(contact.landline)
  const whatsapp = whatsappLink(contact.whatsapp, contact.whatsappGreeting)
  const notes = (contact.visitNotes || '').split('\n').map((line) => line.trim()).filter(Boolean)
  const instagramPages = [
    { handle: settings.instagram?.academyHandle, label: 'آکادمی آموزش' },
    { handle: settings.instagram?.servicesHandle, label: 'خدمات ناخن' },
    { handle: settings.instagram?.salonHandle, label: 'سالن زیبایی' },
  ].filter((page): page is { handle: string; label: string } => Boolean(page.handle))

  return (
    <>
      <PageIntro title="تماس با ما" lead="برای مشاوره انتخاب دوره آموزش ناخن یا رزرو وقت در سالن ناخن و زیبایی ما در سعادت‌آباد تهران، با ما در ارتباط باشید." />

      <section className="section">
        <div className="container-x grid gap-6 md:grid-cols-2 md:gap-8">
          <div className="card-soft p-6 md:p-8">
            <h2 className="title-1">تلفن و پیام</h2>
            <dl className="mt-5 flex flex-col gap-5">
              {mobile ? (
                <Row label="موبایل">
                  <a href={mobile.href} dir="ltr" className="text-[1.25rem] font-bold text-[var(--color-primary)]">
                    {mobile.text}
                  </a>
                </Row>
              ) : null}
              {landline ? (
                <Row label="تلفن سالن">
                  <a href={landline.href} dir="ltr" className="text-[1.125rem] font-bold">
                    {landline.text}
                  </a>
                </Row>
              ) : null}
              {contact.email ? (
                <Row label="ایمیل">
                  <span dir="ltr">{contact.email}</span>
                </Row>
              ) : null}
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              {whatsapp ? (
                <a href={whatsapp} target="_blank" rel="noreferrer" className="btn btn-primary">
                  پیام در واتساپ
                </a>
              ) : null}
              {settings.socials?.telegramHandle ? (
                <a href={`https://t.me/${settings.socials.telegramHandle}`} target="_blank" rel="noreferrer" className="btn btn-ghost">
                  تلگرام
                </a>
              ) : null}
            </div>
          </div>

          {contact.address ? (
            <div className="card-soft p-6 md:p-8">
              <h2 className="title-1">آدرس سالن</h2>
              <p className="mt-5 whitespace-pre-line">{contact.address}</p>
              {contact.neshanUrl || contact.googleMapsUrl ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  {contact.neshanUrl ? (
                    <a href={contact.neshanUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">
                      مسیریابی با نشان
                    </a>
                  ) : null}
                  {contact.googleMapsUrl ? (
                    <a href={contact.googleMapsUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">
                      مسیریابی با گوگل
                    </a>
                  ) : null}
                </div>
              ) : null}
              {notes.length > 0 ? (
                <ul className="mt-6 flex flex-col gap-2 border-t border-[var(--color-border)] pt-5 text-[0.9375rem] text-[var(--color-text-muted)]">
                  {notes.map((note) => (
                    <li key={note} className="flex gap-2">
                      <span aria-hidden="true" className="text-[var(--color-primary)]">
                        •
                      </span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {instagramPages.length > 0 || settings.socials?.youtubeUrl ? (
            <div className="card-soft p-6 md:col-span-2 md:p-8">
              <h2 className="title-1">شبکه‌های اجتماعی</h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {instagramPages.map((page) => (
                  <li key={page.handle}>
                    <a href={`https://instagram.com/${page.handle}`} target="_blank" rel="noreferrer" className="block hover:text-[var(--color-primary)]">
                      <span className="block text-[0.875rem] text-[var(--color-text-muted)]">اینستاگرام {page.label}</span>
                      <span dir="ltr" className="font-bold">
                        @{page.handle}
                      </span>
                    </a>
                  </li>
                ))}
                {settings.socials?.youtubeUrl ? (
                  <li>
                    <a href={settings.socials.youtubeUrl} target="_blank" rel="noreferrer" className="block hover:text-[var(--color-primary)]">
                      <span className="block text-[0.875rem] text-[var(--color-text-muted)]">یوتیوب</span>
                      <span className="font-bold">کانال آموزشی</span>
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section className="section band-alt">
        <div className="container-narrow">
          <div className="card-soft p-6 md:p-10">
            <ConsultationForm heading="مشاوره رایگان انتخاب دوره" description="فرم زیر را پر کنید تا در اولین فرصت با شما تماس بگیریم." />
          </div>
        </div>
      </section>
    </>
  )
}
