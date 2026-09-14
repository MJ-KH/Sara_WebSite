import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FaqAccordion } from '@/components/ui/FaqAccordion'
import { Money } from '@/components/ui/Money'
import { TestimonialCard } from '@/components/ui/TestimonialCard'
import { getRequestUser } from '@/lib/auth/get-request-user'
import { getPayloadClient } from '@/lib/get-payload'
import { formatJalaliDate } from '@/lib/jalali'
import { extractId } from '@/lib/relation'

type Params = { params: Promise<{ slug: string }> }

async function getData(slug: string) {
  const payload = await getPayloadClient()
  const packages = await payload.find({
    collection: 'packages',
    where: { slug: { equals: slug }, status: { not_equals: 'draft' } },
    limit: 1,
    depth: 1,
  })
  const pkg = packages.docs[0]
  if (!pkg) return null

  const chapters = await payload.find({
    collection: 'chapters',
    where: { package: { equals: pkg.id }, status: { equals: 'published' } },
    sort: 'order',
    limit: 100,
  })
  const lessons = await payload.find({
    collection: 'lessons',
    where: { package: { equals: pkg.id }, status: { equals: 'published' } },
    sort: 'order',
    limit: 500,
  })
  const testimonials = await payload.find({
    collection: 'testimonials',
    where: { approved: { equals: true }, relatedPackage: { equals: pkg.id } },
    limit: 6,
  })

  return { pkg, chapters: chapters.docs, lessons: lessons.docs, testimonials: testimonials.docs }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const data = await getData(slug)
  if (!data) return {}
  const seo = data.pkg.seo || {}
  return { title: seo.metaTitle || data.pkg.title, description: seo.metaDescription || data.pkg.subtitle || undefined }
}

