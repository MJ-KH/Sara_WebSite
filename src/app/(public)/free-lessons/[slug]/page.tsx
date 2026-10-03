import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Ornament } from '@/components/brand/Ornament'
import { JsonLd } from '@/components/seo/JsonLd'
import { SampleBadge } from '@/components/ui/SampleBadge'
import { getRequestUser } from '@/lib/auth/get-request-user'
import { splitSampleMarker } from '@/lib/display'
import { getPayloadClient } from '@/lib/get-payload'
import { buildSeoMetadata, siteUrl } from '@/lib/seo/metadata'

type Params = { params: Promise<{ slug: string }> }

const CONTENT_TYPE_LABELS: Record<string, string> = {
  article: 'مقاله',
  video: 'ویدئو',
  file: 'فایل دانلودی',
}

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
  if (!item) return {}
  return buildSeoMetadata({
    title: splitSampleMarker(item.title).text,
    path: `/free-lessons/${item.slug}`,
    image: typeof item.coverImage === 'object' ? item.coverImage?.url : null,
  })
}

export default async function FreeLessonDetailPage({ params }: Params) {
  const { slug } = await params
  const item = await getItem(slug)
  if (!item) notFound()

  const user = await getRequestUser()
  const canDownload = !item.requiresLoginForDownload || user?.collection === 'students'
  const downloadFile = typeof item.downloadFile === 'object' ? item.downloadFile : null
  const relatedPackage = typeof item.relatedPackage === 'object' ? item.relatedPackage : null
  const category = typeof item.category === 'object' ? item.category : null
  const title = splitSampleMarker(item.title)
  const url = siteUrl()
  const coverImage = typeof item.coverImage === 'object' ? item.coverImage : null
  const cover = coverImage?.url ? new URL(coverImage.url, url).toString() : undefined

  return (
    <article>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: title.text,
          url: `${url}/free-lessons/${item.slug}`,
          inLanguage: 'fa',
          datePublished: item.createdAt,
          dateModified: item.updatedAt,
          ...(cover ? { image: cover } : {}),
          author: { '@type': 'Person', name: 'سارا نقی‌زاده' },
        }}
      />
      <header className="band-alt">
        <div className="container-narrow py-12 text-center md:py-16">
          <nav aria-label="مسیر صفحه" className="text-[0.875rem] text-[var(--color-text-muted)]">
            <Link href="/free-lessons" className="hover:text-[var(--color-primary)]">
              آموزش رایگان
            </Link>
            {category?.title ? (
              <>
                <span className="mx-2" aria-hidden="true">
                  /
                </span>
                <Link href={`/free-lessons?category=${category.id}`} className="hover:text-[var(--color-primary)]">
                  {category.title}
                </Link>
              </>
            ) : null}
          </nav>
          <div className="mt-4 flex items-center justify-center gap-2 text-[0.8125rem] font-semibold text-[var(--color-primary)]">
            <span>{CONTENT_TYPE_LABELS[item.contentType] ?? ''}</span>
            {title.isSample ? <SampleBadge /> : null}
          </div>
          <h1 className="display-2 mt-2">{title.text}</h1>
          <Ornament className="mt-6" />
        </div>
      </header>

      <div className="container-narrow section">
        {coverImage?.url ? (
          <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-[var(--radius-media)] bg-[var(--color-bg-alt)]">
            <Image
              src={coverImage.url}
              alt={coverImage.alt || title.text}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 42rem"
              className="object-cover"
            />
          </div>
        ) : null}
        {item.body ? (
          <div className="rich-text">
            <RichText data={item.body} />
          </div>
        ) : null}

        {item.contentType === 'video' && item.videoUrl ? (
          <a href={item.videoUrl} target="_blank" rel="noreferrer" className="btn btn-primary mt-8">
            مشاهده ویدئو
          </a>
        ) : null}

        {downloadFile?.url ? (
          <div className="card-soft mt-10 p-6">
            {canDownload ? (
              <a href={downloadFile.url} className="btn btn-primary">
                دانلود فایل
              </a>
            ) : (
              <div>
                <p className="text-[var(--color-text-muted)]">برای دانلود این فایل ابتدا باید وارد حساب کاربری شوید.</p>
                <Link href="/account" className="btn btn-ghost mt-4">
                  ورود / ثبت‌نام
                </Link>
              </div>
            )}
          </div>
        ) : null}

        {relatedPackage ? (
          <aside className="card-soft mt-12 flex flex-col items-start gap-3 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <p className="text-[0.9375rem] text-[var(--color-text-muted)]">می‌خواهید این موضوع را کامل و عملی یاد بگیرید؟</p>
              <p className="title-2 mt-1">دوره «{splitSampleMarker(relatedPackage.title).text}»</p>
            </div>
            <Link href={`/packages/${relatedPackage.slug}`} className="btn btn-primary shrink-0">
              مشاهده دوره
            </Link>
          </aside>
        ) : null}
      </div>
    </article>
  )
}
