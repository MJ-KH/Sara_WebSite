import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LessonPlayer } from '@/components/lessons/LessonPlayer'
import { requireStudent } from '@/lib/auth/get-request-user'
import { toPersianDigits } from '@/lib/digits'
import { splitSampleMarker } from '@/lib/display'
import { getPayloadClient } from '@/lib/get-payload'
import { extractIdString } from '@/lib/relation'

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
  const currentProgress = progress.docs.find((p) => extractIdString(p.lesson) === String(currentLesson.id))

  // ترتیب پخش: فصل به فصل، و داخل هر فصل به ترتیب درس
  const ordered = chapters.docs.flatMap((chapter) => lessons.docs.filter((l) => extractIdString(l.chapter) === String(chapter.id)))
  const position = ordered.findIndex((l) => String(l.id) === lessonId)
  const previous = position > 0 ? ordered[position - 1] : null
  const next = position >= 0 && position < ordered.length - 1 ? ordered[position + 1] : null
  const packageTitle = splitSampleMarker(pkg.title).text

  return (
    <div className="flex flex-col gap-8 xl:flex-row">
      <div className="min-w-0 flex-1">
        <nav aria-label="مسیر صفحه" className="text-[0.875rem] text-[var(--color-text-muted)]">
          <Link href="/account/my-packages" className="hover:text-[var(--color-primary)]">
            دوره‌های من
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span>{packageTitle}</span>
        </nav>
        <h2 className="title-1 mb-5 mt-2">{splitSampleMarker(currentLesson.title).text}</h2>
        <LessonPlayer lessonId={String(currentLesson.id)} initialPositionSeconds={(currentProgress?.positionSeconds as number) || 0} />
        {currentLesson.summary ? <p className="mt-5 leading-[2] text-[var(--color-text-muted)]">{currentLesson.summary}</p> : null}

        <div className="mt-6 flex flex-wrap justify-between gap-3">
          {previous ? (
            <Link href={`/account/my-packages/${slug}/${previous.id}`} className="btn btn-ghost">
              → درس قبل
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/account/my-packages/${slug}/${next.id}`} className="btn btn-primary">
              درس بعد ←
            </Link>
          ) : null}
        </div>
      </div>

      <aside className="w-full shrink-0 xl:w-80">
        <div className="card-soft p-5">
          <h3 className="title-2">{packageTitle}</h3>
          <p className="mt-1 text-[0.8125rem] text-[var(--color-text-muted)]">
            {toPersianDigits(progress.docs.filter((p) => p.completed).length)} از {toPersianDigits(lessons.docs.length)} درس تکمیل شده
          </p>
          <div className="mt-4 flex flex-col gap-5">
            {chapters.docs.map((chapter) => {
              const chapterLessons = lessons.docs.filter((l) => extractIdString(l.chapter) === String(chapter.id))
              if (chapterLessons.length === 0) return null
              return (
                <div key={chapter.id}>
                  <h4 className="mb-2 text-[0.8125rem] font-bold text-[var(--color-text-muted)]">{splitSampleMarker(chapter.title).text}</h4>
                  <ul className="flex flex-col gap-1">
                    {chapterLessons.map((lesson) => {
                      const done = progress.docs.find((pr) => extractIdString(pr.lesson) === String(lesson.id))?.completed
                      const isActive = String(lesson.id) === lessonId
                      return (
                        <li key={lesson.id}>
                          <Link
                            href={`/account/my-packages/${slug}/${lesson.id}`}
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex items-center gap-3 rounded-[var(--radius-base)] px-3 py-2.5 text-[0.9375rem] transition-colors ${
                              isActive ? 'bg-[var(--color-accent-soft)] font-bold' : 'hover:bg-[var(--color-bg-alt)]'
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-[0.7rem] ${
                                done
                                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-contrast)]'
                                  : 'border-[var(--color-border-strong)]'
                              }`}
                            >
                              {done ? '✓' : null}
                            </span>
                            <span className="min-w-0 flex-1">{splitSampleMarker(lesson.title).text}</span>
                            {done ? <span className="sr-only">تکمیل‌شده</span> : null}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </aside>
    </div>
  )
}
