import { requireStudent } from '@/lib/auth/get-request-user'
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
      <h1 className="mb-6 text-xl font-bold">ثبت‌نام‌های دوره حضوری</h1>
      {enrollments.docs.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">هنوز در دوره حضوری ثبت‌نام نکرده‌اید.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {enrollments.docs.map((enrollment) => {
            const session = typeof enrollment.session === 'object' ? enrollment.session : null
            const workshop = session && typeof session.workshop === 'object' ? session.workshop : null
            return (
              <div key={enrollment.id} className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-4">
                <h2 className="font-bold">{workshop?.title || 'دوره حضوری'}</h2>
                {session?.startAt ? <p className="text-sm text-[var(--color-text-muted)]">{formatJalaliDate(new Date(session.startAt))}</p> : null}
                <p className="mt-1 text-sm">وضعیت: {enrollment.status === 'confirmed' ? 'قطعی' : 'لغوشده'}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
