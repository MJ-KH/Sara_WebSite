import Image from 'next/image'
import Link from 'next/link'
import { SwatchFan } from '@/components/brand/SwatchFan'
import { paletteForPackage } from '@/lib/brand/swatches'
import { toPersianDigits } from '@/lib/digits'
import { splitSampleMarker } from '@/lib/display'
import { getPayloadClient } from '@/lib/get-payload'
import { extractIdString } from '@/lib/relation'
import { SpotPlayerLicense, spotPlayerDeviceLabel } from './SpotPlayerLicense'

/**
 * «دوره‌های من» به سبک کارت عضویت: هر دوره یک کارت جمع‌وجور با عکس کوچک در قاب طاقی، برچسب
 * دستگاه و کد لایسنس. هم صفحه «دوره‌های من» و هم صفحه اول حساب در دسکتاپ از آن استفاده می‌کنند.
 */
export async function MyPackages({ studentId }: { studentId: number }) {
  const student = { id: studentId }
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

  const items = entitlements.docs.flatMap((entitlement) =>
    typeof entitlement.package === 'object' && entitlement.package ? [{ entitlement, pkg: entitlement.package }] : [],
  )
  const packages = items.map((item) => item.pkg)

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
      <h2 className="title-1">دوره‌های من</h2>
      <p className="mb-6 mt-1 text-[0.875rem] text-[var(--color-text-muted)]">
        {items.some(({ entitlement }) => entitlement.spotplayer?.status)
          ? 'کد لایسنس را در اسپات‌پلیر وارد کنید تا دوره باز شود.'
          : 'دوره‌هایی که خریده‌اید اینجا هستند.'}
      </p>
      {items.length === 0 ? (
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
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-2">
          {items.map(({ entitlement, pkg }) => {
            // لایسنس اسپات‌پلیر (دوره یا پکیج چنددوره‌ای)
            const usesSpotPlayer = Boolean(entitlement.spotplayer?.status)
            const includedTitles =
              pkg.kind === 'bundle'
                ? (pkg.includedPackages || []).filter((p): p is Exclude<typeof p, string | number> => typeof p === 'object' && p !== null).map((p) => splitSampleMarker(p.title).text)
                : []
            const title = splitSampleMarker(pkg.title)
            const cover = typeof pkg.coverImage === 'object' && pkg.coverImage?.url ? pkg.coverImage : null
            const packageLessons = lessons.docs.filter((l) => extractIdString(l.package) === String(pkg.id))
            const done = packageLessons.filter((l) => completedIds.has(String(l.id))).length
            const total = packageLessons.length
            const percent = total > 0 ? Math.round((done / total) * 100) : 0
            const deviceLabel = usesSpotPlayer ? spotPlayerDeviceLabel(entitlement.spotplayer?.device) : null
            return (
              <li key={pkg.id} className="card-soft flex min-w-0 flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                  <div className="relative aspect-[3/4] w-[4.5rem] shrink-0 overflow-hidden rounded-[2.25rem_2.25rem_0.5rem_0.5rem/1.625rem_1.625rem_0.5rem_0.5rem] bg-[var(--color-bg-alt)]">
                    {cover ? (
                      <Image src={cover.url as string} alt="" fill sizes="5rem" className="object-cover" />
                    ) : (
                      <div className="pkg-cover absolute inset-0">
                        <SwatchFan id={`mine-${pkg.slug}`} colors={paletteForPackage(pkg)} spread={58} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[1rem] font-medium leading-relaxed">{title.text}</h3>
                    {includedTitles.length > 0 ? (
                      <p className="mt-0.5 text-[0.8125rem] text-[var(--color-text-muted)]">شامل: {includedTitles.join('، ')}</p>
                    ) : null}
                    {deviceLabel ? (
                      <span className="mt-1.5 inline-flex rounded-full border border-[var(--gold-soft)] px-2.5 py-0.5 text-[0.75rem] text-[var(--color-text-muted)]">
                        {deviceLabel}
                      </span>
                    ) : null}
                  </div>
                </div>
                {usesSpotPlayer ? (
                  <SpotPlayerLicense license={entitlement.spotplayer ?? {}} />
                ) : (
                  <>
                    <div>
                      <div className="flex justify-between text-[0.8125rem] text-[var(--color-text-muted)]">
                        <span>
                          {toPersianDigits(done)} از {toPersianDigits(total)} درس
                        </span>
                        <span>{toPersianDigits(percent)}٪</span>
                      </div>
                      <div
                        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-alt)]"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={percent}
                        aria-label="پیشرفت دوره"
                      >
                        <div className="h-full rounded-full bg-[var(--gold)]" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                    <Link
                      href={`/account/my-packages/${pkg.slug}`}
                      className="flex min-h-11 items-center justify-center rounded-full bg-[var(--ink-900)] text-[0.875rem] font-medium text-[#f4ecee] transition-colors hover:bg-[var(--color-primary)]"
                    >
                      {done === 0 ? 'شروع دوره' : done === total ? 'مرور دوره' : 'ادامه یادگیری'}
                    </Link>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
