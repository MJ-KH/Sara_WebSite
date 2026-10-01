import Image from 'next/image'
import Link from 'next/link'
import { SwatchFan } from '@/components/brand/SwatchFan'
import { requireStudent } from '@/lib/auth/get-request-user'
import { paletteForPackage } from '@/lib/brand/swatches'
import { toPersianDigits } from '@/lib/digits'
import { splitSampleMarker } from '@/lib/display'
import { getPayloadClient } from '@/lib/get-payload'
import { extractIdString } from '@/lib/relation'

export default async function MyPackagesPage() {
  const student = await requireStudent()
  if (!student) return null

  const payload = await getPayloadClient()
  const entitlements = await payload.find({
    collection: 'entitlements',
    where: {
      and: [
        { student: { equals: student.id } },
        { revokedAt: { equals: null } },
        { or: [{ expiresAt: { equals: null } }, { expiresAt: { greater_than: new Date().toISOString() } }] },
      ],
    },
    depth: 2,
    limit: 100,
    overrideAccess: true,
  })

  const packages = entitlements.docs
    .map((entitlement) => (typeof entitlement.package === 'object' ? entitlement.package : null))
    .filter((pkg): pkg is NonNullable<typeof pkg> => Boolean(pkg))

  // پیشرفت هر دوره: درس‌های تکمیل‌شده از کل درس‌های منتشرشده
  const lessons = packages.length
    ? await payload.find({
        collection: 'lessons',
        where: { and: [{ package: { in: packages.map((p) => p.id) } }, { status: { equals: 'published' } }] },
        select: { package: true },
        depth: 0,
        limit: 2000,
        pagination: false,
        overrideAccess: true,
      })
    : { docs: [] }
  const completed = lessons.docs.length
    ? await payload.find({
        collection: 'lesson-progress',
        where: { and: [{ student: { equals: student.id } }, { completed: { equals: true } }, { lesson: { in: lessons.docs.map((l) => l.id) } }] },
        select: { lesson: true },
        depth: 0,
        limit: 2000,
        pagination: false,
        overrideAccess: true,
      })
    : { docs: [] }
  const completedIds = new Set(completed.docs.map((p) => extractIdString(p.lesson)))

  return (
    <div>
      <h2 className="title-1 mb-6">دوره‌های من</h2>
      {packages.length === 0 ? (
        <div className="card-soft p-8 text-center">
          <p className="text-[var(--color-text-muted)]">هنوز دوره‌ای نخریده‌اید.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/packages" className="btn btn-primary">
              مشاهده دوره‌ها
            </Link>
            <Link href="/free-lessons" className="btn btn-ghost">
              آموزش رایگان
            </Link>
          </div>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2">
          {packages.map((pkg) => {
            const title = splitSampleMarker(pkg.title)
            const cover = typeof pkg.coverImage === 'object' && pkg.coverImage?.url ? pkg.coverImage : null
            const packageLessons = lessons.docs.filter((l) => extractIdString(l.package) === String(pkg.id))
            const done = packageLessons.filter((l) => completedIds.has(String(l.id))).length
            const total = packageLessons.length
            const percent = total > 0 ? Math.round((done / total) * 100) : 0
            return (
              <li key={pkg.id} className="card-soft flex flex-col p-2.5">
                {cover ? (
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[calc(var(--radius-media)-0.5rem)]">
                    <Image src={cover.url as string} alt={cover.alt || title.text} fill sizes="(max-width: 640px) 100vw, 28rem" className="object-cover" />
                  </div>
                ) : (
                  <div className="pkg-cover rounded-[calc(var(--radius-media)-0.5rem)]">
                    <SwatchFan id={`mine-${pkg.slug}`} colors={paletteForPackage(pkg)} spread={58} />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-3 px-3 pb-3 pt-4">
                  <h3 className="title-2">{title.text}</h3>
                  <div>
                    <div className="flex justify-between text-[0.8125rem] text-[var(--color-text-muted)]">
                      <span>
                        {toPersianDigits(done)} از {toPersianDigits(total)} درس
                      </span>
                      <span>{toPersianDigits(percent)}٪</span>
                    </div>
                    <div
                      className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--color-bg-alt)]"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={percent}
                      aria-label="پیشرفت دوره"
                    >
                      <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                  <Link href={`/account/my-packages/${pkg.slug}`} className="btn btn-primary mt-auto self-start">
                    {done === 0 ? 'شروع دوره' : done === total ? 'مرور دوره' : 'ادامه یادگیری'}
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
