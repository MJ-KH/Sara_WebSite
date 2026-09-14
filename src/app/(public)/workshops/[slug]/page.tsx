import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Money } from '@/components/ui/Money'
import { SessionActionButton } from '@/components/workshops/SessionActionButton'
import { getPayloadClient } from '@/lib/get-payload'
import { formatJalaliDate } from '@/lib/jalali'

type Params = { params: Promise<{ slug: string }> }

async function getData(slug: string) {
  const payload = await getPayloadClient()
  const workshops = await payload.find({ collection: 'workshops', where: { slug: { equals: slug } }, limit: 1 })
  const workshop = workshops.docs[0]
  if (!workshop) return null

  const sessions = await payload.find({
    collection: 'workshop-sessions',
    where: { workshop: { equals: workshop.id }, status: { equals: 'published' }, startAt: { greater_than: new Date().toISOString() } },
    sort: 'startAt',
    limit: 20,
  })

  return { workshop, sessions: sessions.docs }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const data = await getData(slug)
  return { title: data?.workshop.title }
}

export default async function WorkshopDetailPage({ params }: Params) {
  const { slug } = await params
  const data = await getData(slug)
  if (!data) notFound()
  const { workshop, sessions } = data

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">{workshop.title}</h1>
      {workshop.description ? (
        <div className="prose prose-neutral mt-4 max-w-none leading-loose">
          <RichText data={workshop.description} />
        </div>
      ) : null}
      {workshop.syllabus ? (
        <section className="mt-8">
          <h2 className="mb-2 text-xl font-bold">سرفصل‌ها</h2>
          <div className="prose prose-neutral max-w-none leading-loose">
            <RichText data={workshop.syllabus} />
          </div>
        </section>
      ) : null}
      {workshop.certificateType ? (
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">نوع گواهی: {workshop.certificateType}</p>
      ) : null}

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold">نوبت‌های برگزاری</h2>
        {sessions.length === 0 ? (
          <p className="text-[var(--color-text-muted)]">در حال حاضر نوبت فعالی وجود ندارد.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {sessions.map((session) => {
              const seatsLeft = Math.max(session.capacity - session.occupiedCount, 0)
              return (
                <div key={session.id} className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-bold">{formatJalaliDate(new Date(session.startAt))}</p>
                      {session.location ? <p className="text-sm text-[var(--color-text-muted)]">{session.location}</p> : null}
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {seatsLeft > 0 ? `${seatsLeft} صندلی باقی‌مانده از ${session.capacity}` : 'تکمیل ظرفیت'}
                      </p>
                    </div>
                    <Money rial={session.priceRial} className="font-bold text-[var(--color-primary)]" />
                  </div>
                  {session.toolsNeeded ? <p className="mt-2 text-sm text-[var(--color-text-muted)]">ابزار لازم: {session.toolsNeeded}</p> : null}
                  {session.cancellationPolicy ? <p className="mt-1 text-xs text-[var(--color-text-muted)]">{session.cancellationPolicy}</p> : null}
                  <div className="mt-3">
                    <SessionActionButton sessionId={String(session.id)} soldOut={seatsLeft === 0} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
