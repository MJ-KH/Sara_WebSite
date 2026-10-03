/**
 * قیمت دوره‌های آنلاین و پکیج دو دوره (۱۲ مهر ۱۴۰۵، به تأیید کارفرما):
 * - هر دوره: قیمت اصلی ۳٬۰۰۰٬۰۰۰ تومان، با ۵۰٪ تخفیف ۱٬۵۰۰٬۰۰۰ تومان
 * - پکیج هر دو دوره (مبحث پودر + آپدیت ژل): ۲٬۴۹۰٬۰۰۰ تومان؛ قیمت خط‌خورده = جمع دو دوره (۳٬۰۰۰٬۰۰۰)
 *   خریدار پکیج یک لایسنس اسپات‌پلیر با هر دو دوره می‌گیرد (هر خرید = یک لایسنس).
 * مبلغ‌ها در دیتابیس ریال‌اند. تکرارپذیر است.
 *
 * اجرا: npm run apply:bundle
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

const TOMAN = 10
const COURSE_PRICE = 1_500_000 * TOMAN
const COURSE_COMPARE_AT = 3_000_000 * TOMAN
const BUNDLE_PRICE = 2_490_000 * TOMAN
const COURSE_SLUGS = ['kasht-poodr', 'update-gel'] as const
const BUNDLE_SLUG = 'package-poodr-gel'

function richText(paragraphs: string[]) {
  return {
    root: {
      type: 'root', direction: 'rtl' as const, format: '' as const, indent: 0, version: 1,
      children: paragraphs.map((text) => ({
        type: 'paragraph', direction: 'rtl' as const, format: '' as const, indent: 0, version: 1, textFormat: 0, textStyle: '',
        children: [{ type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }],
      })),
    },
  }
}

async function main() {
  const payload = await getPayload({ config })

  const courses = []
  for (const slug of COURSE_SLUGS) {
    const pkg = (await payload.find({ collection: 'packages', where: { slug: { equals: slug } }, depth: 0, limit: 1, overrideAccess: true })).docs[0]
    if (!pkg) throw new Error(`course missing: ${slug}`)
    await payload.update({ collection: 'packages', id: pkg.id, overrideAccess: true, data: { priceRial: COURSE_PRICE, compareAtPriceRial: COURSE_COMPARE_AT } })
    courses.push(pkg)
    console.log('price set', slug)
  }

  // عکس جلد جدا از دو دوره، تا کارت پکیج در فهرست با کارت دوره‌ها اشتباه نشود
  const cover = (await payload.find({ collection: 'media', where: { filename: { equals: 'n11.jpg' } }, limit: 1, depth: 0, overrideAccess: true })).docs[0]
  const coverId = cover?.id
  const data = {
    title: 'پکیج کامل آموزش کاشت ناخن: پودر + آپدیت ژل',
    slug: BUNDLE_SLUG,
    subtitle: 'هر دو دوره آنلاین «مبحث پودر» و «آپدیت ژل» با هم، با یک لایسنس اسپات‌پلیر و قیمت کمتر',
    kind: 'bundle' as const,
    level: 'beginner' as const,
    includedPackages: courses.map((c) => c.id),
    priceRial: BUNDLE_PRICE,
    compareAtPriceRial: courses.length * COURSE_PRICE,
    status: 'published' as const,
    featured: true,
    featuredOrder: 3,
    ...(coverId ? { coverImage: coverId } : {}),
    description: richText([
      'این پکیج دو دوره کامل آموزش کاشت ناخن سارا نقی‌زاده را با هم دارد: «مبحث پودر» از مانیکور روسی و نصب تیپ تا کاشت با فرمر و قالب و ترمیم، و «آپدیت ژل» برای اجرای دقیق و به‌روز پلی‌ژل، لاک ژل و لمینت.',
      'برای کسی مناسب است که می‌خواهد هر دو سیستم پودر و ژل را یاد بگیرد؛ با خرید پکیج، هر دو دوره را با قیمتی کمتر از خرید جداگانه می‌گیرید.',
    ]),
    faqs: [
      {
        question: 'با خرید پکیج چند لایسنس می‌گیرم؟',
        answer: 'یک لایسنس اسپات‌پلیر که هر دو دوره داخل آن است؛ روی یک دستگاه که موقع خرید انتخاب می‌کنید (اندروید، ویندوز یا نسخه وب برای آیفون).',
      },
      {
        question: 'اگر یکی از دو دوره را قبلاً خریده باشم چه؟',
        answer: 'در این صورت پکیج برای شما قابل خرید نیست؛ دوره دیگر را جداگانه بخرید.',
      },
    ],
    seo: {
      metaTitle: 'پکیج آموزش کاشت ناخن پودر و پلی‌ژل؛ دو دوره آنلاین',
      metaDescription:
        'پکیج دو دوره آنلاین آموزش کاشت ناخن سارا نقی‌زاده: مبحث پودر و آپدیت ژل (پلی‌ژل، لاک ژل و لمینت) با یک لایسنس اسپات‌پلیر؛ ۲٬۴۹۰٬۰۰۰ تومان برای هر دو دوره.',
    },
  }
  const existing = (await payload.find({ collection: 'packages', where: { slug: { equals: BUNDLE_SLUG } }, depth: 0, limit: 1, overrideAccess: true })).docs[0]
  const bundle = existing
    ? await payload.update({ collection: 'packages', id: existing.id, overrideAccess: true, data })
    : await payload.create({ collection: 'packages', overrideAccess: true, data })
  console.log(existing ? 'bundle updated' : 'bundle created', bundle.id, bundle.slug)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
