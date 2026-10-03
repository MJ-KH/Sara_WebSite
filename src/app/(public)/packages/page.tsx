import type { Metadata } from 'next'
import { PackageCard } from '@/components/packages/PackageCard'
import { PageIntro } from '@/components/site/PageIntro'
import { getPackageStats } from '@/lib/packages/stats'
import { getPayloadClient } from '@/lib/get-payload'
import { buildSeoMetadata } from '@/lib/seo/metadata'
import { normalizePersianText } from '@/lib/persian-text'

export function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: 'دوره آموزش کاشت ناخن آنلاین؛ پودر، پلی‌ژل و لمینت',
    description:
      'دوره‌های آنلاین آموزش کاشت ناخن آکادمی سارا نقی‌زاده در تهران: آموزش کاشت پودر از پایه تا ترمیم، آموزش پلی‌ژل، لاک ژل و لمینت ناخن؛ تماشا با اسپات‌پلیر.',
    path: '/packages',
  })
}

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
  // جست‌وجو با «ي/ك» عربی هم همان نتیجه «ی/ک» فارسی را بدهد
  const query = q ? normalizePersianText(q) : ''
  if (query) where.title = { like: query }

  const sortKey = sort && SORT_OPTIONS[sort] ? sort : 'featured'
  const result = await payload.find({
    collection: 'packages',
    where,
    sort: SORT_OPTIONS[sortKey]?.split(','),
    limit: 48,
    depth: 1,
  })

  const stats = await getPackageStats(
    payload,
    result.docs.map((d) => d.id),
  )

  return (
    <>
      <PageIntro
        title="دوره‌های آموزش کاشت ناخن"
        lead="دوره‌های آنلاین آموزش کاشت ناخن، پلی‌ژل و لمینت با سارا نقی‌زاده؛ با یک بار خرید، هر وقت و هر جا تماشا کنید."
      >
        <form className="filter-bar" method="get" role="search">
          <input name="q" type="search" defaultValue={q} placeholder="جست‌وجو در عنوان..." aria-label="جست‌وجو" className="field" />
          <select name="level" defaultValue={level || ''} aria-label="سطح" className="field">
            <option value="">همه سطح‌ها</option>
            <option value="beginner">مبتدی</option>
            <option value="intermediate">متوسط</option>
            <option value="advanced">پیشرفته</option>
          </select>
          <select name="topic" defaultValue={topic || ''} aria-label="موضوع" className="field">
            <option value="">همه موضوعات</option>
            <option value="powder_gel">پودر و ژل</option>
            <option value="extensions">موادگذاری</option>
            <option value="nail_art">طراحی ناخن</option>
            <option value="troubleshooting">رفع اشکال</option>
            <option value="manicure_prep">مانیکور و زیرسازی</option>
          </select>
          <select name="sort" defaultValue={sortKey} aria-label="ترتیب" className="field">
            <option value="featured">منتخب</option>
            <option value="latest">جدیدترین</option>
            <option value="price_asc">ارزان‌ترین</option>
            <option value="price_desc">گران‌ترین</option>
          </select>
          <button type="submit" className="btn btn-primary">
            اعمال فیلتر
          </button>
        </form>
      </PageIntro>
      <section className="section">
        <div className="container-x">
          {result.docs.length === 0 ? (
            <p className="text-center text-[var(--color-text-muted)]">دوره‌ای با این فیلتر یافت نشد.</p>
          ) : (
            <div className="card-grid">
              {result.docs.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg as any} stats={stats.get(String(pkg.id))} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
