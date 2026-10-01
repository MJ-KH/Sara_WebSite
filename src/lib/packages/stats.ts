import type { Payload } from 'payload'
import type { PackageStats } from '@/components/packages/PackageCard'

/** تعداد درس‌های منتشرشده چند دوره، با یک کوئری. */
export async function getPackageStats(payload: Payload, packageIds: (string | number)[]): Promise<Map<string, PackageStats>> {
  const stats = new Map<string, PackageStats>()
  if (packageIds.length === 0) return stats

  const lessons = await payload.find({
    collection: 'lessons',
    where: { and: [{ package: { in: packageIds } }, { status: { equals: 'published' } }] },
    select: { package: true },
    depth: 0,
    limit: 2000,
    pagination: false,
  })

  for (const lesson of lessons.docs) {
    const key = String(typeof lesson.package === 'object' && lesson.package ? lesson.package.id : lesson.package)
    const current = stats.get(key) ?? { lessonCount: 0 }
    current.lessonCount += 1
    stats.set(key, current)
  }
  return stats
}
