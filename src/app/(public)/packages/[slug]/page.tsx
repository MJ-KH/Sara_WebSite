import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { SwatchFan } from '@/components/brand/SwatchFan'
import { PackageCard } from '@/components/packages/PackageCard'
import { FaqAccordion } from '@/components/ui/FaqAccordion'
import { Money } from '@/components/ui/Money'
import { SampleBadge } from '@/components/ui/SampleBadge'
import { TestimonialCard } from '@/components/ui/TestimonialCard'
import { getRequestUser } from '@/lib/auth/get-request-user'
import { paletteForPackage } from '@/lib/brand/swatches'
import { toPersianDigits } from '@/lib/digits'
import { formatDurationFa, splitSampleMarker } from '@/lib/display'
import { getPayloadClient } from '@/lib/get-payload'
import { getSiteSettings } from '@/lib/get-site-settings'
import { formatJalaliDate } from '@/lib/jalali'
import { getPackageStats } from '@/lib/packages/stats'
import { extractIdString } from '@/lib/relation'

type Params = { params: Promise<{ slug: string }> }

const LEVEL_LABELS: Record<string, string> = { beginner: 'مبتدی', intermediate: 'متوسط', advanced: 'پیشرفته' }
const KIND_LABELS: Record<string, string> = { comprehensive: 'پکیج جامع', short: 'آموزش تخصصی کوتاه' }

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

  const related = (pkg.relatedPackages || []).filter(
    (p): p is Exclude<typeof p, string | number> => typeof p === 'object' && p !== null && p.status === 'published',
  )
  const relatedStats = await getPackageStats(
    payload,
    related.map((p) => p.id),
  )

  return { pkg, chapters: chapters.docs, lessons: lessons.docs, testimonials: testimonials.docs, related, relatedStats }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const data = await getData(slug)
  if (!data) return {}
  const seo = data.pkg.seo || {}
  return {
    title: seo.metaTitle || splitSampleMarker(data.pkg.title).text,
    description: seo.metaDescription || splitSampleMarker(data.pkg.subtitle).text || undefined,
  }
}

/** یک بخش از محتوای اصلی صفحه پکیج */
function Block({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="border-t border-[var(--color-border)] py-10 first:border-t-0 first:pt-0 md:py-12">
      <h2 className="title-1 mb-5">{title}</h2>
      {children}
    </section>
  )
}

function Prose({ text }: { text: string }) {
  return <p className="max-w-[40rem] whitespace-pre-line text-[var(--color-text-muted)]">{splitSampleMarker(text).text}</p>
}

