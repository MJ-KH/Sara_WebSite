import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { Ornament } from '@/components/brand/Ornament'
import { SwatchFan } from '@/components/brand/SwatchFan'
import { ConsultationForm } from '@/components/forms/ConsultationForm'
import { FreeLessonCard } from '@/components/free-lessons/FreeLessonCard'
import { PackageCard } from '@/components/packages/PackageCard'
import { PriceWithDiscount } from '@/components/packages/PriceWithDiscount'
import { FaqAccordion } from '@/components/ui/FaqAccordion'
import { SampleBadge } from '@/components/ui/SampleBadge'
import { TestimonialCard } from '@/components/ui/TestimonialCard'
import { WorkshopSessionCard } from '@/components/workshops/WorkshopSessionCard'
import { HERO_PALETTE } from '@/lib/brand/swatches'
import { phoneForDisplay, splitSampleMarker, whatsappLink } from '@/lib/display'
import { getPayloadClient } from '@/lib/get-payload'
import { getSiteSettings } from '@/lib/get-site-settings'
import { getPackageStats } from '@/lib/packages/stats'

/** ساختار بلوک از Payload می‌آید و شکل آن به نوع بلوک بستگی دارد؛ نوع دقیق در payload-types.ts تولید‌شده موجود است. */
type AnyBlock = Record<string, any>

/** اطلاعاتی از کل صفحه/سایت که یک بلوک ممکن است لازم داشته باشد (مثلاً لینک به فرم مشاوره همان صفحه). */
type PageContext = {
  hasConsultationForm: boolean
  instagramServices?: string | null
  instagramAcademy?: string | null
  phone?: string | null
  whatsapp?: string | null
  hasWorkshopList: boolean
  hasUpcomingWorkshop: boolean
}

const CONSULTATION_ANCHOR = 'consultation'

/** قاب یکسان همه بخش‌ها: فاصله عمودی و عرض از توکن‌های سیستم طراحی، نه عدد دلخواه. */
function Section({
  heading,
  children,
  tone = 'plain',
  width = 'default',
  id,
  variant = 'default',
}: {
  heading?: string | null
  children: ReactNode
  tone?: 'plain' | 'alt'
  width?: 'default' | 'narrow'
  id?: string
  /** text: بخش متنی جمع‌وجور (فاصله کمتر، تیتر نزدیک‌تر به متن؛ چند بخش متنی پشت هم به هم نزدیک می‌شوند) */
  variant?: 'default' | 'text'
}) {
  const title = splitSampleMarker(heading)
  return (
    <section id={id} className={`${variant === 'text' ? 'section-text' : 'section'}${tone === 'alt' ? ' band-alt' : ''}`}>
      <div className={width === 'narrow' ? 'container-narrow' : 'container-x'}>
        {title.text ? (
          <div className={`text-center ${variant === 'text' ? 'mb-5 md:mb-6' : 'mb-8 md:mb-10'}`}>
            {title.isSample ? (
              <div className="mb-3 flex justify-center">
                <SampleBadge />
              </div>
            ) : null}
            <h2 className={variant === 'text' ? 'title-1' : 'display-2'}>{title.text}</h2>
          </div>
        ) : null}
        {children}
      </div>
    </section>
  )
}

async function PackageListBlockView({ block }: { block: AnyBlock }) {
  const payload = await getPayloadClient()
  let docs: AnyBlock[] = []
  if (block.mode === 'manual' && block.manualPackages?.length) {
    const ids = block.manualPackages.map((p: AnyBlock) => (typeof p === 'string' ? p : p.id))
    const result = await payload.find({ collection: 'packages', where: { id: { in: ids } }, limit: 24, depth: 1 })
    docs = result.docs
  } else {
    const result = await payload.find({
      collection: 'packages',
      where: { status: { equals: 'published' } },
      sort: block.mode === 'latest' ? '-createdAt' : ['-featured', 'featuredOrder'],
      limit: block.limit || 6,
      depth: 1,
    })
    docs = result.docs
  }
  if (docs.length === 0) return null
  const stats = await getPackageStats(
    payload,
    docs.map((d) => d.id),
  )
  return (
    <Section heading={block.heading}>
      <div className="card-grid">
        {docs.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg as never} stats={stats.get(String(pkg.id))} />
        ))}
      </div>
    </Section>
  )
}

