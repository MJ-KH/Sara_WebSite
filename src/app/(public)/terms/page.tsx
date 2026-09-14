import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/get-site-settings'

export const metadata: Metadata = { title: 'شرایط خرید' }

export default async function TermsPage() {
  const settings = await getSiteSettings()
  const richText = settings.legal?.purchaseTermsText

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">شرایط خرید</h1>
      {richText ? (
        <div className="prose prose-neutral max-w-none leading-loose">
          <RichText data={richText} />
        </div>
      ) : (
        <p className="text-[var(--color-text-muted)]">این بخش هنوز از پنل مدیریت تکمیل نشده است.</p>
      )}
    </div>
  )
}
