import { toPersianDigits } from '@/lib/digits'
import { getPayloadClient } from '@/lib/get-payload'
import { getSiteSettings } from '@/lib/get-site-settings'
import { splitSampleMarker } from '@/lib/display'
import { SALON_SERVICES } from '@/lib/seo/entities'
import { siteUrl } from '@/lib/seo/metadata'

// از داده زنده ساخته می‌شود (دوره‌ها و تنظیمات در پنل عوض می‌شوند)
export const dynamic = 'force-dynamic'

const DAY_FA: Record<string, string> = {
  Saturday: 'شنبه',
  Sunday: 'یکشنبه',
  Monday: 'دوشنبه',
  Tuesday: 'سه‌شنبه',
  Wednesday: 'چهارشنبه',
  Thursday: 'پنجشنبه',
  Friday: 'جمعه',
}

/**
 * llms.txt: خلاصه متنی سایت برای موتورهای هوش مصنوعی (قالب llmstxt.org). گوگل از آن استفاده
 * نمی‌کند؛ برای بقیه کم‌هزینه و مفید است. فقط داده‌های واقعی و منتشرشده.
 */
export async function GET() {
  const base = siteUrl()
  const settings = await getSiteSettings()
  const payload = await getPayloadClient()
  const [packages, lessons] = await Promise.all([
    payload.find({ collection: 'packages', where: { status: { equals: 'published' } }, depth: 0, limit: 50, sort: 'createdAt', overrideAccess: true }),
    payload.find({ collection: 'free-lessons', where: { status: { equals: 'published' } }, depth: 0, limit: 100, sort: '-createdAt', overrideAccess: true }),
  ])
  const name = settings.brand?.nameFa || 'سارا نقی‌زاده'
  const years = settings.brand?.experienceYears
  const contact = settings.contact
  const days = (contact?.openingDays || []).map((d) => DAY_FA[d] ?? d)
  const real = <T extends { title: string }>(docs: T[]) => docs.filter((d) => !splitSampleMarker(d.title).isSample)

  const lines = [
    `# ${name} — آکادمی آموزش کاشت ناخن و سالن ناخن سعادت‌آباد تهران`,
    '',
    `> ${name} ناخن‌آرتیست و مدرس تخصصی ناخن${years ? ` با ${toPersianDigits(years)} سال سابقه` : ''} است. آکادمی ${name} دوره‌های آنلاین آموزش کاشت ناخن (پودر و ژل) برگزار می‌کند و سالن ${name} در سعادت‌آباد تهران خدمات ناخن و زیبایی ارائه می‌دهد.`,
    '',
    '## دوره‌های آنلاین آموزش کاشت ناخن، پلی‌ژل و لمینت',
    '',
    ...real(packages.docs).map((p) => `- [${splitSampleMarker(p.title).text}](${base}/packages/${p.slug}): ${splitSampleMarker(p.subtitle).text || ''}`.trim()),
    '- دوره‌ها روی نرم‌افزار اسپات‌پلیر تماشا می‌شوند؛ هر خرید یک لایسنس برای یک دستگاه (اندروید، ویندوز یا نسخه وب برای آیفون) و همه جلسه‌ها از لحظه خرید باز است.',
    '',
    '## سالن ناخن و زیبایی در سعادت‌آباد تهران (خدمات حضوری)',
    '',
    `- خدمات: ${SALON_SERVICES.join('، ')} (تخصص اصلی: ناخن)`,
    contact?.address ? `- آدرس: ${contact.address}` : null,
    contact?.phone ? `- تلفن: ${contact.phone}` : null,
    days.length && contact?.opensAt && contact?.closesAt ? `- ساعت کاری: ${days.join('، ')} از ${contact.opensAt} تا ${contact.closesAt}` : null,
    `- [خدمات سالن](${base}/services)`,
    '',
    '## آموزش رایگان',
    '',
    ...real(lessons.docs).map((l) => `- [${l.title}](${base}/free-lessons/${l.slug})`),
    '',
    '## صفحه‌های دیگر',
    '',
    `- [درباره سارا نقی‌زاده](${base}/about)`,
    `- [نتایج هنرجوها](${base}/results)`,
    `- [تماس و آدرس](${base}/contact)`,
    '',
  ].filter((line) => line !== null)

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  })
}
