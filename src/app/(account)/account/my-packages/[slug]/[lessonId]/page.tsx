import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LessonPlayer } from '@/components/lessons/LessonPlayer'
import { requireStudent } from '@/lib/auth/get-request-user'
import { getPayloadClient } from '@/lib/get-payload'
import { extractId } from '@/lib/relation'

export default async function LessonPage({ params }: { params: Promise<{ slug: string; lessonId: string }> }) {
  const student = await requireStudent()
  if (!student) return null

  const { slug, lessonId } = await params
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
  const currentLesson = lessons.docs.find((l) => String(l.id) === lessonId)
  if (!currentLesson) notFound()

  const progress = await payload.find({
    collection: 'lesson-progress',
    where: { and: [{ student: { equals: student.id } }, { lesson: { in: lessons.docs.map((l) => l.id) } }] },
    limit: 500,
    overrideAccess: true,
  })
  const currentProgress = progress.docs.find((p) => extractId(p.lesson) === String(currentLesson.id))

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="min-w-0 flex-1">
        <h1 className="mb-4 text-lg font-bold">{currentLesson.title}</h1>
        <LessonPlayer lessonId={String(currentLesson.id)} initialPositionSeconds={(currentProgress?.positionSeconds as number) || 0} />
        {currentLesson.summary ? <p className="mt-4 text-sm leading-loose text-[var(--color-text-muted)]">{currentLesson.summary}</p> : null}
      </div>
      <aside className="w-full shrink-0 lg:w-72">
        <h2 className="mb-2 font-bold">{pkg.title}</h2>
        <div className="flex flex-col gap-4">
          {chapters.docs.map((chapter) => {
            const chapterLessons = lessons.docs.filter((l) => extractId(l.chapter) === String(chapter.id))
            return (
              <div key={chapter.id}>
                <h3 className="mb-1 text-sm font-bold text-[var(--color-text-muted)]">{chapter.title}</h3>
                <ul className="flex flex-col gap-1">
                  {chapterLessons.map((lesson) => {
                    const p = progress.docs.find((pr) => extractId(pr.lesson) === String(lesson.id))
                    const isActive = String(lesson.id) === lessonId
                    return (
                      <li key={lesson.id}>
                        <Link
                          href={`/account/my-packages/${slug}/${lesson.id}`}
                          className={`flex items-center justify-between rounded-[var(--radius-base)] px-2 py-1.5 text-sm ${
                            isActive ? 'bg-[var(--color-accent-soft)] font-bold' : 'hover:bg-[var(--color-accent-soft)]'
                          }`}
                        >
                          <span>{lesson.title}</span>
                          {p?.completed ? <span aria-label="تکمیل‌شده">✓</span> : null}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      </aside>
    </div>
  )
}
