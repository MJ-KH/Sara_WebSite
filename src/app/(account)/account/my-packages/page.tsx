import Link from 'next/link'
import { requireStudent } from '@/lib/auth/get-request-user'
import { getPayloadClient } from '@/lib/get-payload'

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

  const active = entitlements.docs

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">آموزش‌های من</h1>
      {active.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">
          هنوز پکیجی خریداری نکرده‌اید.{' '}
          <Link href="/packages" className="text-[var(--color-primary)] underline">
            مشاهده پکیج‌ها
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {active.map((entitlement) => {
            const pkg = typeof entitlement.package === 'object' ? entitlement.package : null
            if (!pkg) return null
            return (
              <Link
                key={entitlement.id}
                href={`/account/my-packages/${pkg.slug}`}
                className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-4 hover:shadow-md"
              >
                <h2 className="font-bold">{pkg.title}</h2>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">ادامه یادگیری</p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
