/**
 * داده‌های سئوی تأییدشده کارفرما (۱۲ مهر ۱۴۰۵): عنوان و توضیح صفحه‌ها و دوره‌ها، ساعت کاری سالن
 * (شنبه تا پنجشنبه ۹ تا ۲۰، جمعه تعطیل)، ۱۵ سال سابقه، عکس پرتره و عکس پیش‌فرض اشتراک‌گذاری؛
 * پنهان کردن محتوای نمونه و برداشتن ورکشاپ (فعلاً پنهان) از منو و فوتر.
 *
 * اجرا: npm run apply:seo — تکرارپذیر است.
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

const HOME_TITLE = 'آموزش کاشت ناخن و سالن ناخن سعادت‌آباد تهران | سارا نقی‌زاده'
const HOME_DESCRIPTION =
  'آکادمی و سالن ناخن سارا نقی‌زاده در سعادت‌آباد تهران با ۱۵ سال سابقه: دوره آنلاین آموزش کاشت ناخن، آموزش پلی‌ژل و لمینت، و کاشت و ترمیم ناخن در سالن.'

const PAGE_SEO: Record<string, { metaTitle: string; metaDescription: string }> = {
  home: { metaTitle: HOME_TITLE, metaDescription: HOME_DESCRIPTION },
  services: {
    metaTitle: 'کاشت ناخن و سالن زیبایی در سعادت‌آباد تهران',
    metaDescription:
      'سالن ناخن سارا نقی‌زاده در سعادت‌آباد تهران: کاشت و ترمیم ناخن، لمینت ناخن، لاک ژل، پدیکور، مژه و رنگ و لایت مو؛ رزرو وقت و استعلام قیمت از واتساپ.',
  },
  results: {
    metaTitle: 'نمونه‌کار هنرجوهای دوره آموزش کاشت ناخن',
    metaDescription:
      'نمونه‌کار و نتیجه کار هنرجوهای آکادمی ناخن سارا نقی‌زاده در تهران بعد از دوره آموزش کاشت ناخن با پودر و پلی‌ژل.',
  },
  about: {
    metaTitle: 'سارا نقی‌زاده؛ مدرس کاشت ناخن با ۱۵ سال سابقه',
    metaDescription:
      'سارا نقی‌زاده، ناخن‌آرتیست و مدرس کاشت ناخن در تهران با ۱۵ سال سابقه؛ مدیر سالن ناخن سعادت‌آباد و آکادمی آموزش کاشت ناخن، پلی‌ژل و لمینت.',
  },
}

const PACKAGE_SEO: Record<string, { metaTitle: string; metaDescription: string }> = {
  'kasht-poodr': {
    metaTitle: 'دوره آموزش کاشت ناخن با پودر؛ آنلاین، از پایه تا ترمیم',
    metaDescription:
      'دوره آنلاین آموزش کاشت ناخن با پودر از سارا نقی‌زاده: مانیکور روسی، نصب تیپ، کاشت با فرمر و قالب، ترمیم ناخن و دیزاین آکواریومی؛ مناسب شروع از پایه.',
  },
  'update-gel': {
    metaTitle: 'آموزش پلی‌ژل و لمینت ناخن؛ دوره آنلاین آپدیت ژل',
    metaDescription:
      'دوره آنلاین آموزش پلی‌ژل با قلم، قالب و فرمر، ترمیم پلی‌ژل، لاک ژل روی ناخن طبیعی و آموزش لمینت ناخن با سارا نقی‌زاده؛ تماشا با اسپات‌پلیر.',
  },
}

/** متن زیر تیتر بزرگ (سربرگ) صفحه‌ها، با کلمه‌های اصلی جست‌وجو؛ طبیعی و بدون تکرار */
const HERO_SUBHEADINGS: Record<string, string> = {
  home: 'آموزش کاشت ناخن از پایه تا حرفه‌ای، و خدمات تخصصی ناخن در سعادت‌آباد تهران',
  services: 'کاشت و ترمیم ناخن، لمینت، لاک ژل و خدمات زیبایی در سالن سعادت‌آباد تهران؛ برای رزرو وقت و استعلام قیمت پیام بدهید.',
  results: 'نمونه‌کار هنرجوهای دوره آموزش کاشت ناخن آکادمی سارا نقی‌زاده، پیش و پس از آموزش.',
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
    const subheading = HERO_SUBHEADINGS[slug]
    const layout = subheading ? (page.layout || []).map((b) => (b.blockType === 'hero' ? { ...b, subheading } : b)) : page.layout
    await payload.update({ collection: 'pages', id: page.id, draft: false, overrideAccess: true, data: { seo: { ...page.seo, ...seo }, layout } })
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
