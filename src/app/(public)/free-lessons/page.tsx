import type { Metadata } from 'next'
import { FreeLessonCard } from '@/components/free-lessons/FreeLessonCard'
import { getPayloadClient } from '@/lib/get-payload'

export const metadata: Metadata = { title: 'آموزش رایگان' }

type SearchParams = Promise<{ category?: string; q?: string }>

export default async function FreeLessonsPage({ searchParams }: { searchParams: SearchParams }) {
  const { category, q } = await searchParams
  const payload = await getPayloadClient()

  const categories = await payload.find({ collection: 'free-lesson-categories', limit: 50 })

  const where: any = { status: { equals: 'published' } }
  if (category) where.category = { equals: category }
  if (q) where.title = { like: q }

  const items = await payload.find({ collection: 'free-lessons', where, sort: '-createdAt', limit: 48, depth: 1 })

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">آموزش رایگان</h1>
      <form className="mb-6 flex flex-wrap gap-3" method="get">
        <input name="q" defaultValue={q} placeholder="جست‌وجو..." className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-2 text-sm" />
        <select name="category" defaultValue={category || ''} className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-2 text-sm">
          <option value="">همه دسته‌ها</option>
          {categories.docs.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary px-4 py-2 text-sm font-bold">
          اعمال فیلتر
        </button>
      </form>
      {items.docs.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">موردی یافت نشد.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.docs.map((item) => (
            <FreeLessonCard key={item.id} item={item as any} />
          ))}
        </div>
      )}
    </div>
  )
}
