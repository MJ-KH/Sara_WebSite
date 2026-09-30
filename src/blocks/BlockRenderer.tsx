import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { SwatchFan } from '@/components/brand/SwatchFan'
import { ConsultationForm } from '@/components/forms/ConsultationForm'
import { FreeLessonCard } from '@/components/free-lessons/FreeLessonCard'
import { PackageCard } from '@/components/packages/PackageCard'
import { FaqAccordion } from '@/components/ui/FaqAccordion'
import { Money } from '@/components/ui/Money'
import { SampleBadge } from '@/components/ui/SampleBadge'
import { TestimonialCard } from '@/components/ui/TestimonialCard'
import { WorkshopSessionCard } from '@/components/workshops/WorkshopSessionCard'
import { HERO_PALETTE, SHADES } from '@/lib/brand/swatches'
import { splitSampleMarker } from '@/lib/display'
import { getPayloadClient } from '@/lib/get-payload'
import { getSiteSettings } from '@/lib/get-site-settings'
import { getPackageStats } from '@/lib/packages/stats'

/** ساختار بلوک از Payload می‌آید و شکل آن به نوع بلوک بستگی دارد؛ نوع دقیق در payload-types.ts تولید‌شده موجود است. */
type AnyBlock = Record<string, any>

/** اطلاعاتی از کل صفحه/سایت که یک بلوک ممکن است لازم داشته باشد (مثلاً لینک به فرم مشاوره همان صفحه). */
type PageContext = { hasConsultationForm: boolean; instagramServices?: string | null }

const CONSULTATION_ANCHOR = 'consultation'