async function WorkshopListBlockView({ block }: { block: AnyBlock }) {
  const payload = await getPayloadClient()
  let docs: AnyBlock[] = []
  if (block.mode === 'manual' && block.manualSessions?.length) {
    const ids = block.manualSessions.map((s: AnyBlock) => (typeof s === 'string' ? s : s.id))
    const result = await payload.find({ collection: 'workshop-sessions', where: { id: { in: ids } }, depth: 1 })
    docs = result.docs
  } else {
    const result = await payload.find({
      collection: 'workshop-sessions',
      where: { status: { equals: 'published' }, startAt: { greater_than: new Date().toISOString() } },
      sort: 'startAt',
      limit: block.limit || 3,
      depth: 1,
    })
    docs = result.docs
  }
  if (docs.length === 0) return null
  return (
    <Section heading={block.heading} tone="alt">
      <div className="card-grid" style={{ '--card-min': '19rem' } as CSSProperties}>
        {docs.map((session) => (
          <WorkshopSessionCard key={session.id} session={session as never} />
        ))}
      </div>
    </Section>
  )
}

async function FreeLessonListBlockView({ block }: { block: AnyBlock }) {
  const payload = await getPayloadClient()
  let docs: AnyBlock[] = []
  if (block.mode === 'manual' && block.manualItems?.length) {
    const ids = block.manualItems.map((i: AnyBlock) => (typeof i === 'string' ? i : i.id))
    const result = await payload.find({ collection: 'free-lessons', where: { id: { in: ids } }, depth: 1 })
    docs = result.docs
  } else {
    const where: AnyBlock = { status: { equals: 'published' } }
    if (block.mode === 'category' && block.category) {
      where.category = { equals: typeof block.category === 'string' ? block.category : block.category.id }
    }
    const result = await payload.find({
      collection: 'free-lessons',
      where,
      sort: '-createdAt',
      limit: block.limit || 4,
      depth: 1,
    })
    docs = result.docs
  }
  if (docs.length === 0) return null
  return (
    <Section heading={block.heading}>
      <div className="card-grid" style={{ '--card-min': '15rem', '--card-max': '19rem' } as CSSProperties}>
        {docs.map((item) => (
          <FreeLessonCard key={item.id} item={item as never} />
        ))}
      </div>
    </Section>
  )
}

async function TestimonialsBlockView({ block }: { block: AnyBlock }) {
  const payload = await getPayloadClient()
  let docs: AnyBlock[] = []
  if (block.mode === 'manual' && block.manualItems?.length) {
    const ids = block.manualItems.map((i: AnyBlock) => (typeof i === 'string' ? i : i.id))
    const result = await payload.find({ collection: 'testimonials', where: { id: { in: ids } }, depth: 1 })
    docs = result.docs
  } else {
    const result = await payload.find({
      collection: 'testimonials',
      where: { approved: { equals: true } },
      limit: block.limit || 6,
      depth: 1,
    })
    docs = result.docs
  }
  if (docs.length === 0) return null
  return (
    <Section heading={block.heading} tone="alt">
      <div className="card-grid" style={{ '--card-min': '19rem' } as CSSProperties}>
        {docs.map((item) => (
          <TestimonialCard key={item.id} item={item as never} />
        ))}
      </div>
    </Section>
  )
}

type ArchImage = { url?: string | null; alt?: string | null } | null

/**
 * قاب طاقی به سبک مرجع Gloss Bar: سه قاب هم‌اندازه، بلند و باریک (حدود ۱ به ۲)، بالا کاملاً
 * گرد و گوشه‌های پایین کمی گرد، بدون حاشیه سفید و سایه. عکس کل قاب را پر می‌کند.
 * بدون عکس، فقط قاب وسط بادبزن تیپ رنگ دارد.
 */
function Arch({ image, position }: { image: ArchImage; position: 0 | 1 | 2 }) {
  const center = position === 1
  return (
    <figure className="arch-shape arch-stitch relative aspect-[1/2] overflow-hidden bg-[var(--color-bg-alt)]">
      {image?.url ? (
        <Image
          src={image.url}
          alt={image.alt || ''}
          fill
          priority={center}
          sizes="(max-width: 768px) 32vw, 13rem"
          // صورت/ناخن زیر قوس طاق بیفتد، نه بریده شود
          className="object-cover object-[50%_25%]"
        />
      ) : center ? (
        <div className="absolute inset-x-[4%] bottom-[-4%]">
          <SwatchFan id="hero-arch" colors={HERO_PALETTE} spread={80} animate />
        </div>
      ) : null}
    </figure>
  )
}

