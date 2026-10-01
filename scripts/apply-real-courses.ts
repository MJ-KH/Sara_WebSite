/**
 * دو دوره واقعی اسپات‌پلیر را در سایت می‌سازد و دوره‌های نمونه توسعه را پیش‌نویس (پنهان) می‌کند.
 *
 * - دوره‌ای که slug آن از قبل هست دوباره ساخته نمی‌شود (ویرایش‌های پنل دست نمی‌خورد)
 * - فصل و درس فقط برای دوره‌ای ساخته می‌شود که هنوز فصلی ندارد
 * - دوره نمونه فقط اگر عنوانش هنوز «[نمونه]» دارد پیش‌نویس می‌شود؛ پاک نمی‌شود چون سفارش و
 *   دسترسی‌های آزمایشی به آن ارجاع دارند
 *
 * اجرا: npm run apply:courses
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'
import {
  ARTICLE_COURSE,
  CERTIFICATE,
  COMPARE_AT_PRICE_RIAL,
  PRICE_RIAL,
  REAL_COURSES,
  SAMPLE_COURSE_SLUGS,
  toSeconds,
} from './seed-content/real-courses'

async function main() {
  const payload = await getPayload({ config })
  const courseIds = new Map<string, number>()

  console.log('۱) دوره‌های واقعی...')
  for (const course of REAL_COURSES) {
    const existing = (await payload.find({ collection: 'packages', where: { slug: { equals: course.slug } }, limit: 1, overrideAccess: true })).docs[0]
    let packageId = existing?.id as number | undefined
    if (packageId) {
      console.log(`  = ${course.title} از قبل هست`)
    } else {
      const cover = (await payload.find({ collection: 'media', where: { filename: { equals: course.coverFilename } }, limit: 1, overrideAccess: true })).docs[0]
      const created = await payload.create({
        collection: 'packages',
        data: {
          title: course.title,
          slug: course.slug,
          subtitle: course.subtitle,
          level: course.level,
          kind: 'comprehensive',
          topics: course.topics,
          coverImage: cover?.id ?? null,
          description: course.description,
          toolsAndMaterials: course.toolsAndMaterials,
          faqs: course.faqs,
          certificate: CERTIFICATE,
          priceRial: PRICE_RIAL,
          compareAtPriceRial: COMPARE_AT_PRICE_RIAL,
          accessDurationDays: null,
          spotplayerCourseId: course.spotplayerCourseId,
          featured: true,
          featuredOrder: course.featuredOrder,
          status: 'published',
        } as never,
        overrideAccess: true,
      })
      packageId = created.id as number
      console.log(`  + ${course.title}`)
    }
    courseIds.set(course.slug, packageId)

    const chapterCount = (await payload.count({ collection: 'chapters', where: { package: { equals: packageId } }, overrideAccess: true })).totalDocs
    if (chapterCount > 0) continue
    let lessonCount = 0
    for (const [chapterIndex, chapter] of course.chapters.entries()) {
      const chapterDoc = await payload.create({
        collection: 'chapters',
        data: { package: packageId, title: chapter.title, order: chapterIndex + 1, status: 'published' },
        overrideAccess: true,
      })
      for (const [lessonIndex, lesson] of chapter.lessons.entries()) {
        await payload.create({
          collection: 'lessons',
          data: {
            package: packageId,
            chapter: chapterDoc.id,
            title: lesson.title,
            order: lessonIndex + 1,
            durationSeconds: toSeconds(lesson.duration),
            isFreePreview: false,
            status: 'published',
          },
          overrideAccess: true,
        })
        lessonCount++
      }
    }
    console.log(`    ${course.chapters.length} فصل و ${lessonCount} درس ساخته شد`)
  }

  console.log('۲) دوره‌های مرتبط...')
  const [powderId, gelId] = [courseIds.get('kasht-poodr'), courseIds.get('update-gel')]
  if (powderId && gelId) {
    for (const [id, related] of [
      [powderId, gelId],
      [gelId, powderId],
    ] as const) {
      const doc = await payload.findByID({ collection: 'packages', id, depth: 0, overrideAccess: true })
      if (!doc.relatedPackages?.length) {
        await payload.update({ collection: 'packages', id, data: { relatedPackages: [related] }, overrideAccess: true })
      }
    }
  }

  console.log('۳) پنهان کردن دوره‌های نمونه...')
  const samples = await payload.find({ collection: 'packages', where: { slug: { in: SAMPLE_COURSE_SLUGS } }, limit: 10, overrideAccess: true })
  for (const sample of samples.docs) {
    if (!sample.title.startsWith('[نمونه]') || sample.status === 'draft') continue
    await payload.update({ collection: 'packages', id: sample.id, data: { status: 'draft', featured: false }, overrideAccess: true })
    console.log(`  - ${sample.slug} پیش‌نویس شد`)
  }
  const sampleIds = new Set(samples.docs.map((doc) => doc.id))

  console.log('۴) دوره مرتبط مقاله‌های آموزش رایگان...')
  for (const [articleSlug, courseSlug] of Object.entries(ARTICLE_COURSE)) {
    const article = (await payload.find({ collection: 'free-lessons', where: { slug: { equals: articleSlug } }, depth: 0, limit: 1, overrideAccess: true })).docs[0]
    const courseId = courseIds.get(courseSlug)
    if (!article || !courseId) continue
    const current = article.relatedPackage as number | null | undefined
    if (current && !sampleIds.has(current)) continue
    await payload.update({ collection: 'free-lessons', id: article.id, data: { relatedPackage: courseId }, overrideAccess: true })
  }

  console.log('۵) پیشنهاد دوره در «از کجا شروع کنم؟»...')
  const home = (await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } }, depth: 0, limit: 1, overrideAccess: true })).docs[0] as
    | { id: number; layout?: Record<string, any>[] }
    | undefined
  if (home?.layout && powderId && gelId) {
    let changed = false
    const layout = home.layout.map((block) => {
      if (block.blockType !== 'startGuide' || !Array.isArray(block.paths)) return block
      const paths = block.paths.map((path: Record<string, any>, index: number) => {
        const recommended: number[] = path.recommendedPackages || []
        if (recommended.length > 0 && !recommended.every((id) => sampleIds.has(id))) return path
        changed = true
        // مسیر اول (تازه‌کار) ← مبحث پودر؛ مسیرهای بعدی ← آپدیت ژل
        return { ...path, recommendedPackages: [index === 0 ? powderId : gelId] }
      })
      return { ...block, paths }
    })
    if (changed) {
      await payload.update({ collection: 'pages', id: home.id, data: { layout, _status: 'published' } as never, overrideAccess: true })
      console.log('  ✓ به‌روز شد')
    }
  }

  console.log('تمام شد.')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
