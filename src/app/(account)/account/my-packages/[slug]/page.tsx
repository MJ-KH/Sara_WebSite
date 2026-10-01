import { notFound, redirect } from 'next/navigation'
import { requireStudent } from '@/lib/auth/get-request-user'
import { getPayloadClient } from '@/lib/get-payload'
import { extractIdString } from '@/lib/relation'

export default async function MyPackageEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const student = await requireStudent()
  if (!student) return null

  const { slug } = await params
  const payload = await getPayloadClient()

  const packages = await payload.find({ collection: 'packages', where: { slug: { equals: slug } }, limit: 1, overrideAccess: true })
  const pkg = packages.docs[0]
  if (!pkg) notFound()

  const entitlement = await payload.find({
    collection: 'entitlements',
    where: { and: [{ student: { equals: student.id } }, { package: { equals: pkg.id } }, { revokedAt: { equals: null } }] },
    limit: 1,
    overrideAccess: true,
  })
  if (entitlement.totalDocs === 0) notFound()

  const chapters = await payload.find({
    collection: 'chapters',
    where: { package: { equals: pkg.id } },
    sort: 'order',
    limit: 100,
    overrideAccess: true,
  })
  const lessons = await payload.find({
    collection: 'lessons',
    where: { package: { equals: pkg.id }, status: { equals: 'published' } },
    sort: 'order',
    limit: 500,
    overrideAccess: true,
  })
  // ترتیب درس «order» داخل هر فصل است؛ ترتیب واقعی دوره فصل به فصل است
  const ordered = chapters.docs.flatMap((chapter) => lessons.docs.filter((l) => extractIdString(l.chapter) === String(chapter.id)))
  const firstLesson = ordered[0]
  if (!firstLesson) notFound()

  const progress = await payload.find({
    collection: 'lesson-progress',
    where: { and: [{ student: { equals: student.id } }, { lesson: { in: lessons.docs.map((l) => l.id) } }] },
    limit: 500,
    overrideAccess: true,
  })

  const incomplete = ordered.find((lesson) => {
    const p = progress.docs.find((pr) => extractIdString(pr.lesson) === String(lesson.id))
    return !p?.completed
  })

  const target = incomplete || firstLesson
  redirect(`/account/my-packages/${slug}/${target.id}`)
}