/**
 * بالای صفحه به سبک مرجع Gloss Bar: سه قاب طاقی کنار هم (وسطی بزرگ‌تر) و زیرش عنوان
 * وسط‌چین با تیتر درشت و جداکننده تزئینی.
 */
function HeroBlockView({ block, ctx }: { block: AnyBlock; ctx: PageContext }) {
  const heading = splitSampleMarker(block.heading)
  const subheading = splitSampleMarker(block.subheading)
  const archImages: ArchImage[] = (block.archImages || []).filter((img: AnyBlock) => typeof img === 'object' && img?.url)
  const slots: ArchImage[] =
    archImages.length > 0
      ? [archImages[0] ?? null, archImages[1] ?? archImages[0] ?? null, archImages[2] ?? null]
      : [null, block.image?.url ? block.image : null, null]
  return (
    <section className="hero-atelier overflow-hidden">
      {/* عرض محدود تا در دسکتاپ هم تیتر در همان صفحه اول دیده شود */}
      <div className="container-x grid max-w-[44rem] grid-cols-3 gap-3 pt-8 md:gap-4 md:pt-12">
        <Arch image={slots[0] ?? null} position={0} />
        <Arch image={slots[1] ?? null} position={1} />
        <Arch image={slots[2] ?? null} position={2} />
      </div>
      <div className="container-narrow pb-14 pt-9 text-center md:pb-24 md:pt-14">
        {heading.isSample ? (
          <div className="mb-4 flex justify-center">
            <SampleBadge />
          </div>
        ) : null}
        <h1 className="display-1">{heading.text}</h1>
        <Ornament className="mt-5 md:mt-7" />
        {subheading.text ? <p className="lead mx-auto mt-5 max-w-[34rem]">{subheading.text}</p> : null}
        <div className="hero-actions mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:mt-10">
          {block.ctaLabel && block.ctaHref ? (
            /^https?:\/\//.test(block.ctaHref) ? (
              <a href={block.ctaHref} target="_blank" rel="noreferrer" className="btn btn-primary btn-lg">
                {block.ctaLabel}
              </a>
            ) : (
              <Link href={block.ctaHref} className="btn btn-primary btn-lg">
                {block.ctaLabel}
              </Link>
            )
          ) : null}
          {/* دکمه دوم: اگر ورکشاپ پیش رو هست ثبت‌نام آن، وگرنه مشاوره (فقط اگر همین صفحه فرم مشاوره دارد) */}
          {ctx.hasWorkshopList && ctx.hasUpcomingWorkshop ? (
            <Link href="/workshops" className="btn btn-link">
              ثبت‌نام ورکشاپ
            </Link>
          ) : ctx.hasConsultationForm ? (
            <Link href={`#${CONSULTATION_ANCHOR}`} className="btn btn-link">
              مشاوره انتخاب دوره
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function StartGuideBlockView({ block }: { block: AnyBlock }) {
  const paths: AnyBlock[] = block.paths || []
  if (paths.length === 0) return null
  const intro = splitSampleMarker(block.intro)
  return (
    <Section heading={block.heading || 'از کجا شروع کنم؟'}>
      {intro.text ? <p className="lead mx-auto -mt-4 mb-12 max-w-[36rem] text-center">{intro.text}</p> : null}
      {/* مسیرها کنار هم با خط مویی طلایی بینشان؛ بدون کارت، تا فقط متن و انتخاب دیده شود */}
      <div className={`grid grid-cols-1 gap-12 ${paths.length > 1 ? 'md:grid-cols-2 md:gap-0' : ''} ${paths.length > 2 ? 'lg:grid-cols-3' : ''}`}>
        {paths.map((path, index) => {
          const audience = splitSampleMarker(path.audience)
          const description = splitSampleMarker(path.description)
          const packages: AnyBlock[] = (path.recommendedPackages || []).filter((p: AnyBlock) => typeof p === 'object' && p?.status !== 'draft')
          return (
            <div
              key={path.id || index}
              className={`flex flex-col text-center md:px-10 lg:px-14 ${index > 0 ? 'border-t border-[var(--gold-soft)] pt-12 md:border-s md:border-t-0 md:pt-0' : ''}`}
            >
              {audience.isSample || description.isSample ? (
                <div className="mb-3 flex justify-center">
                  <SampleBadge />
                </div>
              ) : null}
              <h3 className="title-1">{audience.text}</h3>
              <p className="mx-auto mt-3 max-w-[30rem] leading-[2] text-[var(--color-text-muted)]">{description.text}</p>

              {packages.length > 0 ? (
                <ul className="mx-auto mt-7 flex w-full max-w-[24rem] flex-col gap-6">
                  {packages.map((pkg) => (
                    <li key={pkg.id}>
                      {/* کل ردیف لینک است؛ دکمه فقط ظاهر دکمه دارد تا لینک تودرتو ساخته نشود (مثل کارت دوره) */}
                      <Link href={`/packages/${pkg.slug}`} className="group flex flex-col items-center gap-3 border-t border-[var(--gold-soft)] pt-5">
                        <span className="text-[1.0625rem] font-medium">{splitSampleMarker(pkg.title).text}</span>
                        <PriceWithDiscount priceRial={pkg.priceRial} compareAtPriceRial={pkg.compareAtPriceRial} />
                        <span className="flex min-h-11 w-full items-center justify-center rounded-[var(--radius-btn)] bg-[var(--ink-900)] text-[0.9375rem] font-medium text-[#f4ecee] transition-colors group-hover:bg-[var(--color-primary)]">
                          مشاهده دوره
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}

              {path.linkLabel && path.linkHref ? (
                <Link href={path.linkHref} className="btn btn-link mx-auto mt-6">
                  {path.linkLabel}
                </Link>
              ) : null}
            </div>
          )
        })}
      </div>
    </Section>
  )
}

/**
 * معرفی و روش آموزش. در دسکتاپ دوستونه است (متن یک طرف، موارد روش آموزش به‌صورت فهرست
 * شماره‌دار طرف دیگر) تا ریتم صفحه از پشت‌سرهم بودن بخش‌های وسط‌چین بیرون بیاید.
 * اگر عکس سارا بارگذاری شده باشد، در قاب طاقی بالای متن.
 */
function AboutIntroBlockView({ block }: { block: AnyBlock }) {
  const heading = splitSampleMarker(block.heading)
  const body = splitSampleMarker(block.body)
  const points: AnyBlock[] = block.points || []
  const photo = block.photo && typeof block.photo === 'object' && block.photo.url ? block.photo : null
  const isSample = heading.isSample || body.isSample || points.some((p) => splitSampleMarker(p.title).isSample)
  const twoColumns = points.length > 0
  return (
    <section className="section">
      <div className={twoColumns ? 'container-x grid items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-14 lg:gap-20' : 'container-narrow'}>
        <div className={`text-center ${twoColumns ? 'md:text-start' : ''}`}>
          {photo ? (
            <div className={`mx-auto mb-10 w-[56%] max-w-[15rem] ${twoColumns ? 'md:mx-0' : ''}`}>
              {/* همان قاب طاقی سربرگ؛ نسبت ۲ به ۳ پس شعاع عمودی = نصف عرض ÷ ارتفاع = ۳۳٪ */}
              <div className="arch-shape arch-stitch relative aspect-[2/3] overflow-hidden [--arch-ry:33.333%]">
                <Image src={photo.url} alt={photo.alt || heading.text} fill sizes="16rem" className="object-cover" />
              </div>
            </div>
          ) : null}
          {isSample ? (
            <div className={`mb-4 flex justify-center ${twoColumns ? 'md:justify-start' : ''}`}>
              <SampleBadge />
            </div>
          ) : null}
          <h2 className="display-2">{heading.text}</h2>
          <p className={`lead mx-auto mt-5 max-w-[38rem] whitespace-pre-line ${twoColumns ? 'md:mx-0' : ''}`}>{body.text}</p>
          <Ornament className={`mt-7 ${twoColumns ? 'md:justify-start' : ''}`} />
          {block.linkLabel && block.linkHref ? (
            <Link href={block.linkHref} className="btn btn-link mt-8">
              {block.linkLabel}
            </Link>
          ) : null}
        </div>

        {twoColumns ? (
          // اصول روش آموزش ترتیب ندارند؛ پس بدون شماره، فقط با خط مویی طلایی از هم جدا می‌شوند
          <ul className="border-t border-[var(--gold-soft)]">
            {points.map((point, index) => (
              <li key={point.id || index} className="border-b border-[var(--gold-soft)] py-7">
                <h3 className="text-[1.25rem] font-normal leading-[1.6]">{splitSampleMarker(point.title).text}</h3>
                <p className="mt-2 text-[0.9375rem] leading-[1.95] text-[var(--color-text-muted)]">{splitSampleMarker(point.text).text}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}

function TextBlockView({ block }: { block: AnyBlock }) {
  if (!block.content) return null
  return (
    <Section heading={block.heading} width="narrow" variant="text">
      <div className="rich-text rich-text-justify">
        <RichText data={block.content} />
      </div>
    </Section>
  )
}

function ImageBlockView({ block }: { block: AnyBlock }) {
  if (!block.image?.url) return null
  return (
    <figure className="container-x section-sm">
      <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-media)]">
        <Image src={block.image.url} alt={block.image.alt || block.caption || ''} fill sizes="100vw" className="object-cover" />
      </div>
      {block.caption ? <figcaption className="mt-3 text-center text-sm text-[var(--color-text-muted)]">{block.caption}</figcaption> : null}
    </figure>
  )
}

/**
 * نمونه‌کارها: روی موبایل نوار افقی قابل کشیدن (مثل اینستاگرام که مخاطب از آن می‌آید)،
 * روی دسکتاپ شبکه چهارتایی.
 */
const GALLERY_COLUMNS: Record<number, string> = {
  1: 'md:max-w-[22rem] md:grid-cols-1',
  2: 'md:max-w-[44rem] md:grid-cols-2',
  3: 'md:max-w-[62rem] md:grid-cols-3',
  4: 'md:grid-cols-4',
}

function GalleryBlockView({ block, ctx }: { block: AnyBlock; ctx: PageContext }) {
  const items: AnyBlock[] = (block.items || []).filter((item: AnyBlock) => item.image?.url)
  if (items.length === 0) return null
  // با کمتر از چهار عکس، ستون‌ها کمتر و ردیف وسط‌چین می‌شود تا نیمه ردیف خالی نماند
  const desktopColumns = GALLERY_COLUMNS[Math.min(items.length, 4)]
  return (
    <Section heading={block.heading}>
      <ul className={`-mx-[var(--gutter)] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] pb-3 md:mx-auto md:grid md:gap-4 md:overflow-visible md:px-0 md:pb-0 ${desktopColumns}`}>
        {items.map((item, index) => (
          <li key={item.id || index} className="w-[70%] shrink-0 snap-start sm:w-[42%] md:w-auto">
            <figure>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-media)] bg-[var(--color-bg-alt)]">
                <Image
                  src={item.image.url}
                  alt={item.image.alt || item.caption || ''}
                  fill
                  sizes="(max-width: 640px) 70vw, (max-width: 768px) 42vw, 25vw"
                  className="object-cover"
                />
              </div>
              {item.caption ? <figcaption className="mt-2 text-[0.875rem] text-[var(--color-text-muted)]">{item.caption}</figcaption> : null}
            </figure>
          </li>
        ))}
      </ul>
      {ctx.instagramServices ? (
        <div className="mt-8 text-center">
          <a href={`https://instagram.com/${ctx.instagramServices}`} target="_blank" rel="noreferrer" className="btn btn-ghost">
            نمونه‌کارهای بیشتر در اینستاگرام
          </a>
        </div>
      ) : null}
    </Section>
  )
}

/** قبل و بعد: فقط نمونه‌هایی که هر دو عکس و رضایت صاحب عکس را دارند نمایش داده می‌شوند. */
function BeforeAfterBlockView({ block }: { block: AnyBlock }) {
  const items: AnyBlock[] = (block.items || []).filter(
    (item: AnyBlock) => item.consent === true && item.before?.url && item.after?.url,
  )
  if (items.length === 0) return null
  const intro = splitSampleMarker(block.intro)
  return (
    <Section heading={block.heading}>
      {intro.text ? <p className="lead mx-auto -mt-6 mb-10 max-w-[36rem] text-center">{intro.text}</p> : null}
      <ul className="grid gap-6 md:grid-cols-2">
        {items.map((item, index) => (
          <li key={item.id || index} className="card-soft p-3">
            <div className="grid grid-cols-2 gap-2">
              {(['before', 'after'] as const).map((side) => (
                <figure key={side} className="relative aspect-[4/5] overflow-hidden rounded-[calc(var(--radius-media)-0.5rem)] bg-[var(--color-bg-alt)]">
                  <Image
                    src={item[side].url}
                    alt={item[side].alt || `${side === 'before' ? 'قبل' : 'بعد'}${item.caption ? `: ${item.caption}` : ''}`}
                    fill
                    sizes="(max-width: 768px) 45vw, 22vw"
                    className="object-cover"
                  />
                  <figcaption className="absolute start-2 top-2 rounded-full bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] px-3 py-0.5 text-[0.8125rem] font-bold">
                    {side === 'before' ? 'قبل' : 'بعد'}
                  </figcaption>
                </figure>
              ))}
            </div>
            {item.caption || item.studentName ? (
              <p className="px-2 pb-1 pt-3 text-center text-[0.9375rem]">
                {item.caption}
                {item.studentName ? <span className="text-[var(--color-text-muted)]"> — {item.studentName}</span> : null}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </Section>
  )
}

function VideoBlockView({ block }: { block: AnyBlock }) {
  const src = block.sourceType === 'external' ? block.externalUrl : block.mediaFile?.url
  if (!src) return null
  return (
    <Section heading={block.heading} width="narrow">
      {block.sourceType === 'upload' ? (
        <video controls preload="none" poster={block.posterImage?.url} className="w-full rounded-[var(--radius-media)]" src={src}>
          <track kind="captions" />
        </video>
      ) : (
        <a href={src} target="_blank" rel="noreferrer" className="btn btn-ghost">
          مشاهده ویدئو
        </a>
      )}
    </Section>
  )
}

function FaqBlockView({ block }: { block: AnyBlock }) {
  const items = (block.items || []) as { question: string; answer: string }[]
  if (items.length === 0) return null
  return (
    <Section heading={block.heading || 'پرسش‌های متداول'} width="narrow">
      <FaqAccordion items={items} />
    </Section>
  )
}

/** فرم مشاوره کنار کارت «راه‌های ارتباط» — مثل بخش Get In Touch مرجع. */
function ConsultationFormBlockView({ block, ctx }: { block: AnyBlock; ctx: PageContext }) {
  const tel = phoneForDisplay(ctx.phone)
  const hasContact = Boolean(tel || ctx.instagramAcademy || ctx.whatsapp)
  return (
    <section id={CONSULTATION_ANCHOR} className="section band-alt">
      <div className={`container-x grid items-start gap-6 ${hasContact ? 'md:grid-cols-[1.35fr_1fr] md:gap-8' : 'max-w-[40rem]'}`}>
        <div className="card-soft p-6 md:p-10">
          <ConsultationForm heading={block.heading} description={block.description} />
        </div>
        {hasContact ? (
          <aside className="card-soft p-6 md:p-8">
            <h3 className="title-1">راه‌های ارتباط</h3>
            <dl className="mt-5 flex flex-col gap-5">
              {tel ? (
                <div>
                  <dt className="text-[0.875rem] text-[var(--color-text-muted)]">تلفن</dt>
                  <dd className="mt-1">
                    <a href={tel.href} dir="ltr" className="text-[1.125rem] font-bold text-[var(--color-primary)]">
                      {tel.text}
                    </a>
                  </dd>
                </div>
              ) : null}
              {ctx.instagramAcademy ? (
                <div>
                  <dt className="text-[0.875rem] text-[var(--color-text-muted)]">اینستاگرام آموزش</dt>
                  <dd className="mt-1">
                    <a href={`https://instagram.com/${ctx.instagramAcademy}`} target="_blank" rel="noreferrer" dir="ltr" className="font-bold text-[var(--color-primary)]">
                      @{ctx.instagramAcademy}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
            {ctx.whatsapp ? (
              <a href={ctx.whatsapp} target="_blank" rel="noreferrer" className="btn btn-ghost mt-6">
                پیام در واتساپ
              </a>
            ) : null}
            <Link href="/contact" className="mt-4 block text-[0.9375rem] text-[var(--color-text-muted)] underline-offset-4 hover:underline">
              آدرس سالن و مسیریابی
            </Link>
          </aside>
        ) : null}
      </div>
    </section>
  )
}

function CtaBlockView({ block }: { block: AnyBlock }) {
  const isPrimary = block.style !== 'secondary'
  return (
    <section className={`section ${isPrimary ? 'band-ink' : 'band-alt'}`}>
      <div className="container-narrow text-center">
        <h2 className="display-2">{block.heading}</h2>
        {block.description ? <p className="lead mx-auto mt-4 max-w-[34rem]">{block.description}</p> : null}
        <Link href={block.buttonHref} className="btn btn-primary btn-lg mt-8">
          {block.buttonLabel}
        </Link>
      </div>
    </section>
  )
}

/** عددهای درشت و نازک کنار هم با خط مویی طلایی بینشان؛ زیر سربرگ، بدون کارت */
function StatsStripBlockView({ block }: { block: AnyBlock }) {
  const items: AnyBlock[] = (block.items || []).filter((item: AnyBlock) => item.value && item.label)
  if (items.length === 0) return null
  return (
    <section className="section-sm">
      <div className="container-x">
        <dl className="mx-auto grid max-w-[52rem] border-y border-[var(--gold-soft)]" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
          {items.map((item, index) => (
            // در HTML اول توضیح (dt) و بعد عدد (dd) می‌آید؛ flex-col-reverse عدد را بالا نشان می‌دهد
            <div
              key={item.id || index}
              className={`flex flex-col-reverse px-2 py-7 text-center md:py-9 ${index > 0 ? 'border-s border-[var(--gold-soft)]' : ''}`}
            >
              <dt className="mt-3 text-[0.875rem] text-[var(--color-text-muted)] md:text-[0.9375rem]">{item.label}</dt>
              {/* ترتیب نمایش همان ترتیب تایپ (مثلاً ۱۵+)، تا جهت راست‌به‌چپ علامت + را جابه‌جا نکند */}
              <dd dir="ltr" className="text-[clamp(2rem,6vw,3.25rem)] font-extralight leading-none text-[var(--color-text)]">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

const BLOCK_VIEWS: Record<string, (props: { block: AnyBlock; ctx: PageContext }) => ReactNode | Promise<ReactNode>> = {
  hero: HeroBlockView,
  startGuide: StartGuideBlockView,
  aboutIntro: AboutIntroBlockView,
  text: TextBlockView,
  image: ImageBlockView,
  gallery: GalleryBlockView,
  beforeAfter: BeforeAfterBlockView,
  statsStrip: StatsStripBlockView,
  video: VideoBlockView,
  packageList: PackageListBlockView,
  workshopList: WorkshopListBlockView,
  freeLessonList: FreeLessonListBlockView,
  testimonials: TestimonialsBlockView,
  faq: FaqBlockView,
  consultationForm: ConsultationFormBlockView,
  cta: CtaBlockView,
}

export async function PageBlocks({ blocks }: { blocks: AnyBlock[] }) {
  const visible = (blocks || []).filter((b) => !b.hidden)
  const settings = await getSiteSettings()
  const hasWorkshopList = visible.some((b) => b.blockType === 'workshopList')
  let hasUpcomingWorkshop = false
  if (hasWorkshopList) {
    const payload = await getPayloadClient()
    const upcoming = await payload.count({
      collection: 'workshop-sessions',
      where: { status: { equals: 'published' }, startAt: { greater_than: new Date().toISOString() } },
    })
    hasUpcomingWorkshop = upcoming.totalDocs > 0
  }
  const ctx: PageContext = {
    hasConsultationForm: visible.some((b) => b.blockType === 'consultationForm'),
    instagramServices: settings.instagram?.servicesHandle,
    instagramAcademy: settings.instagram?.academyHandle,
    phone: settings.contact?.phone,
    whatsapp: whatsappLink(settings.contact?.whatsapp, settings.contact?.whatsappGreeting),
    hasWorkshopList,
    hasUpcomingWorkshop,
  }
  const rendered = await Promise.all(
    visible.map(async (block, index) => {
      const View = BLOCK_VIEWS[block.blockType]
      if (!View) return null
      // data-block برای فاصله‌گذاری بین بلوک‌های پشت‌سرهم در CSS (مثلاً چند بلوک «متن»)
      return (
        <div key={block.id || index} data-block={block.blockType}>
          {await View({ block, ctx })}
        </div>
      )
    }),
  )
  return <>{rendered}</>
}
