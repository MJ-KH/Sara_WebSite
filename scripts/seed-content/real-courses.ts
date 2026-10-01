/**
 * دو دوره واقعی آنلاین سارا که روی اسپات‌پلیر میزبانی می‌شوند (فهرست محتوا و زمان‌ها از پنل
 * اسپات‌پلیر، مهر ۱۴۰۵). ترتیب جلسات همان ترتیب اسپات‌پلیر است؛ فقط برای خوانایی در فصل‌ها
 * گروه‌بندی شده و املای حروف عربی (ك/ي) فارسی شده است.
 *
 * قیمت: ۸٬۵۰۰٬۰۰۰ تومان قیمت پایه، ۲٬۰۰۰٬۰۰۰ تومان با تخفیف (اعلام سارا). در دیتابیس ریال است.
 */
import { FREE_ARTICLES, POWDER_GEL_COURSE } from './jozve-content'
import { lexical } from './site-structure'

type Lesson = { title: string; duration?: string }
type Chapter = { title: string; lessons: Lesson[] }

export type RealCourse = {
  slug: string
  title: string
  subtitle: string
  level: 'beginner' | 'intermediate' | 'advanced'
  topics: string[]
  spotplayerCourseId: string
  coverFilename: string
  featuredOrder: number
  description: ReturnType<typeof lexical>
  toolsAndMaterials: string
  faqs: { question: string; answer: string }[]
  chapters: Chapter[]
}

export const PRICE_RIAL = 20_000_000
export const COMPARE_AT_PRICE_RIAL = 85_000_000

const CERTIFICATE_TEXT = 'در پایان دوره، گواهی پایان دوره (Certificate of Excellence) آکادمی سارا نقی‌زاده به هنرجو داده می‌شود.'
export const CERTIFICATE = { issued: true, description: CERTIFICATE_TEXT }

const WATCH_FAQ = {
  question: 'دوره را چطور تماشا کنم؟',
  answer:
    'دوره در نرم‌افزار اسپات‌پلیر پخش می‌شود. بعد از خرید، کد لایسنس در بخش «دوره‌های من» حساب کاربری‌تان نمایش داده می‌شود؛ نرم‌افزار اسپات‌پلیر را نصب کنید و کد را در آن وارد کنید.',
}

const [powderTools, gelTools, accessoryTools] = POWDER_GEL_COURSE.toolsAndMaterials.split('\n')
const booklet = (question: string) => POWDER_GEL_COURSE.faqs.find((faq) => faq.question === question)!

/** مدت «m:ss» یا «h:mm:ss» به ثانیه */
export function toSeconds(duration?: string): number | null {
  if (!duration) return null
  return duration.split(':').reduce((total, part) => total * 60 + Number(part), 0)
}

