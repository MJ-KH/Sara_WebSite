import type { Payload } from 'payload'
import { extractId } from '@/lib/relation'
import { SPOTPLAYER_DOWNLOAD_ORIGIN } from './constants'
import { getSpotPlayerClient } from './index'

export type IssueLicenseOutcome =
  | { status: 'issued' | 'already_issued' | 'not_applicable' | 'busy' }
  | { status: 'error'; error: string; retryable: boolean }

/** اگر صدوری بیش از این مدت در حالت «در حال صدور» مانده، پردازه‌اش از کار افتاده و دوباره قابل برداشتن است */
const STALE_ISSUING_MS = 10 * 60_000

/** شماره E.164 ایران (+98912...) را به شکل آشنای ۰۹۱۲... با ارقام لاتین برمی‌گرداند (برای واترمارک). */
function localMobile(e164: string): string {
  return e164.replace(/^\+98/, '0')
}

/**
 * لایسنس اسپات‌پلیر یک دسترسی (entitlement) را صادر می‌کند. هم بلافاصله بعد از پرداخت و هم از
 * صف worker صدا زده می‌شود؛ برای اینکه دو فراخوان هم‌زمان دو لایسنس نسازند، اول وضعیت با یک
 * به‌روزرسانی شرطی اتمیک به «issuing» برده می‌شود و فقط برنده API را صدا می‌زند.
 */
export async function issueSpotPlayerLicense(payload: Payload, entitlementId: number | string): Promise<IssueLicenseOutcome> {
  const entitlement = await payload.findByID({ collection: 'entitlements', id: entitlementId, depth: 0, overrideAccess: true, disableErrors: true })
  if (!entitlement) return { status: 'not_applicable' }
  if (entitlement.spotplayer?.status === 'issued') return { status: 'already_issued' }
  if (entitlement.revokedAt) return { status: 'not_applicable' }

  const packageId = extractId(entitlement.package)
  const studentId = extractId(entitlement.student)
  if (packageId === undefined || studentId === undefined) return { status: 'not_applicable' }
  const pkg = await payload.findByID({ collection: 'packages', id: packageId, depth: 0, overrideAccess: true, disableErrors: true })
  const courseId = pkg?.spotplayerCourseId?.trim()
  if (!courseId) return { status: 'not_applicable' }

  const staleBefore = new Date(Date.now() - STALE_ISSUING_MS).toISOString()
  const claim = await payload.update({
    collection: 'entitlements',
    where: {
      and: [
        { id: { equals: entitlement.id } },
        {
          or: [
            { 'spotplayer.status': { in: ['pending', 'failed'] } },
            { 'spotplayer.status': { exists: false } },
            { and: [{ 'spotplayer.status': { equals: 'issuing' } }, { updatedAt: { less_than: staleBefore } }] },
          ],
        },
      ],
    },
    data: { spotplayer: { ...entitlement.spotplayer, status: 'issuing' } },
    overrideAccess: true,
  })
  if (claim.docs.length === 0) return { status: 'busy' }

  const student = await payload.findByID({ collection: 'students', id: studentId, depth: 0, overrideAccess: true })
  const mobile = localMobile(student.mobile)

  let result
  try {
    result = await getSpotPlayerClient().createLicense({
      courseIds: [courseId],
      name: student.name?.trim() || mobile,
      watermark: mobile,
      payload: `entitlement:${entitlement.id}`,
    })
  } catch (error) {
    // خطای پیکربندی (مثلاً نبود کلید در محیط عملیاتی)؛ بدون تغییر تنظیمات با تلاش دوباره حل نمی‌شود
    result = { ok: false as const, error: error instanceof Error ? error.message : String(error), retryable: false }
  }

  if (result.ok) {
    await payload.update({
      collection: 'entitlements',
      id: entitlement.id,
      data: {
        spotplayer: {
          status: 'issued',
          licenseKey: result.key,
          licenseId: result.licenseId,
          downloadUrl: result.url ? `${SPOTPLAYER_DOWNLOAD_ORIGIN}${result.url}` : null,
          issuedAt: new Date().toISOString(),
          isTest: result.isTest,
          lastError: null,
        },
      },
      overrideAccess: true,
    })
    return { status: 'issued' }
  }

  await payload.update({
    collection: 'entitlements',
    id: entitlement.id,
    data: { spotplayer: { ...entitlement.spotplayer, status: result.retryable ? 'pending' : 'failed', lastError: result.error.slice(0, 500) } },
    overrideAccess: true,
  })
  return { status: 'error', error: result.error, retryable: result.retryable }
}

/** وقتی صف تلاش‌های دوباره را تمام کرد، وضعیت به «ناموفق» می‌رود تا مدیر ببیند و دستی دوباره تلاش کند. */
export async function markSpotPlayerLicenseFailed(payload: Payload, entitlementId: number | string, error: string) {
  const entitlement = await payload.findByID({ collection: 'entitlements', id: entitlementId, depth: 0, overrideAccess: true, disableErrors: true })
  if (!entitlement || entitlement.spotplayer?.status === 'issued') return
  await payload.update({
    collection: 'entitlements',
    id: entitlement.id,
    data: { spotplayer: { ...entitlement.spotplayer, status: 'failed', lastError: error.slice(0, 500) } },
    overrideAccess: true,
  })
}
