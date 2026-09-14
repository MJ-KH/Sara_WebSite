/**
 * داده نمونه برای توسعه محلی. اجرای مکرر این اسکریپت داده را تکثیر نمی‌کند (بر اساس
 * slug/mobile بررسی می‌شود) و اطلاعات واقعی سارا را بازنویسی نمی‌کند. همه قیمت‌ها، تاریخ‌ها
 * و متن‌ها «نمونه» هستند و نباید به‌عنوان اطلاعات تأییدشده منتشر شوند.
 *
 * اجرا: npm run seed
 */
import config from '@payload-config'
import { getPayload } from 'payload'
import type { CollectionSlug } from 'payload'

/**
 * این تابع عمداً با نوع بازگشتی گسترده (any) کار می‌کند: هدف اسکریپت seed سادگی و
 * idempotency است، نه type-safety کامل روی همه کالکشن‌ها؛ شکل داده هر کالکشن جدا و
 * درست‌تایپ‌شده در فراخوانی‌های مستقیم پایین همین فایل مدیریت می‌شود.
 */
async function upsertBySlug(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: CollectionSlug,
  slug: string,
  data: Record<string, unknown>,
): Promise<any> {
  const existing = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, overrideAccess: true })
  if (existing.docs[0]) {
    console.log(`  - ${collection}/${slug} از قبل موجود است، رد شد`)
    return existing.docs[0]
  }
  const created = await payload.create({ collection, data, overrideAccess: true } as Parameters<typeof payload.create>[0])
  console.log(`  + ${collection}/${slug} ساخته شد`)
  return created
}

