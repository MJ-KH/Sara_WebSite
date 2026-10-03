import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { SwatchFan } from '@/components/brand/SwatchFan'
import { JsonLd } from '@/components/seo/JsonLd'
import { PackageCard } from '@/components/packages/PackageCard'
import { FaqAccordion } from '@/components/ui/FaqAccordion'
import { Money } from '@/components/ui/Money'
import { SampleBadge } from '@/components/ui/SampleBadge'
import { TestimonialCard } from '@/components/ui/TestimonialCard'
import { getRequestUser } from '@/lib/auth/get-request-user'
import { paletteForPackage } from '@/lib/brand/swatches'
import { toPersianDigits } from '@/lib/digits'
import { splitSampleMarker } from '@/lib/display'
import { getPayloadClient } from '@/lib/get-payload'
import { getSiteSettings } from '@/lib/get-site-settings'
import { formatJalaliDate } from '@/lib/jalali'
import { getPackageStats } from '@/lib/packages/stats'
import { hasActivePackageAccess, includedPackageIds, spotplayerCourseIdsFor } from '@/lib/packages/access'
import { buildBreadcrumb, entityIds } from '@/lib/seo/entities'
import { buildSeoMetadata, siteUrl } from '@/lib/seo/metadata'
import { extractIdString } from '@/lib/relation'

type Params = { params: Promise<{ slug: string }> }

const LEVEL_LABELS: Record<string, string> = { beginner: 'مبتدی', intermediate: 'متوسط', advanced: 'پیشرفته' }
const KIND_LABELS: Record<string, string> = { comprehensive: 'دوره جامع', short: 'آموزش تخصصی کوتاه' }

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

  // پکیج چنددوره‌ای: دوره‌های داخلش؛ دوره معمولی: پکیج‌هایی که این دوره را با تخفیف دارند
  const includedIds = includedPackageIds(pkg)
  const included = includedIds.length
    ? (await payload.find({ collection: 'packages', where: { id: { in: includedIds }, status: { equals: 'published' } }, depth: 1, limit: 20 })).docs.sort(
        (a, b) => includedIds.indexOf(a.id) - includedIds.indexOf(b.id),
      )
    : []
  const bundles =
    pkg.kind === 'bundle'
      ? []
      : (
          await payload.find({
            collection: 'packages',
            where: { and: [{ kind: { equals: 'bundle' } }, { status: { equals: 'published' } }, { includedPackages: { contains: pkg.id } }] },
            depth: 1,
            limit: 3,
          })
        ).docs
  const includedStats = await getPackageStats(
    payload,
    included.map((p) => p.id),
  )
  const spotplayerCourseIds = await spotplayerCourseIdsFor(payload, pkg)

  return {
    pkg,
    chapters: chapters.docs,
    lessons: lessons.docs,
    testimonials: testimonials.docs,
    related,
    relatedStats,
    included,
    includedStats,
    bundles,
    usesSpotPlayer: spotplayerCourseIds.length > 0,
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const data = await getData(slug)
  if (!data) return {}
  const seo = data.pkg.seo || {}
  const cover = typeof data.pkg.coverImage === 'object' ? data.pkg.coverImage?.url : null
  return buildSeoMetadata({
    title: seo.metaTitle || splitSampleMarker(data.pkg.title).text,
    description: seo.metaDescription || splitSampleMarker(data.pkg.subtitle).text,
    path: `/packages/${data.pkg.slug}`,
    image: (typeof seo.ogImage === 'object' ? seo.ogImage?.url : null) || cover,
  })
}

/** یک بخش از محتوای اصلی صفحه دوره */
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

/** متن چندخطی پنل (هر مورد در یک خط) → فهرست */
function toLines(text: string | null | undefined): string[] {
  return (text || '')
    .split('\n')
    .map((line) => splitSampleMarker(line.replace(/^[-•*\s]+/, '')).text.trim())
    .filter(Boolean)
}

