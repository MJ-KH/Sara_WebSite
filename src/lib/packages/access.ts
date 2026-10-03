import type { Payload, Where } from 'payload'
import type { Package } from '@/payload-types'
import { extractId } from '@/lib/relation'

type Id = number | string

/** شرط «دسترسی فعال»: لغو نشده و منقضی نشده (expiresAt خالی یعنی مادام‌العمر) */
export function activeEntitlementWhere(studentId: Id, packageIds: Id[]): Where {
  return {
    and: [
      { student: { equals: studentId } },
      { package: { in: packageIds } },
      { revokedAt: { equals: null } },
      { or: [{ expiresAt: { equals: null } }, { expiresAt: { greater_than: new Date().toISOString() } }] },
    ],
  }
}

/** شناسه دوره‌های داخل یک پکیج چنددوره‌ای (برای دوره معمولی خالی) */
export function includedPackageIds(pkg: Pick<Package, 'kind' | 'includedPackages'>): Id[] {
  if (pkg.kind !== 'bundle') return []
  return (pkg.includedPackages || []).map((p) => extractId(p)).filter((id): id is Id => id !== undefined)
}

/**
 * پکیج‌هایی که دسترسی به این دوره را می‌دهند: خود دوره + هر پکیج چنددوره‌ای که آن را در خود دارد.
 * دسترسی هنرجو به دوره با هر کدام از این‌ها برقرار است.
 */
export async function packageIdsGrantingAccess(payload: Payload, packageId: Id): Promise<Id[]> {
  const bundles = await payload.find({
    collection: 'packages',
    where: { and: [{ kind: { equals: 'bundle' } }, { includedPackages: { contains: packageId } }] },
    depth: 0,
    limit: 50,
    pagination: false,
    overrideAccess: true,
  })
  return [packageId, ...bundles.docs.map((b) => b.id)]
}

/** آیا هنرجو به این دوره (مستقیم یا از راه یک پکیج چنددوره‌ای) دسترسی فعال دارد؟ */
export async function hasActivePackageAccess(payload: Payload, studentId: Id, packageId: Id): Promise<boolean> {
  const ids = await packageIdsGrantingAccess(payload, packageId)
  const found = await payload.find({ collection: 'entitlements', where: activeEntitlementWhere(studentId, ids), limit: 1, depth: 0, overrideAccess: true })
  return found.totalDocs > 0
}

/**
 * پیش از خرید: هنرجو قبلاً این را دارد؟ برای پکیج چنددوره‌ای، داشتن هر کدام از دوره‌های داخلش هم
 * یعنی خرید تکراری (تا یک دوره دو بار پول داده نشود و دو لایسنس جدا ساخته نشود).
 */
export async function alreadyOwnsForPurchase(payload: Payload, studentId: Id, pkg: Pick<Package, 'id' | 'kind' | 'includedPackages'>): Promise<boolean> {
  if (pkg.kind === 'bundle') {
    const checks = await Promise.all([pkg.id, ...includedPackageIds(pkg)].map((id) => hasActivePackageAccess(payload, studentId, id)))
    return checks.some(Boolean)
  }
  return hasActivePackageAccess(payload, studentId, pkg.id)
}

/**
 * شناسه‌های دوره در اسپات‌پلیر برای صدور لایسنس: دوره معمولی یک شناسه؛ پکیج چنددوره‌ای همه
 * شناسه‌های دوره‌های داخلش، در یک لایسنس.
 */
export async function spotplayerCourseIdsFor(
  payload: Payload,
  pkg: Pick<Package, 'kind' | 'includedPackages' | 'spotplayerCourseId'>,
  req?: { transactionID?: string | number },
): Promise<string[]> {
  if (pkg.kind !== 'bundle') return pkg.spotplayerCourseId?.trim() ? [pkg.spotplayerCourseId.trim()] : []
  const ids = includedPackageIds(pkg)
  if (ids.length === 0) return []
  const included = await payload.find({
    collection: 'packages',
    where: { id: { in: ids } },
    depth: 0,
    limit: ids.length,
    pagination: false,
    overrideAccess: true,
    ...(req ? { req } : {}),
  })
  return included.docs.map((p) => p.spotplayerCourseId?.trim()).filter((id): id is string => Boolean(id))
}
