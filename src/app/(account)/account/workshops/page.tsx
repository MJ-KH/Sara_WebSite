import Link from 'next/link'
import { StatusPill } from '@/components/ui/StatusPill'
import { requireStudent } from '@/lib/auth/get-request-user'
import { splitSampleMarker } from '@/lib/display'
import { getPayloadClient } from '@/lib/get-payload'
import { formatJalaliDate } from '@/lib/jalali'

export default async function MyWorkshopsPage() {
  const student = await requireStudent()
  if (!student) return null

  const payload = await getPayloadClient()
  const enrollments = await payload.find({
    collection: 'workshop-enrollments',
    where: { student: { equals: student.id } },
    depth: 2,
    sort: '-createdAt',
    limit: 100,
    overrideAccess: true,
  })

  return (
    <div>
      <h2 className="title-1 mb-6">ورکشاپ‌های من</h2>
      {enrollments.docs.length === 0 ? (
        <div className="card-soft p-8 text-center">
          <p className="text-[var(--color-text-muted)]">هنوز در ورکشاپی ثبت‌نام نکرده‌اید.</p>
          <Link href="/workshops" className="btn btn-primary mt-5">
            ورکشاپ‌های پیش رو
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {enrollments.docs.map((enrollment) => {
            const session = typeof enrollment.session === 'object' ? enrollment.session : null
            const workshop = session && typeof session.workshop === 'object' ? session.workshop : null
            const location = splitSampleMarker(session?.location)
            return (
              <li key={enrollment.id} className="card-soft flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  {session?.startAt ? (
                    <span className="inline-block rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-[0.8125rem] font-semibold text-[var(--color-primary)]">
                      {formatJalaliDate(new Date(session.startAt))}
                    </span>
                  ) : null}
                  <p className="mt-2 font-bold">{splitSampleMarker(workshop?.title || 'ورکشاپ').text}</p>
                  {location.text ? <p className="mt-1 text-[0.875rem] text-[var(--color-text-muted)]">{location.text}</p> : null}
                </div>
                {enrollment.status === 'confirmed' ? <StatusPill tone="success">قطعی</StatusPill> : <StatusPill tone="muted">لغوشده</StatusPill>}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