export const REAL_COURSES: RealCourse[] = [
  {
    slug: 'kasht-poodr',
    title: 'آموزش ناخن: مبحث پودر',
    subtitle: 'از مانیکور روسی و نصب تیپ تا کاشت با فرمر و قالب، ترمیم و دیزاین آکواریومی',
    level: 'beginner',
    topics: ['powder_gel', 'extensions'],
    spotplayerCourseId: '678105faed42c550e457adc1',
    coverFilename: 'n10.jpg',
    featuredOrder: 1,
    description: lexical([
      { p: 'کاشت پودر را از آماده‌سازی ناخن تا ترمیم، قدم‌به‌قدم و با ویدئوی کامل هر مرحله یاد می‌گیرید:' },
      {
        ul: [
          'مانیکور روسی و انتخاب و نصب درست تیپ',
          'کاشت پودر (کاشت مادر) و کاشت نمازی',
          'کاشت با فرمر و کاشت با قالب',
          'ترمیم پودر و تبدیل کاشت ساده به هلویی',
          'دیزاین زیر کاشت (کاشت آکواریومی)',
          'بهداشت ناخن و شناخت بیماری‌ها',
          'اخلاق حرفه‌ای، فضای مجازی و شروع حرفه‌ای در بازار کار',
        ],
      },
    ]),
    toolsAndMaterials: [powderTools, accessoryTools].join('\n'),
    faqs: [WATCH_FAQ, booklet('کاشت پودر و ژل چه فرقی دارند؟'), booklet('پرایمر بیشتر یعنی چسبندگی بیشتر؟')],
    chapters: [
      { title: 'مقدمه', lessons: [{ title: 'سلام و احوال‌پرسی' }, { title: 'آشنایی با ابزار و مواد' }] },
      {
        title: 'آماده‌سازی ناخن',
        lessons: [
          { title: 'مانیکور روسی', duration: '4:16' },
          { title: 'انتخاب و نصب تیپ', duration: '6:05' },
        ],
      },
      {
        title: 'کاشت پودر',
        lessons: [
          { title: 'کاشت پودر (کاشت مادر)', duration: '15:20' },
          { title: 'کاشت نمازی', duration: '2:03' },
          { title: 'کاشت با فرمر', duration: '13:41' },
          { title: 'کاشت با قالب', duration: '13:02' },
        ],
      },
      {
        title: 'ترمیم و دیزاین',
        lessons: [
          { title: 'ترمیم پودر', duration: '12:24' },
          { title: 'تبدیل کاشت ساده به هلویی', duration: '4:56' },
          { title: 'کاشت آکواریومی (دیزاین زیر کاشت)', duration: '9:41' },
        ],
      },
      {
        title: 'سلامت ناخن و کار حرفه‌ای',
        lessons: [
          { title: 'بهداشت ناخن و بیماری‌ها', duration: '5:08' },
          { title: 'اخلاق حرفه‌ای در محیط کار', duration: '2:38' },
          { title: 'تأثیر فضای مجازی در جذب مشتری', duration: '1:54' },
          { title: 'شروع حرفه‌ای در بازار کار', duration: '3:40' },
        ],
      },
    ],
  },
  {
    slug: 'update-gel',
    title: 'دوره تخصصی آپدیت ژل',
    subtitle: 'پلی‌ژل با قلم، قالب و فرمر، ترمیم پلی‌ژل، لاک ژل ناخن طبیعی و لمینت',
    level: 'intermediate',
    topics: ['powder_gel', 'manicure_prep'],
    spotplayerCourseId: '67a11ea94d6473317a501d04',
    coverFilename: 'n14.jpg',
    featuredOrder: 2,
    description: lexical([
      { p: 'سیستم ژل را در شش بخش عملی و با جزئیات هر مرحله یاد می‌گیرید:' },
      {
        ul: [
          'کاشت پلی‌ژل با قلم، با قالب و با فرمر',
          'ترمیم پلی‌ژل و فرم‌دهی گلدونی',
          'لاک ژل روی ناخن طبیعی، از زیرسازی تا کاور ژل و روغن',
          'لمینت، از فرم‌دهی تا سوهان‌کشی و بافرکشی',
          'مانیکور روسی، طرح فرنچ، کاشت ژورنالی با قالب و ژل‌تیپس',
          'بهداشت ناخن، اخلاق حرفه‌ای و شروع حرفه‌ای در بازار کار',
        ],
      },
    ]),
    toolsAndMaterials: [gelTools, accessoryTools].join('\n'),
    faqs: [WATCH_FAQ, booklet('کاشت پودر و ژل چه فرقی دارند؟')],
    chapters: [
      {
        title: 'مقدمه و اصول کار',
        lessons: [
          { title: 'سلام و احوال‌پرسی' },
          { title: 'بهداشت ناخن و بیماری‌ها', duration: '5:08' },
          { title: 'تأثیر فضای مجازی در جذب مشتری', duration: '1:54' },
          { title: 'اخلاق حرفه‌ای در محیط کار', duration: '2:38' },
          { title: 'شروع حرفه‌ای در بازار کار', duration: '3:40' },
        ],
      },
      {
        title: 'مانیکور، فرنچ و کاشت‌های سریع',
        lessons: [
          { title: 'مانیکور روسی', duration: '4:16' },
          { title: 'مراحل انجام طرح فرنچ', duration: '5:04' },
          { title: 'کاشت ژورنالی با قالب', duration: '9:49' },
          { title: 'آموزش کاشت ژل‌تیپس', duration: '7:32' },
        ],
      },
      {
        title: 'کاشت پلی‌ژل با قلم',
        lessons: [
          { title: 'معرفی ابزار', duration: '1:32' },
          { title: 'آموزش استفاده', duration: '2:00' },
          { title: 'فرم‌دهی', duration: '1:02' },
          { title: 'زیرسازی', duration: '1:11' },
          { title: 'موادگذاری و سوهان‌کشی', duration: '5:16' },
        ],
      },
      {
        title: 'کاشت پلی‌ژل با قالب',
        lessons: [
          { title: 'معرفی مواد', duration: '0:46' },
          { title: 'مانیکور قبل از کاشت با قالب', duration: '2:06' },
          { title: 'آموزش نصب قالب', duration: '3:03' },
          { title: 'نحوه پرس پلی‌ژل داخل قالب', duration: '2:18' },
          { title: 'سوهان‌کشی پلی‌ژل قالب', duration: '3:59' },
        ],
      },
      {
        title: 'کاشت پلی‌ژل با فرمر',
        lessons: [
          { title: 'معرفی مواد', duration: '0:26' },
          { title: 'بیس زدن فرمر', duration: '0:48' },
          { title: 'نصب فرمر کاغذی', duration: '3:39' },
          { title: 'سوهان‌کشی فرمر', duration: '4:14' },
        ],
      },
      {
        title: 'ترمیم پلی‌ژل',
        lessons: [
          { title: 'پاک کردن لاک ژل و مانیکور به همراه زیرسازی', duration: '2:09' },
          { title: 'موادگذاری برای ترمیم پلی‌ژل', duration: '0:59' },
          { title: 'موادگذاری برای ترمیم پلی‌ژل با قلم', duration: '2:28' },
          { title: 'سوهان‌کشی برای ترمیم پلی‌ژل', duration: '2:48' },
          { title: 'فرم‌دهی گلدونی برای ترمیم پلی‌ژل', duration: '3:20' },
          { title: 'مرحله پایانی ترمیم (لاک ژل)', duration: '5:04' },
        ],
      },
      {
        title: 'لاک ژل ناخن طبیعی',
        lessons: [
          { title: 'معرفی ابزار', duration: '1:05' },
          { title: 'لاک ژل روی ناخن طبیعی', duration: '3:31' },
          { title: 'زیرسازی و بیس ژل', duration: '2:30' },
          { title: 'لاک ژل — قسمت ۱', duration: '1:55' },
          { title: 'لاک ژل — قسمت ۲', duration: '2:39' },
          { title: 'تکرار لاک ژل', duration: '1:30' },
          { title: 'کاور ژل و روغن', duration: '2:50' },
        ],
      },
      {
        title: 'لمینت',
        lessons: [
          { title: 'معرفی ابزار', duration: '1:02' },
          { title: 'فرم‌دهی', duration: '1:58' },
          { title: 'مراحل قبل از لمینت', duration: '2:09' },
          { title: 'شروع کار', duration: '1:31' },
          { title: 'ادامه کار (قسمت ۲)', duration: '3:09' },
          { title: 'سوهان‌کشی', duration: '2:09' },
          { title: 'بافرکشی', duration: '0:37' },
        ],
      },
    ],
  },
]

/** دوره مرتبط هر مقاله آموزش رایگان (slug مقاله ← slug دوره) */
export const ARTICLE_COURSE: Record<string, string> = Object.fromEntries(
  FREE_ARTICLES.map((article) => [article.slug, article.slug === 'gel-types' ? 'update-gel' : 'kasht-poodr']),
)

/** دوره‌های نمونه توسعه که با دوره‌های واقعی جایگزین (پیش‌نویس) می‌شوند */
export const SAMPLE_COURSE_SLUGS = ['paye-poodr-gel', 'moadgozari-herfei', 'raf-eshkal']
