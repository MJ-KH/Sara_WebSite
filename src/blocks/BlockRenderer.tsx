import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ConsultationForm } from '@/components/forms/ConsultationForm'
import { FreeLessonCard } from '@/components/free-lessons/FreeLessonCard'
import { PackageCard } from '@/components/packages/PackageCard'
import { FaqAccordion } from '@/components/ui/FaqAccordion'
import { TestimonialCard } from '@/components/ui/TestimonialCard'
import { WorkshopSessionCard } from '@/components/workshops/WorkshopSessionCard'
import { getPayloadClient } from '@/lib/get-payload'

/** ساختار بلوک از Payload می‌آید و شکل آن به نوع بلوک بستگی دارد؛ نوع دقیق در payload-types.ts تولید‌شده موجود است. */
type AnyBlock = Record<string, any>

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
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      {block.heading ? <h2 className="mb-6 text-2xl font-bold">{block.heading}</h2> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg as never} />
        ))}
      </div>
    </section>
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
    <section className="mx-auto max-w-6xl px-4 py-10">
      {block.heading ? <h2 className="mb-6 text-2xl font-bold">{block.heading}</h2> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map((session) => (
          <WorkshopSessionCard key={session.id} session={session as never} />
        ))}
      </div>
    </section>
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
    <section className="mx-auto max-w-6xl px-4 py-10">
      {block.heading ? <h2 className="mb-6 text-2xl font-bold">{block.heading}</h2> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {docs.map((item) => (
          <FreeLessonCard key={item.id} item={item as never} />
        ))}
      </div>
    </section>
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
    <section className="mx-auto max-w-6xl px-4 py-10">
      {block.heading ? <h2 className="mb-6 text-2xl font-bold">{block.heading}</h2> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map((item) => (
          <TestimonialCard key={item.id} item={item as never} />
        ))}
      </div>
    </section>
  )
}

function HeroBlockView({ block }: { block: AnyBlock }) {
  const imgFirst = block.imagePosition === 'left'
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 py-12 md:grid-cols-2">
      <div className={imgFirst ? 'md:order-2' : ''}>
        <h1 className="text-3xl font-bold leading-relaxed">{block.heading}</h1>
        {block.subheading ? <p className="mt-4 text-[var(--color-text-muted)]">{block.subheading}</p> : null}
        {block.ctaLabel && block.ctaHref ? (
          <Link href={block.ctaHref} className="btn btn-primary mt-6 inline-block px-6 py-3 font-bold">
            {block.ctaLabel}
          </Link>
        ) : null}
      </div>
      {block.image?.url ? (
        <div className={`relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-base)] ${imgFirst ? 'md:order-1' : ''}`}>
          <Image src={block.image.url} alt={block.image.alt || ''} fill className="object-cover" />
        </div>
      ) : null}
    </section>
  )
}

function TextBlockView({ block }: { block: AnyBlock }) {
  if (!block.content) return null
  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      {block.heading ? <h2 className="mb-4 text-2xl font-bold">{block.heading}</h2> : null}
      <div className="prose prose-neutral max-w-none leading-loose">
        <RichText data={block.content} />
      </div>
    </section>
  )
}

function ImageBlockView({ block }: { block: AnyBlock }) {
  if (!block.image?.url) return null
  return (
    <figure className="mx-auto max-w-4xl px-4 py-8">
      <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-base)]">
        <Image src={block.image.url} alt={block.image.alt || block.caption || ''} fill className="object-cover" />
      </div>
      {block.caption ? <figcaption className="mt-2 text-center text-sm text-[var(--color-text-muted)]">{block.caption}</figcaption> : null}
    </figure>
  )
}

function GalleryBlockView({ block }: { block: AnyBlock }) {
  const items: AnyBlock[] = block.items || []
  if (items.length === 0) return null
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      {block.heading ? <h2 className="mb-6 text-2xl font-bold">{block.heading}</h2> : null}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((item, index) => (
          <div key={index} className="relative aspect-square overflow-hidden rounded-[var(--radius-base)]">
            {item.image?.url ? (
              <Image src={item.image.url} alt={item.image.alt || item.caption || ''} fill className="object-cover" />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}

function VideoBlockView({ block }: { block: AnyBlock }) {
  const src = block.sourceType === 'external' ? block.externalUrl : block.mediaFile?.url
  if (!src) return null
  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      {block.heading ? <h2 className="mb-4 text-2xl font-bold">{block.heading}</h2> : null}
      {block.sourceType === 'upload' ? (
        <video
          controls
          preload="none"
          poster={block.posterImage?.url}
          className="w-full rounded-[var(--radius-base)]"
          src={src}
        >
          <track kind="captions" />
        </video>
      ) : (
        <a href={src} target="_blank" rel="noreferrer" className="text-[var(--color-primary)] underline">
          مشاهده ویدئو
        </a>
      )}
    </section>
  )
}

function FaqBlockView({ block }: { block: AnyBlock }) {
  const items = (block.items || []) as { question: string; answer: string }[]
  if (items.length === 0) return null
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h2 className="mb-6 text-2xl font-bold">{block.heading || 'پرسش‌های متداول'}</h2>
      <FaqAccordion items={items} />
    </section>
  )
}

function ConsultationFormBlockView({ block }: { block: AnyBlock }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <ConsultationForm heading={block.heading} description={block.description} />
    </section>
  )
}

function CtaBlockView({ block }: { block: AnyBlock }) {
  const isPrimary = block.style !== 'secondary'
  return (
    <section
      className={`mx-auto my-8 max-w-6xl rounded-[var(--radius-base)] px-6 py-10 text-center ${
        isPrimary ? 'bg-[var(--color-accent-soft)]' : 'border border-[var(--color-border)]'
      }`}
    >
      <h2 className="text-2xl font-bold">{block.heading}</h2>
      {block.description ? <p className="mt-3 text-[var(--color-text-muted)]">{block.description}</p> : null}
      <Link href={block.buttonHref} className="btn btn-primary mt-6 inline-block px-6 py-3 font-bold">
        {block.buttonLabel}
      </Link>
    </section>
  )
}

const BLOCK_VIEWS: Record<string, (props: { block: AnyBlock }) => ReactNode | Promise<ReactNode>> = {
  hero: HeroBlockView,
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
  const rendered = await Promise.all(
    visible.map(async (block, index) => {
      const View = BLOCK_VIEWS[block.blockType]
      if (!View) return null
      return <div key={block.id || index}>{await View({ block })}</div>
    }),
  )
  return <>{rendered}</>
}
