import type { Metadata } from 'next'
import { PackageCard } from '@/components/packages/PackageCard'
import { getPayloadClient } from '@/lib/get-payload'

export const metadata: Metadata = { title: 'پکیج‌های آموزشی' }

type SearchParams = Promise<{ level?: string; topic?: string; sort?: string; q?: string }>

const SORT_OPTIONS: Record<string, string> = {
  featured: '-featured,featuredOrder',
  latest: '-createdAt',
  price_asc: 'priceRial',
  price_desc: '-priceRial',
}

export default async function PackagesPage({ searchParams }: { searchParams: SearchParams }) {
  const { level, topic, sort, q } = await searchParams
  const payload = await getPayloadClient()

  const where: any = { status: { equals: 'published' } }
  if (level) where.level = { equals: level }
  if (topic) where.topics = { in: [topic] }
  if (q) where.title = { like: q }

  const sortKey = sort && SORT_OPTIONS[sort] ? sort : 'featured'
  const result = await payload.find({
    collection: 'packages',
    where,
    sort: SORT_OPTIONS[sortKey]?.split(','),
    limit: 48,
    depth: 1,
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">پکیج‌های آموزشی</h1>
      <form className="mt-6 flex flex-wrap gap-3" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="جست‌وجو در عنوان..."
          className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-2 text-sm"
        />
        <select name="level" defaultValue={level || ''} className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-2 text-sm">
          <option value="">همه سطح‌ها</option>
          <option value="beginner">مبتدی</option>
          <option value="intermediate">متوسط</option>
          <option value="advanced">پیشرفته</option>
        </select>
        <select name="topic" defaultValue={topic || ''} className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-2 text-sm">
          <option value="">همه موضوعات</option>
          <option value="powder_gel">پودر و ژل</option>
          <option value="extensions">موادگذاری</option>
          <option value="nail_art">طراحی ناخن</option>
          <option value="troubleshooting">رفع اشکال</option>
          <option value="manicure_prep">مانیکور و زیرسازی</option>
        </select>
        <select name="sort" defaultValue={sortKey} className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-2 text-sm">
          <option value="featured">منتخب</option>
          <option value="latest">جدیدترین</option>
          <option value="price_asc">ارزان‌ترین</option>
          <option value="price_desc">گران‌ترین</option>
        </select>
        <button type="submit" className="btn btn-primary px-4 py-2 text-sm font-bold">
          اعمال فیلتر
        </button>
      </form>

      {result.docs.length === 0 ? (
        <p className="mt-10 text-center text-[var(--color-text-muted)]">پکیجی با این فیلتر یافت نشد.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.docs.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg as any} />
          ))}
        </div>
      )}
    </div>
  )
}