export default async function PackageDetailPage({ params }: Params) {
  const { slug } = await params
  const data = await getData(slug)
  if (!data) notFound()
  const { pkg, chapters, lessons, testimonials, related, relatedStats } = data
  const settings = await getSiteSettings()
  const teacher = settings.brand?.nameFa || 'سارا نقی‌زاده'

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

  const title = splitSampleMarker(pkg.title)
  const subtitle = splitSampleMarker(pkg.subtitle)
  const totalSeconds = lessons.reduce((sum, l) => sum + (l.durationSeconds || 0), 0)
  const coverImage = typeof pkg.coverImage === 'object' ? pkg.coverImage : null
  const hasDiscount = Boolean(pkg.compareAtPriceRial && pkg.compareAtPriceRial > pkg.priceRial)
  const freePreviewCount = lessons.filter((l) => l.isFreePreview).length
  const meta = [KIND_LABELS[pkg.kind] ?? null, pkg.level ? `سطح ${LEVEL_LABELS[pkg.level] ?? pkg.level}` : null].filter(Boolean).join('، ')

  const facts: { label: string; value: string }[] = [
    { label: 'تعداد درس', value: lessons.length > 0 ? `${toPersianDigits(lessons.length)} درس در ${toPersianDigits(Math.max(chapters.length, 1))} فصل` : 'به‌زودی' },
    { label: 'مدت آموزش', value: totalSeconds > 0 ? formatDurationFa(totalSeconds) : 'به‌زودی مشخص می‌شود' },
    { label: 'مدت دسترسی', value: pkg.accessDurationDays ? `${toPersianDigits(pkg.accessDurationDays)} روز از زمان خرید` : 'مادام‌العمر' },
    ...(freePreviewCount > 0 ? [{ label: 'نمونه رایگان', value: `${toPersianDigits(freePreviewCount)} درس بدون خرید` }] : []),
    ...(pkg.contentUpdatedAt ? [{ label: 'آخرین به‌روزرسانی', value: formatJalaliDate(new Date(pkg.contentUpdatedAt)) }] : []),
  ]

  const action = hasAccess
    ? { kind: 'continue' as const, href: `/account/my-packages/${pkg.slug}`, label: 'ادامه آموزش' }
    : pkg.status === 'stopped'
      ? { kind: 'stopped' as const, label: 'فروش این پکیج متوقف شده است' }
      : { kind: 'buy' as const, href: `/checkout/${pkg.slug}`, label: 'خرید پکیج' }

  const actionButton = (extra = '') =>
    action.kind === 'stopped' ? (
      <button type="button" disabled className={`btn btn-ghost ${extra}`}>
        {action.label}
      </button>
    ) : (
      <Link href={action.href} className={`btn btn-primary ${extra}`}>
        {action.label}
      </Link>
    )

  const price = (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <Money rial={pkg.priceRial} className="text-[1.75rem] font-extrabold leading-tight" />
      {hasDiscount ? (
        <span className="text-[var(--color-text-muted)] line-through decoration-[var(--color-primary)]">
          <Money rial={pkg.compareAtPriceRial as number} />
        </span>
      ) : null}
    </div>
  )

  return (
    <div className="pb-28 md:pb-0">
      {/* سربرگ پکیج */}
      <header className="border-b border-[var(--color-border)]">
        <div className="container-x grid gap-8 pb-10 pt-6 md:grid-cols-[1.25fr_1fr] md:items-end md:gap-12 md:pb-14 md:pt-10">
          <div>
            <nav aria-label="مسیر" className="mb-6 text-[0.875rem] text-[var(--color-text-muted)]">
              <Link href="/packages" className="hover:text-[var(--color-text)]">
                پکیج‌ها
              </Link>
              <span aria-hidden="true" className="mx-2">
                /
              </span>
              <span aria-current="page">{title.text}</span>
            </nav>
            <div className="mb-4 flex flex-wrap items-center gap-3 text-[0.875rem] font-semibold text-[var(--color-text-muted)]">
              {meta ? <span>{meta}</span> : null}
              {title.isSample ? <SampleBadge /> : null}
            </div>
            <h1 className="display-2">{title.text}</h1>
            <p className="mt-3 text-[1rem]">
              دوره‌ای از <span className="font-bold">{teacher}</span>
            </p>
            {subtitle.text ? <p className="lead mt-4 max-w-[36rem]">{subtitle.text}</p> : null}
          </div>

          {coverImage?.url ? (
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-media)]">
              <Image src={coverImage.url} alt={coverImage.alt || title.text} fill priority sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" />
            </div>
          ) : (
            <div className="pkg-cover rounded-[var(--radius-media)]">
              <SwatchFan id={`detail-${pkg.slug}`} colors={paletteForPackage(pkg)} spread={62} animate />
            </div>
          )}
        </div>
      </header>

      <div className="container-x grid gap-10 pt-10 md:grid-cols-[1fr_20rem] md:gap-14 md:pt-14 lg:grid-cols-[1fr_22rem]">
        {/* ستون محتوا */}
        <div className="min-w-0">
          {/* خلاصه روی موبایل؛ در دسکتاپ همین اطلاعات در کادر کناری است */}
          <dl className="mb-10 grid grid-cols-2 gap-x-6 gap-y-4 rounded-[var(--radius-media)] bg-[var(--color-bg-alt)] p-5 md:hidden">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-[0.8125rem] text-[var(--color-text-muted)]">{fact.label}</dt>
                <dd className="font-bold">{fact.value}</dd>
              </div>
            ))}
          </dl>

          {pkg.description ? (
            <Block title="درباره این پکیج">
              <div className="rich-text max-w-[40rem]">
                <RichText data={pkg.description} />
              </div>
            </Block>
          ) : null}

          {pkg.targetAudience ? (
            <Block title="این پکیج برای چه کسی است">
              <Prose text={pkg.targetAudience} />
            </Block>
          ) : null}

          {pkg.expectedOutcome ? (
            <Block title="بعد از این پکیج">
              <Prose text={pkg.expectedOutcome} />
            </Block>
          ) : null}

          {chapters.length > 0 ? (
            <Block id="curriculum" title="سرفصل‌ها">
              <p className="-mt-2 mb-6 text-[var(--color-text-muted)]">
                {toPersianDigits(chapters.length)} فصل، {toPersianDigits(lessons.length)} درس
                {totalSeconds > 0 ? `، ${formatDurationFa(totalSeconds)}` : ''}
              </p>
              <ol className="flex flex-col gap-8">
                {chapters.map((chapter, chapterIndex) => {
                  const chapterLessons = lessons.filter((l) => extractIdString(l.chapter) === String(chapter.id))
                  return (
                    <li key={chapter.id}>
                      <h3 className="title-2 mb-3">
                        <span className="text-[var(--color-text-muted)]">فصل {toPersianDigits(chapterIndex + 1)}: </span>
                        {splitSampleMarker(chapter.title).text.replace(/^فصل\s+[^:]+:\s*/, '')}
                      </h3>
                      <ol className="border-t border-[var(--color-border)]">
                        {chapterLessons.map((lesson, lessonIndex) => {
                          const lessonTitle = splitSampleMarker(lesson.title).text.replace(/^درس\s+[^:]+:\s*/, '')
                          return (
                            <li key={lesson.id} className="flex min-h-14 items-center gap-4 border-b border-[var(--color-border)] py-3">
                              <span className="w-6 shrink-0 text-[0.875rem] tabular-nums text-[var(--color-text-muted)]" aria-hidden="true">
                                {toPersianDigits(lessonIndex + 1)}
                              </span>
                              <span className="min-w-0 flex-1">{lessonTitle}</span>
                              {lesson.durationSeconds ? (
                                <span className="shrink-0 text-[0.8125rem] text-[var(--color-text-muted)]">{formatDurationFa(lesson.durationSeconds)}</span>
                              ) : null}
                              {lesson.isFreePreview ? (
                                <Link
                                  href={`/packages/${pkg.slug}/preview/${lesson.id}`}
                                  className="shrink-0 rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-[0.8125rem] font-bold text-[var(--color-primary)]"
                                >
                                  تماشای رایگان
                                </Link>
                              ) : null}
                            </li>
                          )
                        })}
                      </ol>
                    </li>
                  )
                })}
              </ol>
            </Block>
          ) : null}

          {pkg.toolsAndMaterials ? (
            <Block title="ابزار و مواد لازم">
              <Prose text={pkg.toolsAndMaterials} />
            </Block>
          ) : null}

          {pkg.supportScope ? (
            <Block title="پشتیبانی">
              <Prose text={pkg.supportScope} />
            </Block>
          ) : null}

          {testimonials.length > 0 ? (
            <Block title="نظر خریداران">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {testimonials.map((t) => (
                  <TestimonialCard key={t.id} item={t as never} />
                ))}
              </div>
            </Block>
          ) : null}

          {pkg.faqs?.length ? (
            <Block title="پرسش‌های متداول">
              <FaqAccordion items={pkg.faqs} />
            </Block>
          ) : null}

          {pkg.cancellationPolicy ? (
            <Block id="refund" title="شرایط انصراف و بازگشت وجه">
              <Prose text={pkg.cancellationPolicy} />
            </Block>
          ) : null}
        </div>

        {/* کادر خرید چسبان — فقط دسکتاپ */}
        <aside className="hidden md:block">
          <div className="sticky top-28 rounded-[var(--radius-media)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            {price}
            {actionButton('btn-lg btn-block mt-5')}
            {pkg.cancellationPolicy && action.kind === 'buy' ? (
              <a href="#refund" className="mt-3 block text-center text-[0.8125rem] text-[var(--color-text-muted)] underline-offset-4 hover:underline">
                شرایط بازگشت وجه
              </a>
            ) : null}
            <dl className="mt-6 flex flex-col border-t border-[var(--color-border)]">
              {facts.map((fact) => (
                <div key={fact.label} className="flex items-baseline justify-between gap-4 border-b border-[var(--color-border)] py-3 text-[0.9375rem]">
                  <dt className="text-[var(--color-text-muted)]">{fact.label}</dt>
                  <dd className="text-start font-bold">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="section band-alt mt-14">
          <div className="container-x">
            <h2 className="display-2 mb-8">پکیج‌های مرتبط</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <PackageCard key={item.id} pkg={item as never} stats={relatedStats.get(String(item.id))} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* نوار خرید ثابت پایین صفحه — فقط موبایل */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <Money rial={pkg.priceRial} className="block text-[1.125rem] font-extrabold leading-tight" />
            {hasDiscount ? (
              <span className="text-[0.8125rem] text-[var(--color-text-muted)] line-through">
                <Money rial={pkg.compareAtPriceRial as number} />
              </span>
            ) : null}
          </div>
          {actionButton('shrink-0')}
        </div>
      </div>
    </div>
  )
}
