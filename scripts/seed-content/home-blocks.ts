/**
 * محتوای بلوک‌های «راهنمای شروع» و «روش آموزش» صفحه اصلی. متن‌های راهنمای شروع با [نمونه]
 * علامت خورده‌اند و هیچ ادعای واقعی (سابقه، مدرک، تعداد هنرجو) درباره سارا نمی‌سازند؛
 * سارا باید از پنل آن‌ها را با اطلاعات واقعی جایگزین کند.
 */
import { TEACHING_METHOD } from './jozve-content'

/** شناسه‌ها در این پروژه عدد صحیح Postgres هستند */
type Id = number

export function homeStartGuideBlock(packages: { beginner: Id[]; experienced: Id[] }) {
  return {
    blockType: 'startGuide' as const,
    heading: 'از کجا شروع کنم؟',
    intro: '[نمونه] بسته به تجربه‌تان یکی از این مسیرها را انتخاب کنید. اگر مطمئن نیستید، مشاوره رایگان بگیرید.',
    paths: [
      {
        audience: '[نمونه] تازه شروع می‌کنم',
        description:
          '[نمونه] هنوز روی مشتری کار نکرده‌اید یا فقط روی دست خودتان تمرین کرده‌اید. از پایه شروع کنید: شناخت ابزار، زیرسازی و اجرای اولیه.',
        recommendedPackages: packages.beginner,
      },
      {
        audience: '[نمونه] ناخن‌کارم و می‌خواهم حرفه‌ای‌تر شوم',
        description:
          '[نمونه] روی مشتری کار می‌کنید و می‌خواهید موادگذاری تمیزتر، ماندگاری بیشتر و راه‌حل مشکلات رایج را یاد بگیرید.',
        recommendedPackages: packages.experienced,
      },
    ],
  }
}

export const HOME_ABOUT_INTRO_BLOCK = {
  blockType: 'aboutIntro' as const,
  // متن واقعی برگرفته از جزوه سارا (seed-content/jozve-content.ts)
  ...TEACHING_METHOD,
  linkLabel: 'بیشتر درباره سارا',
  linkHref: '/about',
}
