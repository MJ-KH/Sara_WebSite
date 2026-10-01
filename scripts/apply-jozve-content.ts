/**
 * محتوای جزوه سارا را روی دیتابیس موجود می‌نشاند:
 * - بخش «روش آموزش سارا» در صفحه اصلی
 * - فیلدهای دوره «پایه پودر و ژل»
 * - مقاله‌های آموزش رایگان
 *
 * فقط فیلدهایی پر می‌شوند که خالی‌اند یا هنوز متن نمونه («[نمونه]») دارند؛ اگر سارا از پنل
 * چیزی را ویرایش کرده باشد، دست نمی‌خورد. مقاله‌ای که slug آن از قبل هست هم دوباره ساخته نمی‌شود.
 *
 * اجرا: npm run apply:jozve
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { FREE_ARTICLES, POWDER_GEL_COURSE, TEACHING_METHOD } from './seed-content/jozve-content'

const COURSE_SLUG = 'paye-poodr-gel'
const isSample = (value: unknown) => typeof value === 'string' && value.trim().startsWith('[نمونه]')
const isEmpty = (value: unknown) =>
  value == null || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0)
/** متن‌های پیش‌فرض seed که پیشوند [نمونه] ندارند ولی نمونه‌اند */
const SEED_DEFAULTS = new Set(['داده نمونه توسعه — قیمت و محتوا نهایی نیست'])
const replaceable = (value: unknown) =>
  isEmpty(value) || isSample(value) || (typeof value === 'string' && SEED_DEFAULTS.has(value))

async function main() {
  const payload = await getPayload({ config })

  console.log('۱) روش آموزش سارا در صفحه اصلی...')
  const home = (await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } }, depth: 0, limit: 1, overrideAccess: true }))
    .docs[0] as { id: number; layout?: Record<string, unknown>[] } | undefined
  if (home?.layout) {
    let changed = false
    const layout = home.layout.map((block) => {
      if (block.blockType !== 'aboutIntro' || !replaceable(block.heading)) return block
      changed = true
      return { ...block, heading: TEACHING_METHOD.heading, body: TEACHING_METHOD.body, points: TEACHING_METHOD.points }
    })
    if (changed) await payload.update({ collection: 'pages', id: home.id, data: { layout, _status: 'published' } as never, overrideAccess: true })
    console.log(changed ? '  ✓ به‌روز شد' : '  = قبلاً ویرایش شده؛ دست نخورد')
  }

  console.log('۲) دوره «پایه پودر و ژل»...')
  const course = (await payload.find({ collection: 'packages', where: { slug: { equals: COURSE_SLUG } }, depth: 0, limit: 1, overrideAccess: true }))
    .docs[0] as Record<string, any> | undefined
  if (course) {
    const data: Record<string, unknown> = {}
    for (const field of ['subtitle', 'problem', 'targetAudience', 'toolsAndMaterials'] as const) {
      if (replaceable(course[field])) data[field] = POWDER_GEL_COURSE[field]
    }
    if (isEmpty(course.description)) data.description = POWDER_GEL_COURSE.description
    // «آنچه یاد می‌گیرید» حالا در description است؛ متن نمونه قدیمی تکراری می‌شد
    if (isSample(course.expectedOutcome)) data.expectedOutcome = null
    if (replaceable(course.skillShift?.before) && replaceable(course.skillShift?.after)) data.skillShift = POWDER_GEL_COURSE.skillShift
    if (isEmpty(course.benefits)) data.benefits = POWDER_GEL_COURSE.benefits
    const faqs: { question: string; answer: string }[] = course.faqs || []
    if (faqs.every((faq) => isSample(faq.question))) data.faqs = POWDER_GEL_COURSE.faqs
    if (Object.keys(data).length > 0) {
      await payload.update({ collection: 'packages', id: course.id, data: data as never, overrideAccess: true })
    }
    console.log(`  ✓ ${Object.keys(data).join('، ') || 'چیزی برای به‌روزرسانی نبود'}`)
  }

  console.log('۳) مقاله‌های آموزش رایگان...')
  const categories = await payload.find({ collection: 'free-lesson-categories', limit: 100, overrideAccess: true })
  const categoryId = new Map(categories.docs.map((c) => [(c as { slug?: string }).slug, c.id]))
  for (const article of FREE_ARTICLES) {
    const existing = await payload.find({ collection: 'free-lessons', where: { slug: { equals: article.slug } }, limit: 1, overrideAccess: true })
    if (existing.docs[0]) {
      console.log(`  = ${article.slug} از قبل هست`)
      continue
    }
    await payload.create({
      collection: 'free-lessons',
      data: {
        title: article.title,
        slug: article.slug,
        contentType: 'article',
        category: categoryId.get(article.categorySlug) ?? null,
        body: article.body,
        relatedPackage: course?.id ?? null,
        status: 'published',
      } as never,
      overrideAccess: true,
    })
    console.log(`  + ${article.title}`)
  }

  console.log('تمام شد.')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
