import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LessonPlayer } from '@/components/lessons/LessonPlayer'
import { getPayloadClient } from '@/lib/get-payload'

export default async function FreePreviewLessonPage({ params }: { params: Promise<{ slug: string; lessonId: string }> }) {
  const { slug, lessonId } = await params
  const payload = await getPayloadClient()

  const lesson = await payload.findByID({ collection: 'lessons', id: lessonId, overrideAccess: true }).catch(() => null)
  if (!lesson || !lesson.isFreePreview || lesson.status !== 'published') notFound()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="mb-2 text-sm text-[var(--color-text-muted)]">نمونه رایگان</p>
      <h1 className="mb-4 text-xl font-bold">{lesson.title}</h1>
      <LessonPlayer lessonId={String(lesson.id)} initialPositionSeconds={0} />
      <div className="mt-8 rounded-[var(--radius-base)] bg-[var(--color-accent-soft)] p-4 text-center">
        <p>برای دسترسی به همه درس‌های این پکیج، آن را خریداری کنید.</p>
        <Link href={`/packages/${slug}`} className="btn btn-primary mt-3 inline-block px-6 py-2 font-bold">
          مشاهده پکیج
        </Link>
      </div>
    </div>
  )
}
