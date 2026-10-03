/**
 * محتوای بلوک‌های «راهنمای شروع» و «روش آموزش» صفحه اصلی. متن مسیرهای راهنمای شروع را
 * کارفرما تأیید کرده (مهر ۱۴۰۵)؛ هر مسیر به یکی از دو دوره واقعی اسپات‌پلیر می‌رسد.
 */
import { TEACHING_METHOD } from './jozve-content'

/** متن تأییدشده مسیرها (عنوان و توضیح)؛ روی سایت موجود هم همین اعمال شده است */
export const START_GUIDE_PATHS = [
  {
    audience: 'شروع از پایه',
    description:
      'برای شروعی اصولی. دوره مبحث پودر از مانیکور روسی و نصب تیپ تا کاشت با فرمر و قالب و ترمیم، پایه‌ای محکم برای کار حرفه‌ای می‌سازد.',
  },
  {
    audience: 'ارتقای مهارت',
    description: 'اگر با کاشت آشنا هستید و می‌خواهید سیستم ژل را دقیق و به‌روز اجرا کنید: پلی‌ژل با قلم، قالب و فرمر، ترمیم، لاک ژل و لمینت.',
  },
]

/** شناسه‌ها در این پروژه عدد صحیح Postgres هستند */
type Id = number

export function homeStartGuideBlock(packages: { beginner: Id[]; experienced: Id[] }) {
  return {
    blockType: 'startGuide' as const,
    heading: 'از کجا شروع کنم؟',
    intro: 'بسته به تجربه‌تان یکی از این مسیرها را انتخاب کنید. اگر مطمئن نیستید، مشاوره رایگان بگیرید.',
    paths: START_GUIDE_PATHS.map((path, index) => ({
      ...path,
      recommendedPackages: index === 0 ? packages.beginner : packages.experienced,
    })),
  }
}

export const HOME_ABOUT_INTRO_BLOCK = {
  blockType: 'aboutIntro' as const,
  // متن واقعی برگرفته از جزوه سارا (seed-content/jozve-content.ts)
  ...TEACHING_METHOD,
  linkLabel: 'بیشتر درباره سارا',
  linkHref: '/about',
}