async function main() {
  console.log('در حال اتصال به Payload...')
  const payload = await getPayload({ config })

  console.log('\n۱) تنظیمات عمومی سایت...')
  const settings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: true })
  if (!settings.headerMenu || settings.headerMenu.length === 0) {
    await payload.updateGlobal({
      slug: 'site-settings',
      overrideAccess: true,
      data: {
        headerMenu: [
          { label: 'خانه', href: '/' },
          { label: 'پکیج‌ها', href: '/packages' },
          { label: 'آموزش رایگان', href: '/free-lessons' },
          { label: 'دوره حضوری', href: '/workshops' },
          { label: 'درباره سارا', href: '/about' },
          { label: 'تماس با ما', href: '/contact' },
        ],
        footer: {
          columns: [
            {
              title: 'دسترسی سریع',
              links: [
                { label: 'پکیج‌ها', href: '/packages' },
                { label: 'آموزش رایگان', href: '/free-lessons' },
              ],
            },
            {
              title: 'حقوقی',
              links: [
                { label: 'شرایط خرید', href: '/terms' },
                { label: 'حریم خصوصی', href: '/privacy' },
              ],
            },
          ],
          copyrightText: '© سارا نقی‌زاده — آموزش تخصصی ناخن',
        },
      },
    })
    console.log('  + منو و فوتر پیش‌فرض ثبت شد')
  } else {
    console.log('  - تنظیمات از قبل موجود است، رد شد')
  }

  console.log('\n۲) دسته‌بندی آموزش رایگان...')
  const category = await upsertBySlug(payload, 'free-lesson-categories', 'zirsazi', {
    slug: 'zirsazi',
    title: 'زیرسازی ناخن',
  })

  console.log('\n۳) پکیج‌های نمونه...')
  const basicPackage = await upsertBySlug(payload, 'packages', 'paye-poodr-gel', {
    slug: 'paye-poodr-gel',
    title: '[نمونه] پایه پودر و ژل',
    subtitle: 'داده نمونه توسعه — قیمت و محتوا نهایی نیست',
    level: 'beginner',
    kind: 'comprehensive',
    topics: ['powder_gel'],
    priceRial: 25_000_000,
    compareAtPriceRial: 30_000_000,
    accessDurationDays: null,
    status: 'published',
    targetAudience: '[نمونه] مناسب افرادی که می‌خواهند از پایه شروع کنند.',
    expectedOutcome: '[نمونه] آشنایی کامل با اصول پودر و ژل.',
    faqs: [{ question: '[نمونه] آیا نیاز به تجربه قبلی است؟', answer: '[نمونه] خیر، این پکیج برای مبتدیان طراحی شده.' }],
  })

  await upsertBySlug(payload, 'packages', 'moadgozari-herfei', {
    slug: 'moadgozari-herfei',
    title: '[نمونه] موادگذاری حرفه‌ای',
    level: 'advanced',
    kind: 'short',
    topics: ['extensions'],
    priceRial: 18_000_000,
    status: 'published',
  })

  await upsertBySlug(payload, 'packages', 'raf-eshkal', {
    slug: 'raf-eshkal',
    title: '[نمونه] رفع اشکال ناخن',
    level: 'intermediate',
    kind: 'short',
    topics: ['troubleshooting'],
    priceRial: 9_000_000,
    status: 'published',
  })

  console.log('\n۴) فصل و درس‌های نمونه برای «پایه پودر و ژل»...')
  const existingChapters = await payload.find({
    collection: 'chapters',
    where: { package: { equals: basicPackage.id } },
    overrideAccess: true,
  })
  if (existingChapters.totalDocs === 0) {
    const chapter1 = await payload.create({
      collection: 'chapters',
      data: { package: basicPackage.id, title: '[نمونه] فصل اول: آشنایی با ابزار', order: 1, status: 'published' },
      overrideAccess: true,
    })
    const chapter2 = await payload.create({
      collection: 'chapters',
      data: { package: basicPackage.id, title: '[نمونه] فصل دوم: اجرای عملی', order: 2, status: 'published' },
      overrideAccess: true,
    })

    await payload.create({
      collection: 'lessons',
      data: {
        package: basicPackage.id,
        chapter: chapter1.id,
        title: '[نمونه] درس ۱: معرفی ابزار (رایگان)',
        order: 1,
        isFreePreview: true,
        durationSeconds: 300,
        status: 'published',
      },
      overrideAccess: true,
    })
    await payload.create({
      collection: 'lessons',
      data: { package: basicPackage.id, chapter: chapter1.id, title: '[نمونه] درس ۲: آماده‌سازی سطح ناخن', order: 2, durationSeconds: 600, status: 'published' },
      overrideAccess: true,
    })
    await payload.create({
      collection: 'lessons',
      data: { package: basicPackage.id, chapter: chapter2.id, title: '[نمونه] درس ۳: اجرای پودر و ژل', order: 1, durationSeconds: 900, status: 'published' },
      overrideAccess: true,
    })
    console.log('  + ۲ فصل و ۳ درس ساخته شد (بدون فایل ویدئوی واقعی — از پنل آپلود کنید)')
  } else {
    console.log('  - فصل/درس از قبل موجود است، رد شد')
  }

  console.log('\n۵) آموزش رایگان نمونه...')
  await upsertBySlug(payload, 'free-lessons', 'ravesh-sohan-keshi', {
    slug: 'ravesh-sohan-keshi',
    title: '[نمونه] روش صحیح سوهان‌کشی',
    category: category.id,
    contentType: 'article',
    status: 'published',
  })

  console.log('\n۶) دوره حضوری نمونه...')
  const workshop = await upsertBySlug(payload, 'workshops', 'workshop-jame-hozori', {
    slug: 'workshop-jame-hozori',
    title: '[نمونه] دوره فشرده حضوری ناخن',
    level: 'intermediate',
    status: 'published',
  })

  const existingSessions = await payload.find({ collection: 'workshop-sessions', where: { workshop: { equals: workshop.id } }, overrideAccess: true })
  if (existingSessions.totalDocs === 0) {
    const startAt = new Date()
    startAt.setDate(startAt.getDate() + 30)
    await payload.create({
      collection: 'workshop-sessions',
      data: {
        workshop: workshop.id,
        startAt: startAt.toISOString(),
        location: '[نمونه] آدرس دقیق پیش از انتشار عمومی تکمیل شود',
        capacity: 8,
        occupiedCount: 0,
        priceRial: 40_000_000,
        status: 'published',
      },
      overrideAccess: true,
    })
    console.log('  + یک نوبت نمونه (۳۰ روز آینده) ساخته شد')
  } else {
    console.log('  - نوبت دوره حضوری از قبل موجود است، رد شد')
  }

  console.log('\n۷) هنرجو و سفارش نمونه...')
  const sampleMobile = '+989120000001'
  let student = (await payload.find({ collection: 'students', where: { mobile: { equals: sampleMobile } }, overrideAccess: true })).docs[0]
  if (!student) {
    student = await payload.create({
      collection: 'students',
      data: { mobile: sampleMobile, name: '[نمونه] هنرجوی آزمایشی', status: 'active', marketingConsent: true },
      overrideAccess: true,
    })
    console.log('  + هنرجوی نمونه ساخته شد:', sampleMobile)

    const order = await payload.create({
      collection: 'orders',
      data: {
        student: student.id,
        subjectType: 'package',
        subjectPackage: basicPackage.id,
        titleSnapshot: basicPackage.title,
        unitPriceRialSnapshot: basicPackage.priceRial,
        discountAmountRialSnapshot: 0,
        totalRialSnapshot: basicPackage.priceRial,
        termsVersionSnapshot: '1',
        status: 'paid',
        paidAt: new Date().toISOString(),
      },
      overrideAccess: true,
    })
    await payload.create({
      collection: 'entitlements',
      data: { student: student.id, package: basicPackage.id, sourceOrder: order.id, grantedAt: new Date().toISOString(), expiresAt: null },
      overrideAccess: true,
    })
    console.log('  + سفارش پرداخت‌شده نمونه و دسترسی مربوطه ساخته شد')
  } else {
    console.log('  - هنرجوی نمونه از قبل موجود است، رد شد')
  }

  console.log('\n۸) صفحه اصلی و درباره سارا...')
  const existingHome = await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } }, overrideAccess: true })
  if (existingHome.totalDocs === 0) {
    await payload.create({
      collection: 'pages',
      data: {
        title: 'صفحه اصلی',
        slug: 'home',
        _status: 'published',
        layout: [
          {
            blockType: 'hero',
            heading: '[نمونه] یادگیری تخصصی ناخن، قدم‌به‌قدم و کاربردی',
            subheading: '[نمونه] با سارا نقی‌زاده، از پایه تا رفع اشکال حرفه‌ای',
            ctaLabel: 'مشاهده پکیج‌ها',
            ctaHref: '/packages',
          },
          { blockType: 'packageList', heading: 'پکیج‌های منتخب', mode: 'featured', limit: 6 },
          { blockType: 'freeLessonList', heading: 'آموزش رایگان', mode: 'latest', limit: 4 },
          { blockType: 'testimonials', heading: 'نظر هنرجوها', mode: 'all', limit: 6 },
          { blockType: 'workshopList', heading: 'دوره حضوری پیش رو', mode: 'upcoming', limit: 3 },
          {
            blockType: 'faq',
            heading: 'پرسش‌های متداول',
            items: [{ question: '[نمونه] چطور پکیج مناسب را انتخاب کنم؟', answer: '[نمونه] از فرم مشاوره رایگان استفاده کنید.' }],
          },
          { blockType: 'consultationForm', heading: 'مشاوره رایگان انتخاب پکیج' },
        ],
        seo: { metaTitle: 'سارا نقی‌زاده — آموزش تخصصی ناخن' },
      },
      overrideAccess: true,
    })
    console.log('  + صفحه اصلی ساخته و منتشر شد')
  } else {
    console.log('  - صفحه اصلی از قبل موجود است، رد شد')
  }

  const existingAbout = await payload.find({ collection: 'pages', where: { slug: { equals: 'about' } }, overrideAccess: true })
  if (existingAbout.totalDocs === 0) {
    await payload.create({
      collection: 'pages',
      data: {
        title: 'درباره سارا',
        slug: 'about',
        _status: 'published',
        layout: [
          {
            blockType: 'hero',
            heading: '[نمونه] درباره سارا نقی‌زاده',
            subheading: '[نمونه] این متن نمونه است و باید با داستان واقعی و تأییدشده جایگزین شود.',
          },
          { blockType: 'cta', heading: 'آماده شروع یادگیری هستید؟', buttonLabel: 'مشاهده پکیج‌ها', buttonHref: '/packages' },
        ],
      },
      overrideAccess: true,
    })
    console.log('  + صفحه «درباره سارا» ساخته و منتشر شد (نیازمند تکمیل محتوای واقعی)')
  } else {
    console.log('  - صفحه «درباره سارا» از قبل موجود است، رد شد')
  }

  console.log('\nتمام شد. برای پاک‌سازی، رکوردهای دارای پیشوند [نمونه] را از پنل حذف کنید.')
  process.exit(0)
}

main().catch((error) => {
  console.error('خطا در اجرای seed:', error)
  process.exit(1)
})
