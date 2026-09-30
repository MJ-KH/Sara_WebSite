import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { PageIntro } from '@/components/site/PageIntro'
import { WorkshopSessionCard } from '@/components/workshops/WorkshopSessionCard'
import { getPayloadClient } from '@/lib/get-payload'

export const metadata: Metadata = { title: 'ورکشاپ‌ها' }

export default async function WorkshopsPage() {
  const payload = await getPayloadClient()
  const sessions = await payload.find({
    collection: 'workshop-sessions',
    where: { status: { equals: 'published' }, startAt: { greater_than: new Date().toISOString() } },
    sort: 'startAt',
    depth: 1,
    limit: 50,
  })

  return (
    <>
      <PageIntro title="ورکشاپ‌ها" lead="آموزش حضوری و عملی در کلاس، با ظرفیت محدود. زمان و ظرفیت باقی‌مانده هر ورکشاپ روی کارت آن آمده است." />
      <section className="section">
        <div className="container-x">
          {sessions.docs.length === 0 ? (
            <div className="card-soft mx-auto max-w-[32rem] p-8 text-center">
              <p className="text-[var(--color-text-muted)]">در حال حاضر ورکشاپ فعالی برای ثبت‌نام وجود ندارد.</p>
              <Link href="/contact" className="btn btn-ghost mt-5">
                تماس با ما
              </Link>
            </div>
          ) : (
            <div className="card-grid" style={{ '--card-min': '19rem' } as CSSProperties}>
              {sessions.docs.map((session) => (
                <WorkshopSessionCard key={session.id} session={session as never} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
