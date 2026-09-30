import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { FreeLessonCard } from '@/components/free-lessons/FreeLessonCard'
import { PageIntro } from '@/components/site/PageIntro'
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
    <>
      <PageIntro title="آموزش رایگان" lead="نکته‌ها و آموزش‌های کوتاه ناخن، رایگان و بدون ثبت‌نام.">
        <form className="filter-bar" method="get" role="search">
          <input name="q" type="search" defaultValue={q} placeholder="جست‌وجو..." aria-label="جست‌وجو" className="field" />
          <select name="category" defaultValue={category || ''} aria-label="دسته" className="field">
            <option value="">همه دسته‌ها</option>
            {categories.docs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">
            اعمال فیلتر
          </button>
        </form>
      </PageIntro>
      <section className="section">
        <div className="container-x">
          {items.docs.length === 0 ? (
            <p className="text-center text-[var(--color-text-muted)]">موردی یافت نشد.</p>
          ) : (
            <div className="card-grid" style={{ '--card-min': '15rem', '--card-max': '19rem' } as CSSProperties}>
              {items.docs.map((item) => (
                <FreeLessonCard key={item.id} item={item as any} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