export default async function PackageDetailPage({ params }: Params) {
  const { slug } = await params
  const data = await getData(slug)
  if (!data) notFound()
  const { pkg, chapters, lessons, testimonials } = data

  const user = await getRequestUser()
  let hasAccess = false
  if (user?.collection === 'students') {
    const payload = await getPayloadClient()
    const entitlement = await payload.find({
      collection: 'entitlements',
      where: {
        and: [
          { student: { equals: user.id } },
          { package: { equals: pkg.id } },
          { revokedAt: { equals: null } },
          { or: [{ expiresAt: { equals: null } }, { expiresAt: { greater_than: new Date().toISOString() } }] },
        ],
      },
      limit: 1,
    })
    hasAccess = entitlement.totalDocs > 0
  }

  const totalDurationMinutes = Math.round(lessons.reduce((sum, l) => sum + (l.durationSeconds || 0), 0) / 60)
  const coverImage = typeof pkg.coverImage === 'object' ? pkg.coverImage : null
  const hasDiscount = Boolean(pkg.compareAtPriceRial && pkg.compareAtPriceRial > pkg.priceRial)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          {coverImage?.url ? (
            <div className="relative aspect-video overflow-hidden rounded-[var(--radius-base)]">
              <Image src={coverImage.url} alt={coverImage.alt || pkg.title} fill className="object-cover" />
            </div>
          ) : null}
        </div>
        <div>
          <h1 className="text-2xl font-bold leading-relaxed">{pkg.title}</h1>
          {pkg.subtitle ? <p className="mt-2 text-[var(--color-text-muted)]">{pkg.subtitle}</p> : null}
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-[var(--color-text-muted)]">
            <div>
              <dt className="font-bold text-[var(--color-text)]">تعداد درس</dt>
              <dd>{lessons.length} درس</dd>
            </div>
            <div>
              <dt className="font-bold text-[var(--color-text)]">مدت آموزش</dt>
              <dd>{totalDurationMinutes > 0 ? `${totalDurationMinutes} دقیقه` : 'به‌زودی مشخص می‌شود'}</dd>
            </div>
            {pkg.accessDurationDays ? (
              <div>
                <dt className="font-bold text-[var(--color-text)]">مدت دسترسی</dt>
                <dd>{pkg.accessDurationDays} روز</dd>
              </div>
            ) : (
              <div>
                <dt className="font-bold text-[var(--color-text)]">مدت دسترسی</dt>
                <dd>مادام‌العمر</dd>
              </div>
            )}
            {pkg.contentUpdatedAt ? (
              <div>
                <dt className="font-bold text-[var(--color-text)]">آخرین به‌روزرسانی</dt>
                <dd>{formatJalaliDate(new Date(pkg.contentUpdatedAt))}</dd>
              </div>
            ) : null}
          </dl>
          <div className="mt-6 flex items-center gap-3">
            {hasDiscount ? (
              <span className="text-[var(--color-text-muted)] line-through">
                <Money rial={pkg.compareAtPriceRial as number} />
              </span>
            ) : null}
            <Money rial={pkg.priceRial} className="text-xl font-bold text-[var(--color-primary)]" />
          </div>
          <div className="mt-6">
            {hasAccess ? (
              <Link href={`/account/my-packages/${pkg.slug}`} className="btn btn-primary block w-full py-3 text-center font-bold">
                ادامه آموزش
              </Link>
            ) : pkg.status === 'stopped' ? (
              <button type="button" disabled className="btn w-full bg-[var(--color-border)] py-3 font-bold text-[var(--color-text-muted)]">
                فروش این پکیج متوقف شده است
              </button>
            ) : (
              <Link href={`/checkout/${pkg.slug}`} className="btn btn-primary block w-full py-3 text-center font-bold">
                خرید پکیج
              </Link>
            )}
          </div>
        </div>
      </div>

      {pkg.description ? (
        <section className="prose prose-neutral mt-10 max-w-none leading-loose">
          <RichText data={pkg.description} />
        </section>
      ) : null}

      {pkg.targetAudience ? (
        <section className="mt-8">
          <h2 className="mb-2 text-xl font-bold">مخاطب مناسب و پیش‌نیازها</h2>
          <p className="leading-loose text-[var(--color-text-muted)]">{pkg.targetAudience}</p>
        </section>
      ) : null}

      {pkg.expectedOutcome ? (
        <section className="mt-8">
          <h2 className="mb-2 text-xl font-bold">نتیجه آموزشی مورد انتظار</h2>
          <p className="leading-loose text-[var(--color-text-muted)]">{pkg.expectedOutcome}</p>
        </section>
      ) : null}

      {chapters.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold">سرفصل‌ها</h2>
          <div className="flex flex-col gap-4">
            {chapters.map((chapter) => {
              const chapterLessons = lessons.filter((l) => extractId(l.chapter) === String(chapter.id))
              return (
                <div key={chapter.id} className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-4">
                  <h3 className="font-bold">{chapter.title}</h3>
                  <ul className="mt-2 flex flex-col gap-1 text-sm text-[var(--color-text-muted)]">
                    {chapterLessons.map((lesson) => (
                      <li key={lesson.id} className="flex items-center justify-between">
                        <span>{lesson.title}</span>
                        {lesson.isFreePreview ? (
                          <Link href={`/packages/${pkg.slug}/preview/${lesson.id}`} className="text-[var(--color-primary)]">
                            نمونه رایگان
                          </Link>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}

      {pkg.toolsAndMaterials ? (
        <section className="mt-8">
          <h2 className="mb-2 text-xl font-bold">ابزار و مواد لازم</h2>
          <p className="leading-loose text-[var(--color-text-muted)]">{pkg.toolsAndMaterials}</p>
        </section>
      ) : null}

      {pkg.supportScope ? (
        <section className="mt-8">
          <h2 className="mb-2 text-xl font-bold">دامنه پشتیبانی</h2>
          <p className="leading-loose text-[var(--color-text-muted)]">{pkg.supportScope}</p>
        </section>
      ) : null}

      {testimonials.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold">نظرات خریداران</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} item={t as any} />
            ))}
          </div>
        </section>
      ) : null}

      {pkg.faqs?.length ? (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold">پرسش‌های متداول</h2>
          <FaqAccordion items={pkg.faqs} />
        </section>
      ) : null}

      {pkg.cancellationPolicy ? (
        <section className="mt-8">
          <h2 className="mb-2 text-xl font-bold">شرایط انصراف و بازگشت وجه</h2>
          <p className="leading-loose text-[var(--color-text-muted)]">{pkg.cancellationPolicy}</p>
        </section>
      ) : null}
    </div>
  )
}
