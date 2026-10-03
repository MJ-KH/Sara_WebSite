/**
 * صفحه «درباره سارا» با متن تأییدشده کارفرما (۱۱ مهر ۱۴۰۵).
 * صفحه about را بازنویسی و منتشر می‌کند؛ عکس‌های سربرگ و دکمه پایانی صفحه حفظ می‌شوند.
 * در متن‌ها **...** یعنی پررنگ و «\n» داخل یک پاراگراف یعنی شکست خط.
 *
 * اجرا: npm run apply:about
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

type Seg = { text: string; bold?: boolean } | { br: true }

function parseParagraph(line: string): Seg[] {
  const segs: Seg[] = []
  line.split('\n').forEach((part, i) => {
    if (i > 0) segs.push({ br: true })
    part.split(/(\*\*[^*]+\*\*)/).filter(Boolean).forEach((t) => {
      if (t.startsWith('**')) segs.push({ text: t.slice(2, -2), bold: true })
      else segs.push({ text: t })
    })
  })
  return segs
}

function richText(paragraphs: string[]) {
  return {
    root: {
      type: 'root', direction: 'rtl', format: '', indent: 0, version: 1,
      children: paragraphs.map((p) => ({
        type: 'paragraph', direction: 'rtl', format: '', indent: 0, version: 1, textFormat: 0, textStyle: '',
        children: parseParagraph(p).map((s) =>
          'br' in s
            ? { type: 'linebreak', version: 1 }
            : { type: 'text', text: s.text, format: s.bold ? 1 : 0, detail: 0, mode: 'normal', style: '', version: 1 },
        ),
      })),
    },
  }
}

const INTRO = [
  'من **سارا نقی‌زاده** هستم؛ ناخن‌آرتیست و مدرس تخصصی حوزه ناخن.',
  'فعالیت حرفه‌ای من از علاقه به زیبایی و ظرافت شروع شد، اما خیلی زود متوجه شدم چیزی که بیشتر از انجام یک کار زیبا برای من لذت‌بخش است، **آموزش درست و اصولی این مهارت به دیگران** است.',
  'امروز در کنار ارائه خدمات تخصصی ناخن، بخش مهمی از فعالیت من به آموزش هنرجوهایی اختصاص دارد که می‌خواهند این حرفه را اصولی یاد بگیرند، مهارت خودشان را ارتقا دهند و با اعتمادبه‌نفس وارد بازار کار شوند.',
  'در آموزش‌هایم تلاش می‌کنم فقط اجرای یک تکنیک را نشان ندهم؛ بلکه دلیل هر مرحله، شناخت صحیح مواد و ابزار، اصول زیرسازی و موادگذاری، فرم‌دهی، رفع ایرادات و نکاتی که در کار واقعی سالن با آن‌ها روبه‌رو می‌شویم را به‌صورت کاربردی آموزش دهم.',
]
const GOAL = [
  'برای من نتیجه آموزش زمانی ارزشمند است که هنرجو بعد از پایان دوره بتواند **مستقل کار کند، ایراد کار خودش را تشخیص دهد و برای ورود به بازار واقعی آماده باشد.**',
  'به همین دلیل دوره‌ها و ورکشاپ‌های آکادمی بر پایه تمرین عملی، اجرای تکنیک روی مدل واقعی، رفع اشکال و پشتیبانی پس از آموزش طراحی شده‌اند.',
  'من معتقدم برای تبدیل شدن به یک ناخن‌کار حرفه‌ای، فقط دیدن آموزش کافی نیست؛\n**آموزش اصولی + تمرین صحیح + بازخورد مستمر** همان چیزی است که باعث پیشرفت واقعی می‌شود.',
]
const ACADEMY = [
  'در آکادمی سارا نقی‌زاده، آموزش‌ها برای هنرجویان با سطوح مختلف طراحی شده‌اند؛ از افرادی که برای اولین‌بار وارد دنیای ناخن می‌شوند تا ناخن‌کارهایی که می‌خواهند تکنیک‌های خود را حرفه‌ای‌تر و به‌روزتر کنند.',
  'هدف من این است که تجربیات سال‌های فعالیتم را به ساده‌ترین و کاربردی‌ترین شکل منتقل کنم تا مسیر یادگیری برای هنرجو کوتاه‌تر، اصولی‌تر و نتیجه‌بخش‌تر شود.',
  '**اگر شما هم می‌خواهید ناخن را حرفه‌ای یاد بگیرید و این مهارت را به یک مسیر کاری واقعی تبدیل کنید، خوشحال می‌شوم در این مسیر همراهتان باشم.**',
]

async function main() {
  const payload = await getPayload({ config })
  const page = (await payload.find({ collection: 'pages', where: { slug: { equals: 'about' } }, depth: 0, overrideAccess: true })).docs[0]
  if (!page) throw new Error('صفحه about پیدا نشد؛ اول npm run seed را اجرا کنید')
  const layout = (page.layout || []) as Record<string, unknown>[]
  const hero = layout.find((b) => b.blockType === 'hero') || { blockType: 'hero' }
  const cta = layout.find((b) => b.blockType === 'cta')
  const { id: _heroId, ...heroRest } = hero
  const next = [
    { ...heroRest, blockType: 'hero', heading: 'درباره من', subheading: 'سارا نقی‌زاده؛ ناخن‌آرتیست و مدرس تخصصی حوزه ناخن' },
    { blockType: 'text', content: richText(INTRO) },
    { blockType: 'text', heading: 'هدف من از آموزش', content: richText(GOAL) },
    { blockType: 'text', heading: 'آکادمی سارا نقی‌زاده', content: richText(ACADEMY) },
    ...(cta ? [(({ id: _i, ...rest }) => rest)(cta)] : []),
  ]
  await payload.update({
    collection: 'pages',
    id: page.id,
    draft: false,
    overrideAccess: true,
    data: {
      title: 'درباره سارا',
      layout: next as never,
      seo: {
        ...(page.seo || {}),
        metaTitle: null,
        metaDescription: 'سارا نقی‌زاده، ناخن‌آرتیست و مدرس تخصصی ناخن؛ آموزش اصولی، تمرین عملی، رفع اشکال و پشتیبانی پس از آموزش در آکادمی سارا نقی‌زاده.',
      },
    },
  })
  console.log('updated about page', page.id, 'blocks:', next.map((b) => b.blockType).join(','))
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
