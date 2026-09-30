/**
 * اعمال ساختار تأییدشده سایت روی دیتابیس (قابل اجرای چندباره):
 * - اطلاعات تماس و شبکه‌ها (از zil.ink/saravip) و منو/فوتر: با مقدار تأییدشده جایگزین می‌شوند.
 * - دسته‌های آموزش رایگان: فقط موارد ناموجود ساخته می‌شوند.
 * - صفحه‌های «نتایج هنرجوها» و «خدمات»: فقط اگر وجود نداشته باشند ساخته می‌شوند.
 * - تیترهای صفحه اصلی: فقط اگر هنوز همان متن پیش‌فرض قبلی باشند عوض می‌شوند
 *   (ویرایش‌های سارا از پنل بازنویسی نمی‌شود).
 *
 * اجرا: npm run apply:structure
 */
import config from '@payload-config'
import { getPayload } from 'payload'
import {
  CONTACT,
  FOOTER_COLUMNS,
  FREE_LESSON_CATEGORIES,
  HEADER_MENU,
  INSTAGRAM,
  RESULTS_PAGE_LAYOUT,
  SOCIALS,
  servicesPageLayout,
} from './seed-content/site-structure'

/** متن پیش‌فرض قدیمی → متن جدید (فقط وقتی مقدار فعلی دقیقاً متن قدیمی است) */
const HOME_TEXT_UPDATES: Record<string, Record<string, [string, string]>> = {
  hero: { ctaLabel: ['مشاهده پکیج‌ها', 'مشاهده دوره‌ها'] },
  packageList: { heading: ['پکیج‌های منتخب', 'دوره‌های شاخص'] },
  workshopList: { heading: ['دوره حضوری پیش رو', 'ورکشاپ پیش رو'] },
  consultationForm: { heading: ['مشاوره رایگان انتخاب پکیج', 'مشاوره رایگان انتخاب دوره'] },
  cta: { buttonLabel: ['مشاهده پکیج‌ها', 'مشاهده دوره‌ها'] },
}

/**
 * «پکیج» ← «دوره» فقط در متن‌های نمونه (با پیشوند [نمونه]) تا محتوای واقعی‌ای که سارا نوشته
 * دست نخورد. شمارنده، تعداد متن‌های تغییرکرده را نگه می‌دارد.
 */
function renameInSampleText(value: unknown, counter: { n: number }): unknown {
  if (typeof value === 'string') {
    if (!value.startsWith('[نمونه]') || !value.includes('پکیج')) return value
    counter.n++
    return value.replaceAll('پکیج', 'دوره')
  }
  if (Array.isArray(value)) return value.map((item) => renameInSampleText(item, counter))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, renameInSampleText(item, counter)]))
  }
  return value
}

/** متن‌هایی که قبلاً اشتباهاً «[نمونه]» خورده بودند ولی واقعیت‌اند (نه داده نمونه) */
const WRONGLY_MARKED = ['[نمونه] نمونه‌کارها، قبل و بعدها و نظرات هنرجوها']

function stripOldMarkers(value: unknown, counter: { n: number }): unknown {
  if (typeof value === 'string') {
    const hit = WRONGLY_MARKED.find((text) => value.startsWith(text))
    if (!hit) return value
    counter.n++
    return value.replace('[نمونه] ', '')
  }
  if (Array.isArray(value)) return value.map((item) => stripOldMarkers(item, counter))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, stripOldMarkers(item, counter)]))
  }
  return value
}

async function main() {
  const payload = await getPayload({ config })

  console.log('۱) اطلاعات تماس، شبکه‌ها، منو و فوتر...')
  const settings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: true })
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      contact: { ...(settings.contact || {}), ...CONTACT },
      instagram: { ...(settings.instagram || {}), ...INSTAGRAM },
      socials: { ...(settings.socials || {}), ...SOCIALS },
      headerMenu: HEADER_MENU,
      footer: { ...(settings.footer || {}), columns: FOOTER_COLUMNS },
    },
    overrideAccess: true,
  })

  console.log('۲) دسته‌های آموزش رایگان...')
  for (const category of FREE_LESSON_CATEGORIES) {
    const existing = await payload.find({
      collection: 'free-lesson-categories',
      where: { slug: { equals: category.slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.totalDocs === 0) {
      await payload.create({ collection: 'free-lesson-categories', data: category, overrideAccess: true })
      console.log(`  + ${category.title}`)
    }
  }

  console.log('۳) صفحه‌های نتایج هنرجوها و خدمات...')
  const pages = [
    { slug: 'results', title: 'نتایج هنرجوها', layout: RESULTS_PAGE_LAYOUT },
    { slug: 'services', title: 'خدمات سالن', layout: servicesPageLayout() },
  ]
  for (const page of pages) {
    const existing = await payload.find({ collection: 'pages', where: { slug: { equals: page.slug } }, limit: 1, overrideAccess: true })
    if (existing.totalDocs > 0) {
      console.log(`  - /${page.slug} از قبل وجود دارد؛ دست نخورد`)
      continue
    }
    await payload.create({
      collection: 'pages',
      data: { title: page.title, slug: page.slug, _status: 'published', layout: page.layout } as never,
      overrideAccess: true,
    })
    console.log(`  + /${page.slug} ساخته و منتشر شد`)
  }

  console.log('۴) واژه‌های صفحه‌ها («پکیج» ← «دوره»)...')
  const allPages = (await payload.find({ collection: 'pages', depth: 0, limit: 100, pagination: false, overrideAccess: true })).docs as unknown as {
    id: number
    slug: string
    layout?: Record<string, unknown>[]
  }[]
  for (const page of allPages) {
    if (!page.layout) continue
    const counter = { n: 0 }
    const layout = page.layout.map((block) => {
      const next = renameInSampleText(stripOldMarkers(block, counter), counter) as Record<string, unknown>
      const updates = HOME_TEXT_UPDATES[block.blockType as string]
      if (!updates) return next
      for (const [field, [oldText, newText]] of Object.entries(updates)) {
        if (next[field] === oldText) {
          next[field] = newText
          counter.n++
        }
      }
      return next
    })
    if (counter.n > 0) {
      await payload.update({ collection: 'pages', id: page.id, data: { layout, _status: 'published' } as never, overrideAccess: true })
      console.log(`  /${page.slug}: ${counter.n} متن به‌روز شد`)
    }
  }

  const allPackages = (await payload.find({ collection: 'packages', depth: 0, limit: 200, pagination: false, overrideAccess: true })).docs
  for (const pkg of allPackages) {
    const data: Record<string, unknown> = {}
    for (const field of ['subtitle', 'faqs', 'targetAudience', 'toolsAndMaterials', 'supportScope'] as const) {
      const counter = { n: 0 }
      const next = renameInSampleText(pkg[field], counter)
      if (counter.n > 0) data[field] = next
    }
    if (Object.keys(data).length > 0) {
      await payload.update({ collection: 'packages', id: pkg.id, data: data as never, overrideAccess: true })
      console.log(`  دوره ${pkg.slug}: ${Object.keys(data).join('، ')} به‌روز شد`)
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
