import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getRequestUser } from '@/lib/auth/get-request-user'
import { getPayloadClient } from '@/lib/get-payload'

type Params = { params: Promise<{ slug: string }> }

async function getItem(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'free-lessons',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    limit: 1,
    depth: 2,
  })
  return result.docs[0] ?? null
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const item = await getItem(slug)
  return { title: item?.title }
}

export default async function FreeLessonDetailPage({ params }: Params) {
  const { slug } = await params
  const item = await getItem(slug)
  if (!item) notFound()

  const user = await getRequestUser()
  const canDownload = !item.requiresLoginForDownload || user?.collection === 'students'
  const downloadFile = typeof item.downloadFile === 'object' ? item.downloadFile : null
  const relatedPackage = typeof item.relatedPackage === 'object' ? item.relatedPackage : null

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">{item.title}</h1>
      {item.body ? (
        <div className="prose prose-neutral mt-6 max-w-none leading-loose">
          <RichText data={item.body} />
        </div>
      ) : null}

      {item.contentType === 'video' && item.videoUrl ? (
        <div className="mt-6">
          <a href={item.videoUrl} target="_blank" rel="noreferrer" className="text-[var(--color-primary)] underline">
            مشاهده ویدئو
          </a>
        </div>
      ) : null}

      {downloadFile?.url ? (
        <div className="mt-6 rounded-[var(--radius-base)] border border-[var(--color-border)] p-4">
          {canDownload ? (
            <a href={downloadFile.url} className="btn btn-primary inline-block px-4 py-2 text-sm font-bold">
              دانلود فایل
            </a>
          ) : (
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">برای دانلود این فایل ابتدا باید وارد حساب کاربری شوید.</p>
              <Link href="/account/profile" className="mt-2 inline-block text-sm text-[var(--color-primary)] underline">
                ورود / ثبت‌نام
              </Link>
            </div>
          )}
        </div>
      ) : null}

      {relatedPackage ? (
        <div className="mt-10 rounded-[var(--radius-base)] bg-[var(--color-accent-soft)] p-4">
          <p className="text-sm">علاقه‌مند به یادگیری بیشتر؟</p>
          <Link href={`/packages/${relatedPackage.slug}`} className="mt-1 inline-block font-bold text-[var(--color-primary)]">
            مشاهده پکیج «{relatedPackage.title}»
          </Link>
        </div>
      ) : null}
    </article>
  )
}