/** قاب یکسان همه بخش‌ها: فاصله عمودی و عرض از توکن‌های سیستم طراحی، نه عدد دلخواه. */
function Section({
  heading,
  children,
  tone = 'plain',
  width = 'default',
  id,
}: {
  heading?: string | null
  children: ReactNode
  tone?: 'plain' | 'alt'
  width?: 'default' | 'narrow'
  id?: string
}) {
  const title = splitSampleMarker(heading)
  return (
    <section id={id} className={`section${tone === 'alt' ? ' band-alt' : ''}`}>
      <div className={width === 'narrow' ? 'container-narrow' : 'container-x'}>
        {title.text ? (
          <h2 className="display-2 mb-8 flex flex-wrap items-center gap-3 md:mb-12">
            {title.text}
            {title.isSample ? <SampleBadge /> : null}
          </h2>
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map((item) => (
          <TestimonialCard key={item.id} item={item as never} />
        ))}
      </div>
    </Section>
  )
}

function HeroBlockView({ block, ctx }: { block: AnyBlock; ctx: PageContext }) {
  const heading = splitSampleMarker(block.heading)
  const subheading = splitSampleMarker(block.subheading)
  // در RTL اولین ستون گرید سمت راست است؛ اگر تصویر باید راست باشد، ترتیب را در دسکتاپ برمی‌گردانیم.
  // روی موبایل همیشه اول متن می‌آید.
  const imageOnRight = block.imagePosition === 'right'
  return (
    <section className="overflow-hidden border-b border-[var(--color-border)]">
      <div className="container-x grid items-center gap-8 pb-4 pt-10 md:grid-cols-[1.1fr_1fr] md:gap-12 md:py-20">
        <div className={imageOnRight ? 'md:order-2' : ''}>
          {heading.isSample ? (
            <div className="mb-4">
              <SampleBadge />
            </div>
          ) : null}
          <h1 className="display-1 max-w-[15ch]">{heading.text}</h1>
          {subheading.text ? <p className="lead mt-5 max-w-[32rem]">{subheading.text}</p> : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {block.ctaLabel && block.ctaHref ? (
              <Link href={block.ctaHref} className="btn btn-primary btn-lg">
                {block.ctaLabel}
              </Link>
            ) : null}
            {ctx.hasConsultationForm ? (
              <Link href={`#${CONSULTATION_ANCHOR}`} className="btn btn-ghost btn-lg">
                مشاوره انتخاب پکیج
              </Link>
            ) : null}
          </div>
        </div>
        <div className={imageOnRight ? 'md:order-1' : ''}>
          {block.image?.url ? (
            // عکس سارا ستاره این بخش است؛ بادبزن فقط یک نشانه کوچک برند کنار آن
            <div className="relative mx-auto w-full max-w-[24rem] pb-6 md:max-w-[28rem]">
              <div aria-hidden="true" className="absolute inset-x-[7%] bottom-0 top-[12%] rounded-t-full bg-[var(--color-accent-soft)]" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-t-full bg-[var(--color-bg-alt)]">
                <Image src={block.image.url} alt={block.image.alt || ''} fill priority sizes="(max-width: 768px) 90vw, 28rem" className="object-cover" />
              </div>
              <div aria-hidden="true" className="absolute -start-2 bottom-2 w-20 md:-start-6 md:w-24">
                <SwatchFan id="hero-accent" colors={[SHADES.blush, SHADES.petal, SHADES.rose, SHADES.raspberry]} spread={56} animate />
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-[34rem] translate-y-[8%] md:translate-y-[12%]">
              <SwatchFan id="hero" colors={HERO_PALETTE} spread={84} animate />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/** رنگ تیپ‌های هر مسیر از روشن به عمیق می‌رود: همان ترتیب مبتدی ← باتجربه که مدیر چیده است. */
const PATH_SWATCHES = [
  [SHADES.milk, SHADES.blush, SHADES.petal],
  [SHADES.petal, SHADES.rose, SHADES.raspberry],
  [SHADES.rose, SHADES.raspberry, SHADES.berry],
]

function StartGuideBlockView({ block }: { block: AnyBlock }) {
  const paths: AnyBlock[] = block.paths || []
  if (paths.length === 0) return null
  const intro = splitSampleMarker(block.intro)
  return (
    <Section heading={block.heading || 'از کجا شروع کنم؟'} tone="alt">
      {intro.text ? <p className="lead -mt-4 mb-10 max-w-[36rem]">{intro.text}</p> : null}
      <div className={`grid grid-cols-1 gap-5 ${paths.length > 1 ? 'md:grid-cols-2' : ''} ${paths.length > 2 ? 'lg:grid-cols-3' : ''}`}>
        {paths.map((path, index) => {
          const audience = splitSampleMarker(path.audience)
          const description = splitSampleMarker(path.description)
          const packages: AnyBlock[] = (path.recommendedPackages || []).filter((p: AnyBlock) => typeof p === 'object' && p?.status !== 'draft')
          return (
            <div key={path.id || index} className="flex flex-col rounded-[var(--radius-media)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-8">
              {audience.isSample || description.isSample ? (
                <div className="mb-3">
                  <SampleBadge />
                </div>
              ) : null}
              <div className="mb-5 flex items-start gap-3">
                <span className="mt-1 block w-10 shrink-0">
                  <SwatchFan id={`path-${index}`} colors={PATH_SWATCHES[index % PATH_SWATCHES.length] as string[]} spread={50} />
                </span>
                <h3 className="title-1 min-w-0 flex-1">{audience.text}</h3>
              </div>
              <p className="text-[var(--color-text-muted)]">{description.text}</p>

              {packages.length > 0 ? (
                <ul className="mt-6 border-t border-[var(--color-border)]">
                  {packages.map((pkg) => (
                    <li key={pkg.id} className="border-b border-[var(--color-border)]">
                      <Link href={`/packages/${pkg.slug}`} className="flex min-h-14 items-center justify-between gap-4 py-3 hover:text-[var(--color-primary)]">
                        <span className="font-bold">{splitSampleMarker(pkg.title).text}</span>
                        <Money rial={pkg.priceRial} className="shrink-0 text-[0.9375rem] text-[var(--color-text-muted)]" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}

              {path.linkLabel && path.linkHref ? (
                <Link href={path.linkHref} className="btn btn-ghost mt-6 self-start">
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

function AboutIntroBlockView({ block }: { block: AnyBlock }) {
  const heading = splitSampleMarker(block.heading)
  const body = splitSampleMarker(block.body)
  const points: AnyBlock[] = block.points || []
  const photo = block.photo && typeof block.photo === 'object' && block.photo.url ? block.photo : null
  const isSample = heading.isSample || body.isSample || points.some((p) => splitSampleMarker(p.title).isSample)
  return (
    <section className="section">
      <div className={`container-x grid gap-10 ${photo ? 'md:grid-cols-[1fr_0.8fr] md:items-center md:gap-16' : ''}`}>
        <div className={photo ? '' : 'max-w-[44rem]'}>
          {isSample ? (
            <div className="mb-4">
              <SampleBadge />
            </div>
          ) : null}
          <h2 className="display-2">{heading.text}</h2>
          <p className="lead mt-5 whitespace-pre-line">{body.text}</p>
          {block.linkLabel && block.linkHref ? (
            <Link href={block.linkHref} className="btn btn-ghost mt-8">
              {block.linkLabel}
            </Link>
          ) : null}
        </div>
        {photo ? (
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-t-full bg-[var(--color-bg-alt)]">
            <Image src={photo.url} alt={photo.alt || heading.text} fill sizes="(max-width: 768px) 90vw, 30vw" className="object-cover" />
          </div>
        ) : null}
      </div>

      {points.length > 0 ? (
        <div className="container-x mt-12 md:mt-16">
          <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {points.map((point, index) => (
              <div key={point.id || index} className="border-t-2 border-[var(--color-text)] pt-5">
                <dt className="title-2">{splitSampleMarker(point.title).text}</dt>
                <dd className="mt-2 text-[0.9375rem] text-[var(--color-text-muted)]">{splitSampleMarker(point.text).text}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </section>
  )
}

function TextBlockView({ block }: { block: AnyBlock }) {
  if (!block.content) return null
  return (
    <Section heading={block.heading} width="narrow">
      <div className="rich-text">
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
function GalleryBlockView({ block, ctx }: { block: AnyBlock; ctx: PageContext }) {
  const items: AnyBlock[] = (block.items || []).filter((item: AnyBlock) => item.image?.url)
  if (items.length === 0) return null
  return (
    <Section heading={block.heading}>
      <ul className="-mx-[var(--gutter)] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] pb-3 md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-0 md:pb-0">
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
        <a
          href={`https://instagram.com/${ctx.instagramServices}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost mt-8"
        >
          نمونه‌کارهای بیشتر در اینستاگرام
        </a>
      ) : null}
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

function ConsultationFormBlockView({ block }: { block: AnyBlock }) {
  return (
    <section id={CONSULTATION_ANCHOR} className="section band-alt scroll-mt-20">
      <div className="container-narrow">
        <ConsultationForm heading={block.heading} description={block.description} />
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

const BLOCK_VIEWS: Record<string, (props: { block: AnyBlock; ctx: PageContext }) => ReactNode | Promise<ReactNode>> = {
  hero: HeroBlockView,
  startGuide: StartGuideBlockView,
  aboutIntro: AboutIntroBlockView,
  text: TextBlockView,
  image: ImageBlockView,
  gallery: GalleryBlockView,
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
  const ctx: PageContext = {
    hasConsultationForm: visible.some((b) => b.blockType === 'consultationForm'),
    instagramServices: settings.instagram?.servicesHandle,
  }
  const rendered = await Promise.all(
    visible.map(async (block, index) => {
      const View = BLOCK_VIEWS[block.blockType]
      if (!View) return null
      return <div key={block.id || index}>{await View({ block, ctx })}</div>
    }),
  )
  return <>{rendered}</>
}
