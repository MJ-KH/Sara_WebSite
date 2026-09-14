import type { Metadata } from 'next'
import { PageBlocks } from '@/blocks/BlockRenderer'
import { getPageBySlug } from '@/lib/pages/get-page'
import { buildPageMetadata } from '@/lib/pages/metadata'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('home')
  return buildPageMetadata(page)
}

export default async function HomePage() {
  const page = await getPageBySlug('home')

  if (!page) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">صفحه اصلی هنوز ساخته نشده است</h1>
        <p className="mt-4 text-[var(--color-text-muted)]">
          از پنل مدیریت، بخش «صفحات و ظاهر → صفحات»، صفحه‌ای با نامک <code dir="ltr">home</code> بسازید و منتشر کنید.
        </p>
      </div>
    )
  }

  return <PageBlocks blocks={page.layout || []} />
}