function CheckMark({ muted = false }: { muted?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false" className="mt-1 shrink-0">
      <circle cx="10" cy="10" r="9" fill={muted ? 'var(--color-bg-alt)' : 'var(--color-accent-soft)'} />
      {muted ? (
        <path d="M7 7l6 6M13 7l-6 6" stroke="var(--color-text-muted)" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <path d="M6 10.5l2.6 2.6L14 7.5" fill="none" stroke="var(--color-primary)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}

/** کارت فهرست دوستونه (قبل/بعد، مناسب/نامناسب) */
function LineList({ title, lines, tone }: { title: string; lines: string[]; tone: 'accent' | 'muted' }) {
  if (lines.length === 0) return null
  return (
    <div className={`rounded-[var(--radius-media)] p-5 ${tone === 'accent' ? 'card-soft' : 'bg-[var(--color-bg-alt)]'}`}>
      <h3 className={`mb-3 font-bold ${tone === 'accent' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>{title}</h3>
      <ul className="flex flex-col gap-2.5">
        {lines.map((line) => (
          <li key={line} className="flex gap-3">
            <CheckMark muted={tone === 'muted'} />
            <span className={tone === 'muted' ? 'text-[var(--color-text-muted)]' : ''}>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function PackageDetailPage({ params }: Params) {
  const { slug } = await params
  const data = await getData(slug)
  if (!data) notFound()
  const { pkg, chapters, lessons, testimonials, related, relatedStats, included, includedStats, bundles, usesSpotPlayer } = data
  const isBundle = pkg.kind === 'bundle'
  const settings = await getSiteSettings()
  const teacher = settings.brand?.nameFa || 'سارا نقی‌زاده'

  const user = await getRequestUser()
  let hasAccess = false
  if (user?.collection === 'students') {
    const payload = await getPayloadClient()
    // دسترسی مستقیم یا از راه پکیج چنددوره‌ای
    hasAccess = await hasActivePackageAccess(payload, user.id, pkg.id)
  }

  const title = splitSampleMarker(pkg.title)
  const subtitle = splitSampleMarker(pkg.subtitle)
  const coverImage = typeof pkg.coverImage === 'object' ? pkg.coverImage : null
  const hasDiscount = Boolean(pkg.compareAtPriceRial && pkg.compareAtPriceRial > pkg.priceRial)
  const freePreviewCount = lessons.filter((l) => l.isFreePreview).length
  const skillBefore = toLines(pkg.skillShift?.before)
  const skillAfter = toLines(pkg.skillShift?.after)
  const promoVideo = typeof pkg.promoVideo === 'object' && pkg.promoVideo?.url ? pkg.promoVideo : null
  const projects = pkg.projects || []
  const benefits = pkg.benefits || []
  const meta = isBundle
    ? `پکیج ${toPersianDigits(included.length)} دوره`
    : [KIND_LABELS[pkg.kind] ?? null, pkg.level ? `سطح ${LEVEL_LABELS[pkg.level] ?? pkg.level}` : null].filter(Boolean).join('، ')

  const facts: { label: string; value: string }[] = [
    isBundle
      ? { label: 'دوره‌ها', value: `${toPersianDigits(included.length)} دوره کامل` }
      : { label: 'تعداد درس', value: lessons.length > 0 ? `${toPersianDigits(lessons.length)} درس در ${toPersianDigits(Math.max(chapters.length, 1))} فصل` : 'به‌زودی' },
    { label: 'مدت دسترسی', value: pkg.accessDurationDays ? `${toPersianDigits(pkg.accessDurationDays)} روز از زمان خرید` : 'مادام‌العمر' },
    ...(usesSpotPlayer ? [{ label: 'محل تماشا', value: isBundle ? 'اسپات‌پلیر؛ هر دو دوره با یک لایسنس' : 'نرم‌افزار اسپات‌پلیر' }] : []),
    ...(freePreviewCount > 0 ? [{ label: 'نمونه رایگان', value: `${toPersianDigits(freePreviewCount)} درس بدون خرید` }] : []),
    ...(pkg.contentUpdatedAt ? [{ label: 'آخرین به‌روزرسانی', value: formatJalaliDate(new Date(pkg.contentUpdatedAt)) }] : []),
  ]

  const action = hasAccess
    ? usesSpotPlayer
      ? { kind: 'continue' as const, href: '/account/my-packages', label: 'مشاهده کد لایسنس' }
      : { kind: 'continue' as const, href: `/account/my-packages/${pkg.slug}`, label: 'ادامه آموزش' }
    : pkg.status === 'stopped'
      ? { kind: 'stopped' as const, label: 'فروش این دوره متوقف شده است' }
      : { kind: 'buy' as const, href: `/checkout/${pkg.slug}`, label: isBundle ? 'خرید پکیج' : 'خرید دوره' }

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

  const url = siteUrl()
  const pageUrl = `${url}/packages/${pkg.slug}`
  const coverUrl = typeof pkg.coverImage === 'object' && pkg.coverImage?.url ? new URL(pkg.coverImage.url, url).toString() : undefined
  // فقط پرسش‌های واقعی؛ پرسش‌های علامت‌خورده «[نمونه]» به موتور جست‌وجو داده نمی‌شوند
  const realFaqs = (pkg.faqs || []).filter((faq) => !splitSampleMarker(faq.question).isSample && !splitSampleMarker(faq.answer).isSample)

  return (
    <div className="pb-28 md:pb-0">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: title.text,
          description: subtitle.text || title.text,
          url: pageUrl,
          inLanguage: 'fa',
          ...(!isBundle && pkg.level ? { educationalLevel: LEVEL_LABELS[pkg.level] ?? pkg.level } : {}),
          // پکیج چنددوره‌ای: دوره‌های داخلش، هر کدام با صفحه خودش
          ...(isBundle && included.length > 0
            ? {
                hasPart: included.map((item) => ({
                  '@type': 'Course',
                  name: splitSampleMarker(item.title).text,
                  url: `${url}/packages/${item.slug}`,
                  provider: { '@id': entityIds(url).academy },
                })),
              }
            : {}),
          ...(coverUrl ? { image: coverUrl } : {}),
          provider: { '@id': entityIds(url).academy },
          // مدرس دوره: سارا (همان موجودیت Person گراف سایت)
          instructor: { '@id': entityIds(url).person },
          hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', instructor: { '@id': entityIds(url).person } },
          offers: {
            '@type': 'Offer',
            // مبلغ در دیتابیس ریال است و همان با واحد IRR گزارش می‌شود
            price: pkg.priceRial,
            priceCurrency: 'IRR',
            availability: pkg.status === 'published' ? 'https://schema.org/InStock' : 'https://schema.org/Discontinued',
            url: pageUrl,
          },
        }}
      />
      <JsonLd data={buildBreadcrumb([['دوره‌ها', '/packages'], [title.text, `/packages/${pkg.slug}`]])} />
      {realFaqs.length > 0 ? (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: realFaqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
          }}
        />
      ) : null}
      {/* سربرگ دوره */}
      <header className="border-b border-[var(--color-border)]">
        <div className="container-x grid gap-8 pb-10 pt-6 md:grid-cols-[1.25fr_1fr] md:items-end md:gap-12 md:pb-14 md:pt-10">
          <div>
            <nav aria-label="مسیر" className="mb-6 text-[0.875rem] text-[var(--color-text-muted)]">
              <Link href="/packages" className="hover:text-[var(--color-text)]">
                دوره‌ها
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
              {isBundle ? 'دوره‌هایی از ' : 'دوره‌ای از '}
              <span className="font-bold">{teacher}</span>
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

          {/* پکیج چنددوره‌ای: دوره‌های داخلش، هر کدام با لینک به صفحه کاملش */}
          {isBundle && included.length > 0 ? (
            <Block title="دوره‌های این پکیج">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {included.map((item) => (
                  <PackageCard key={item.id} pkg={item as never} stats={includedStats.get(String(item.id))} />
                ))}
              </div>
            </Block>
          ) : null}

          {/* دوره معمولی که در پکیج تخفیف‌دار هم هست */}
          {!hasAccess && bundles.length > 0
            ? bundles.map((bundle) => {
                const others = (bundle.includedPackages || [])
                  .filter((p): p is Exclude<typeof p, string | number> => typeof p === 'object' && p !== null && p.id !== pkg.id)
                  .map((p) => `«${splitSampleMarker(p.title).text}»`)
                return (
                  <aside key={bundle.id} className="card-soft mb-10 flex flex-col gap-3 border-[var(--gold-soft)] p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[0.8125rem] font-semibold text-[var(--color-primary)]">پیشنهاد پکیج</p>
                      <p className="mt-1 leading-8">
                        این دوره را همراه {others.join(' و ')} با هم بگیرید:{' '}
                        <Money rial={bundle.priceRial} className="font-semibold" /> برای هر دو دوره.
                      </p>
                    </div>
                    <Link
                      href={`/packages/${bundle.slug}`}
                      className="flex min-h-11 shrink-0 items-center justify-center rounded-full border border-[var(--ink-900)] px-5 text-[0.875rem] font-medium transition-colors hover:bg-[var(--ink-900)] hover:text-[#f4ecee]"
                    >
                      مشاهده پکیج
                    </Link>
                  </aside>
                )
              })
            : null}

          {pkg.problem ? (
            <Block title="مشکلی که حل می‌کند">
              <Prose text={pkg.problem} />
            </Block>
          ) : null}

          {pkg.description || pkg.expectedOutcome ? (
            <Block title={isBundle ? 'این پکیج چه چیزی یاد می‌دهد' : 'این دوره چه چیزی یاد می‌دهد'}>
              {pkg.description ? (
                <div className="rich-text max-w-[40rem]">
                  <RichText data={pkg.description} />
                </div>
              ) : null}
              {pkg.expectedOutcome ? (
                <div className={pkg.description ? 'mt-5' : ''}>
                  <Prose text={pkg.expectedOutcome} />
                </div>
              ) : null}
            </Block>
          ) : null}

          {skillBefore.length > 0 || skillAfter.length > 0 ? (
            <Block title="مهارت شما، قبل و بعد از دوره">
              <div className="grid gap-4 sm:grid-cols-2">
                <LineList title="قبل" lines={skillBefore} tone="muted" />
                <LineList title="بعد" lines={skillAfter} tone="accent" />
              </div>
            </Block>
          ) : null}

          {chapters.length > 0 ? (
            <Block id="curriculum" title="سرفصل‌ها">
              <p className="-mt-2 mb-6 text-[var(--color-text-muted)]">
                {toPersianDigits(chapters.length)} فصل، {toPersianDigits(lessons.length)} درس
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
                              {lesson.isFreePreview ? (
                                <Link
                                  href={`/packages/${pkg.slug}/preview/${lesson.id}`}
                                  className="shrink-0 rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-[0.8125rem] font-bold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white"
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

          {promoVideo?.url || freePreviewCount > 0 ? (
            <Block id="sample" title="نمونه ویدئو">
              {promoVideo?.url ? (
                <video
                  controls
                  preload="none"
                  playsInline
                  className="w-full rounded-[var(--radius-media)] bg-[var(--color-bg-alt)]"
                  src={promoVideo.url}
                  aria-label={promoVideo.alt || `ویدئوی معرفی ${title.text}`}
                >
                  <track kind="captions" />
                </video>
              ) : null}
              {freePreviewCount > 0 ? (
                <p className={`text-[var(--color-text-muted)] ${promoVideo?.url ? 'mt-4' : ''}`}>
                  {toPersianDigits(freePreviewCount)} درس از این دوره بدون خرید قابل تماشاست؛ در{' '}
                  <a href="#curriculum" className="font-bold text-[var(--color-primary)] underline-offset-4 hover:underline">
                    سرفصل‌ها
                  </a>{' '}
                  گزینه «تماشای رایگان» را بزنید.
                </p>
              ) : null}
            </Block>
          ) : null}

          {projects.length > 0 ? (
            <Block title="پروژه‌های عملی">
              <ul className="grid gap-4 sm:grid-cols-2">
                {projects.map((project, index) => {
                  const image = typeof project.image === 'object' && project.image?.url ? project.image : null
                  return (
                    <li key={project.id || index} className="card-soft overflow-hidden">
                      {image ? (
                        <div className="relative aspect-[4/3]">
                          <Image src={image.url as string} alt={image.alt || project.title} fill sizes="(max-width: 640px) 100vw, 20rem" className="object-cover" />
                        </div>
                      ) : null}
                      <div className="p-5">
                        <h3 className="font-bold">{splitSampleMarker(project.title).text}</h3>
                        {project.description ? (
                          <p className="mt-1 text-[0.9375rem] text-[var(--color-text-muted)]">{splitSampleMarker(project.description).text}</p>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </Block>
          ) : null}

          {pkg.targetAudience || pkg.notFor ? (
            <Block title="این دوره مناسب شماست؟">
              <div className="grid gap-4 sm:grid-cols-2">
                {pkg.targetAudience ? <LineList title="مناسب است برای" lines={toLines(pkg.targetAudience)} tone="accent" /> : null}
                {pkg.notFor ? <LineList title="مناسب نیست برای" lines={toLines(pkg.notFor)} tone="muted" /> : null}
              </div>
            </Block>
          ) : null}

          {benefits.length > 0 ? (
            <Block title="مزایای دوره">
              <ul className="grid gap-3 sm:grid-cols-2">
                {benefits.map((benefit, index) => (
                  <li key={benefit.id || index} className="flex gap-3">
                    <CheckMark />
                    <span>{splitSampleMarker(benefit.text).text}</span>
                  </li>
                ))}
              </ul>
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

          {pkg.certificate?.issued ? (
            <Block title="مدرک">
              <Prose text={pkg.certificate.description || 'برای این دوره مدرک صادر می‌شود.'} />
            </Block>
          ) : null}

          {pkg.paymentTerms ? (
            <Block id="payment" title="شرایط پرداخت">
              <Prose text={pkg.paymentTerms} />
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

          {/* دعوت پایانی به خرید، بعد از خواندن همه جزئیات */}
          <section className="card-soft mt-4 p-6 text-center md:p-10">
            <p className="title-1">{title.text}</p>
            <div className="mt-4 flex justify-center">{price}</div>
            <div className="mt-6 flex justify-center">{actionButton('btn-lg')}</div>
          </section>
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
            <h2 className="display-2 mb-8">دوره‌های مرتبط</h2>
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
