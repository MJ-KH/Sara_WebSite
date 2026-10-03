/**
 * داده‌های سئوی تأییدشده کارفرما (۱۲ مهر ۱۴۰۵): عنوان و توضیح صفحه‌ها و دوره‌ها، ساعت کاری سالن
 * (شنبه تا پنجشنبه ۹ تا ۲۰، جمعه تعطیل)، ۱۵ سال سابقه، عکس پرتره و عکس پیش‌فرض اشتراک‌گذاری؛
 * پنهان کردن محتوای نمونه و برداشتن ورکشاپ (فعلاً پنهان) از منو و فوتر.
 *
 * اجرا: npm run apply:seo — تکرارپذیر است.
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

const HOME_TITLE = 'آموزش کاشت ناخن و دوره آنلاین ناخن | آکادمی سارا نقی‌زاده'
const HOME_DESCRIPTION =
  'آموزش کاشت ناخن پودر و ژل با سارا نقی‌زاده و ۱۵ سال سابقه؛ دوره‌های آنلاین روی اسپات‌پلیر، آموزش رایگان و خدمات تخصصی ناخن و زیبایی در سالن سعادت‌آباد تهران.'

const PAGE_SEO: Record<string, { metaTitle: string; metaDescription: string }> = {
  home: { metaTitle: HOME_TITLE, metaDescription: HOME_DESCRIPTION },
  services: {
    metaTitle: 'سالن ناخن و زیبایی در سعادت‌آباد تهران',
    metaDescription:
      'کاشت و ترمیم ناخن، لمینت، لاک ژل، پدیکور، مژه و رنگ و لایت مو در سالن سارا نقی‌زاده، سعادت‌آباد تهران؛ رزرو وقت و استعلام قیمت از واتساپ.',
  },
  results: {
    metaTitle: 'نتایج و نمونه‌کار هنرجوهای آکادمی ناخن',
    metaDescription: 'نمونه‌کار و نتیجه کار هنرجوهای آکادمی سارا نقی‌زاده بعد از دوره‌های آموزش کاشت ناخن با پودر و ژل.',
  },
}

const PACKAGE_SEO: Record<string, { metaTitle: string; metaDescription: string }> = {
  'kasht-poodr': {
    metaTitle: 'دوره آموزش کاشت ناخن با پودر؛ از پایه تا ترمیم',
    metaDescription:
      'دوره آنلاین آموزش کاشت ناخن با پودر از سارا نقی‌زاده: مانیکور روسی، نصب تیپ، کاشت با فرمر و قالب، ترمیم و دیزاین آکواریومی؛ تماشا با اسپات‌پلیر.',
  },
  'update-gel': {
    metaTitle: 'دوره آموزش پلی‌ژل و آپدیت ژل ناخن',
    metaDescription:
      'دوره آنلاین آپدیت ژل سارا نقی‌زاده: پلی‌ژل با قلم، قالب و فرمر، ترمیم پلی‌ژل، لاک ژل روی ناخن طبیعی و لمینت؛ تماشا با اسپات‌پلیر.',
  },
}

/** پرتره سارا (هم برای معرفی سارا به گوگل، هم عکس پیش‌فرض اشتراک‌گذاری لینک) */
const PORTRAIT_FILENAME = 'saraPortraitCentered.jpg'

async function main() {
  const payload = await getPayload({ config })

  const portrait = (await payload.find({ collection: 'media', where: { filename: { equals: PORTRAIT_FILENAME } }, limit: 1, overrideAccess: true })).docs[0]
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true })
  const withoutWorkshops = <T extends { href?: string | null }>(items: T[] | null | undefined) => (items || []).filter((i) => !i.href?.startsWith('/workshops'))
  await payload.updateGlobal({
    slug: 'site-settings',
    overrideAccess: true,
    data: {
      brand: { ...settings.brand, experienceYears: 15, ...(portrait ? { portrait: portrait.id } : {}) },
      contact: {
        ...settings.contact,
        openingDays: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opensAt: '09:00',
        closesAt: '20:00',
      },
      seoDefaults: {
        ...settings.seoDefaults,
        metaTitle: HOME_TITLE,
        metaDescription: HOME_DESCRIPTION,
        ...(portrait ? { ogImage: portrait.id } : {}),
      },
      // بخش ورکشاپ فعلاً پنهان است
      headerMenu: withoutWorkshops(settings.headerMenu),
      footer: {
        ...settings.footer,
        columns: (settings.footer?.columns || []).map((col) => ({ ...col, links: withoutWorkshops(col.links) })),
      },
    },
  })
  console.log('site settings updated', portrait ? `(portrait ${portrait.id})` : '(portrait not found)')

  for (const [slug, seo] of Object.entries(PAGE_SEO)) {
    const page = (await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, depth: 0, limit: 1, overrideAccess: true })).docs[0]
    if (!page) { console.log('page missing', slug); continue }
    await payload.update({ collection: 'pages', id: page.id, draft: false, overrideAccess: true, data: { seo: { ...page.seo, ...seo } } })
    console.log('page seo', slug)
  }

  for (const [slug, seo] of Object.entries(PACKAGE_SEO)) {
    const pkg = (await payload.find({ collection: 'packages', where: { slug: { equals: slug } }, depth: 0, limit: 1, overrideAccess: true })).docs[0]
    if (!pkg) { console.log('package missing', slug); continue }
    await payload.update({ collection: 'packages', id: pkg.id, overrideAccess: true, data: { seo: { ...pkg.seo, ...seo } } })
    console.log('package seo', slug)
  }

  // محتوای نمونه (عنوان با «[نمونه]») از سایت و گوگل پنهان می‌شود؛ پاک نمی‌شود
  const sampleLessons = await payload.find({ collection: 'free-lessons', where: { and: [{ title: { like: '[نمونه]' } }, { status: { equals: 'published' } }] }, depth: 0, limit: 50, overrideAccess: true })
  for (const lesson of sampleLessons.docs) {
    await payload.update({ collection: 'free-lessons', id: lesson.id, overrideAccess: true, data: { status: 'draft' } })
    console.log('sample lesson hidden', lesson.slug)
  }
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
