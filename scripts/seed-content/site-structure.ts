/**
 * ساختار سایت طبق نقشه تأییدشده کاربر: منوی اصلی، فوتر، دسته‌های آموزش رایگان، و صفحه‌های
 * «نتایج هنرجوها» و «خدمات». اطلاعات تماس از صفحه zil.ink/saravip خود سارا گرفته شده
 * (تأیید کاربر در گفتگو). هیچ قیمت، مدرک یا ادعای ساختگی در این فایل نیست.
 */
import { whatsappLink } from '@/lib/display'

export const HEADER_MENU = [
  { label: 'خانه', href: '/' },
  { label: 'دوره‌ها', href: '/packages' },
  { label: 'ورکشاپ‌ها', href: '/workshops' },
  { label: 'آموزش رایگان', href: '/free-lessons' },
  { label: 'نتایج هنرجوها', href: '/results' },
  { label: 'خدمات', href: '/services' },
  { label: 'درباره سارا', href: '/about' },
]

export const FOOTER_COLUMNS = [
  {
    title: 'آکادمی',
    links: [
      { label: 'دوره‌ها', href: '/packages' },
      { label: 'ورکشاپ‌ها', href: '/workshops' },
      { label: 'آموزش رایگان', href: '/free-lessons' },
      { label: 'نتایج هنرجوها', href: '/results' },
    ],
  },
  {
    title: 'سارا نقی‌زاده',
    links: [
      { label: 'درباره سارا', href: '/about' },
      { label: 'خدمات سالن', href: '/services' },
      { label: 'تماس با ما', href: '/contact' },
      { label: 'شرایط خرید', href: '/terms' },
      { label: 'حریم خصوصی', href: '/privacy' },
    ],
  },
]

/** از zil.ink/saravip */
export const CONTACT = {
  phone: '09399044156',
  landline: '02188683502',
  whatsapp: '09399044156',
  whatsappGreeting: 'سلام، وقتتون به خیر.',
  address:
    'تهران، سعادت‌آباد، ضلع شمال‌غربی تقاطع چهارراه پاک‌نژاد و سرو، کنارگذر سمت راست، خیابان نامی، جنب آزمایشگاه ساره (سمت چپ)، پلاک ۲۷، واحد ۱، زنگ سمت راست، طبقه پایین — سالن سارا نقی‌زاده',
  neshanUrl: 'https://nshn.ir/_bv7WuNx4r2l',
  googleMapsUrl: 'https://share.google/1fQxqTeQ9wyUN1OlN',
  visitNotes: [
    'در صورت نبود امکان کارت‌به‌کارت یا موبایل‌بانک در سالن، لطفاً پول نقد همراه داشته باشید.',
    'اگر جای پارک مناسب نبود، پارکینگ عمومی روبه‌روی سالن در دسترس است.',
    'لطفاً در صورت لغو وقت، از قبل اطلاع دهید.',
  ].join('\n'),
}

export const INSTAGRAM = {
  academyHandle: 'saranaghizadeh_nailacademy',
  servicesHandle: 'sara_vip_nailfashion',
  salonHandle: 'saravip.beauty',
}

export const SOCIALS = {
  youtubeUrl: 'https://youtube.com/@saranaghizadehbeauty',
  telegramHandle: 'sara_vip_nailfashion',
}

export const FREE_LESSON_CATEGORIES = [
  { slug: 'manicure', title: 'مانیکور' },
  { slug: 'powder', title: 'کاشت پودر' },
  { slug: 'polygel', title: 'پلی‌ژل' },
  { slug: 'laminate', title: 'لمینت' },
  { slug: 'forming', title: 'فرم‌دهی' },
  { slug: 'lift-fix', title: 'رفع لیفت' },
  { slug: 'refill', title: 'ترمیم' },
  { slug: 'nail-art', title: 'طراحی ناخن' },
]

/** متن ساده → ساختار ریچ‌تکست Lexical (پاراگراف‌ها و فهرست نقطه‌ای) */
export function lexical(nodes: ({ p: string } | { ul: string[] })[]) {
  const text = (value: string) => ({ type: 'text', text: value, format: 0, style: '', mode: 'normal', detail: 0, version: 1 })
  const base = { format: '', indent: 0, version: 1, direction: 'rtl' as const }
  return {
    root: {
      ...base,
      type: 'root',
      children: nodes.map((node) =>
        'p' in node
          ? { ...base, type: 'paragraph', textFormat: 0, textStyle: '', children: [text(node.p)] }
          : {
              ...base,
              type: 'list',
              listType: 'bullet',
              start: 1,
              tag: 'ul',
              children: node.ul.map((item, index) => ({ ...base, type: 'listitem', value: index + 1, children: [text(item)] })),
            },
      ),
    },
  }
}

export const RESULTS_PAGE_LAYOUT = [
  {
    blockType: 'hero',
    heading: 'نتایج هنرجوها',
    subheading: 'نمونه‌کار هنرجوهای آکادمی سارا نقی‌زاده، پیش و پس از آموزش.',
    ctaLabel: 'مشاهده دوره‌ها',
    ctaHref: '/packages',
  },
  { blockType: 'beforeAfter', heading: 'قبل و بعد', items: [] },
  {
    blockType: 'text',
    content: lexical([{ p: 'نمونه‌کارها، قبل و بعدها و نظرات هنرجوها پس از دریافت عکس‌ها و رضایت هنرجوها در همین صفحه منتشر می‌شود.' }]),
  },
  { blockType: 'testimonials', heading: 'نظر هنرجوها', mode: 'all', limit: 12 },
  { blockType: 'cta', heading: 'شما هم شروع کنید', buttonLabel: 'مشاهده دوره‌ها', buttonHref: '/packages' },
]

export function servicesPageLayout() {
  return [
    {
      blockType: 'hero',
      heading: 'خدمات سالن سارا نقی‌زاده',
      subheading: 'خدمات تخصصی ناخن در سالن سعادت‌آباد؛ برای رزرو وقت و استعلام قیمت پیام بدهید.',
      ctaLabel: 'رزرو و استعلام در واتساپ',
      ctaHref: whatsappLink(CONTACT.whatsapp, CONTACT.whatsappGreeting) ?? '/contact',
    },
    {
      blockType: 'text',
      heading: 'خدمات',
      content: lexical([
        { ul: ['کاشت ناخن', 'ترمیم', 'لمینت', 'لاک ژل', 'پدیکور', 'مژه', 'رنگ و لایت'] },
        { p: 'قیمت هر خدمت را از طریق واتساپ یا تماس تلفنی استعلام کنید.' },
      ]),
    },
    {
      blockType: 'cta',
      style: 'secondary',
      heading: 'آدرس و مسیریابی',
      description: 'آدرس کامل سالن، لینک مسیریابی و نکات مراجعه حضوری در صفحه تماس آمده است.',
      buttonLabel: 'آدرس و راه‌های تماس',
      buttonHref: '/contact',
    },
  ]
}
