import type { SiteSetting } from '@/payload-types'
import { normalizeIranMobile } from '@/lib/phone'
import { siteUrl } from './metadata'

/**
 * شناسه‌های ثابت موجودیت‌ها در داده ساخت‌یافته (JSON-LD). دوره‌ها، مقاله‌ها و صفحه‌ها با همین
 * @id به سارا، آکادمی و سالن ارجاع می‌دهند تا گوگل و موتورهای هوش مصنوعی بدانند همه یک برندند.
 */
export function entityIds(base = siteUrl()) {
  return {
    website: `${base}/#website`,
    academy: `${base}/#academy`,
    salon: `${base}/#salon`,
    person: `${base}/#sara`,
  }
}

/**
 * خدمات سالن (همان فهرست صفحه «خدمات»). سالن فقط ناخن نیست؛ ناخن خط اصلی است و اول می‌آید.
 * با تغییر خدمات در سالن، این فهرست هم باید به‌روز شود.
 */
export const SALON_SERVICES = ['کاشت ناخن', 'ترمیم ناخن', 'لمینت ناخن', 'لاک ژل', 'پدیکور', 'خدمات مژه', 'رنگ و لایت مو'] as const

const absolute = (path: string | null | undefined, base: string) => (path ? new URL(path, base).toString() : undefined)

/** «+989...» برای تلفن ساخت‌یافته؛ تلفن ثابت ۰۲۱ هم به +9821 تبدیل می‌شود */
function toE164(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined
  const mobile = normalizeIranMobile(raw)
  if (mobile) return mobile
  const digits = raw.replace(/\D/g, '')
  return digits.startsWith('0') ? `+98${digits.slice(1)}` : undefined
}

/**
 * گراف موجودیت‌های سایت: وب‌سایت، آکادمی (آموزش)، سالن (خدمات حضوری) و سارا (مدرس و مدیر سالن).
 * فقط داده‌های واقعی تنظیمات سایت؛ امتیاز و نظر (aggregateRating) عمداً نیست، چون نظرهای واقعی
 * در پروفایل گوگل‌اند و گوگل نظر خودنوشته روی سایت خود کسب‌وکار را نمی‌پذیرد.
 */
export function buildSiteGraph(settings: SiteSetting) {
  const base = siteUrl()
  const ids = entityIds(base)
  const brand = settings.brand
  const contact = settings.contact
  const logo = typeof brand?.logo === 'object' ? brand.logo?.url : null
  const portrait = typeof brand?.portrait === 'object' ? brand.portrait?.url : null
  const instagram = (handle?: string | null) => (handle ? `https://instagram.com/${handle}` : null)
  const youtube = settings.socials?.youtubeUrl || null
  const telegram = settings.socials?.telegramHandle ? `https://t.me/${settings.socials.telegramHandle}` : null
  const years = brand?.experienceYears ?? null
  const phones = [toE164(contact?.phone), toE164(contact?.landline)].filter(Boolean) as string[]
  const maps = [contact?.googleMapsUrl, contact?.neshanUrl].filter(Boolean) as string[]
  const days = (contact?.openingDays || []).filter(Boolean)
  const hours =
    days.length && contact?.opensAt && contact?.closesAt
      ? [{ '@type': 'OpeningHoursSpecification', dayOfWeek: days.map((d) => `https://schema.org/${d}`), opens: contact.opensAt, closes: contact.closesAt }]
      : undefined
  const brandName = brand?.nameFa || 'سارا نقی‌زاده'

  const person = {
    '@type': 'Person',
    '@id': ids.person,
    name: brandName,
    alternateName: brand?.nameEn || undefined,
    jobTitle: 'ناخن‌آرتیست و مدرس تخصصی ناخن',
    description: years
      ? `ناخن‌آرتیست و مدرس تخصصی ناخن با ${years} سال سابقه؛ مدیر سالن سارا نقی‌زاده و مدرس آکادمی سارا نقی‌زاده.`
      : 'ناخن‌آرتیست و مدرس تخصصی ناخن؛ مدیر سالن سارا نقی‌زاده و مدرس آکادمی سارا نقی‌زاده.',
    url: `${base}/about`,
    image: absolute(portrait, base),
    worksFor: [{ '@id': ids.academy }, { '@id': ids.salon }],
    knowsAbout: ['کاشت ناخن', 'کاشت پودر', 'پلی‌ژل', 'ژل ناخن', 'ترمیم ناخن', 'رفع لیفت ناخن', 'مانیکور روسی', 'طراحی ناخن', 'آموزش ناخن'],
    sameAs: [instagram(settings.instagram?.servicesHandle), instagram(settings.instagram?.academyHandle), youtube].filter(Boolean),
  }

  const academy = {
    '@type': 'EducationalOrganization',
    '@id': ids.academy,
    name: `آکادمی ${brandName}`,
    alternateName: [`آکادمی تخصصی ناخن ${brandName}`, brand?.nameEn ? `${brand.nameEn} Nail Academy` : null].filter(Boolean),
    description: 'آکادمی تخصصی ناخن سارا نقی‌زاده: دوره‌های آنلاین کاشت پودر و ژل، آموزش رایگان و مشاوره انتخاب دوره.',
    url: base,
    logo: absolute(logo, base),
    founder: { '@id': ids.person },
    sameAs: [instagram(settings.instagram?.academyHandle), youtube, telegram].filter(Boolean),
  }

  const salon = {
    // سالن زیبایی کامل با تخصص اصلی ناخن (هر دو نوع، تا هم «سالن زیبایی» هم «سالن ناخن» شناخته شود)
    '@type': ['BeautySalon', 'NailSalon'],
    '@id': ids.salon,
    name: `سالن ${brandName}`,
    alternateName: [`سالن ناخن ${brandName}`, `مرکز ناخن ${brandName}`, `سالن زیبایی ${brandName}`],
    description: `سالن زیبایی ${brandName} در سعادت‌آباد تهران با تخصص ناخن: ${SALON_SERVICES.join('، ')}.`,
    url: `${base}/services`,
    image: absolute(portrait, base),
    logo: absolute(logo, base),
    ...(phones.length ? { telephone: phones[0] } : {}),
    ...(contact?.address
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: contact.address.split('—')[0]?.trim() || contact.address,
            addressLocality: 'تهران',
            addressRegion: 'تهران',
            addressCountry: 'IR',
          },
        }
      : {}),
    ...(maps.length ? { hasMap: maps } : {}),
    ...(hours ? { openingHoursSpecification: hours } : {}),
    areaServed: { '@type': 'City', name: 'تهران' },
    founder: { '@id': ids.person },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'خدمات سالن',
      itemListElement: SALON_SERVICES.map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
    },
    sameAs: [instagram(settings.instagram?.servicesHandle), instagram(settings.instagram?.salonHandle), telegram, ...maps].filter(Boolean),
  }

  const website = {
    '@type': 'WebSite',
    '@id': ids.website,
    name: `${brandName} — آکادمی تخصصی ناخن`,
    url: base,
    inLanguage: 'fa-IR',
    publisher: { '@id': ids.academy },
  }

  return { '@context': 'https://schema.org', '@graph': [website, academy, salon, person] }
}

/** مسیر صفحه (Breadcrumb) برای نتایج گوگل: [نام، مسیر] از صفحه اول تا صفحه فعلی */
export function buildBreadcrumb(items: Array<[name: string, path: string]>) {
  const base = siteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [['خانه', '/'] as [string, string], ...items].map(([name, path], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: new URL(path, base).toString(),
    })),
  }
}
