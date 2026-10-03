/**
 * پرسش‌های متداول صفحه اول (۱۲ مهر ۱۴۰۵). فقط بر پایه تصمیم‌های قطعی کارفرما نوشته شده‌اند
 * (اسپات‌پلیر، یک دستگاه، ۳۰ روز آفلاین، همه جلسه‌ها باز، پشتیبانی)؛ ادعای تازه‌ای (مثل بازگشت وجه
 * یا مدت دسترسی) ندارند. بلوک faq صفحه home را بازنویسی و منتشر می‌کند.
 *
 * اجرا: npm run apply:faq
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

const FAQ = [
  {
    question: 'چطور دوره مناسب را انتخاب کنم؟',
    answer:
      'اگر تازه شروع می‌کنید، دوره «مبحث پودر» شما را از مانیکور روسی و نصب تیپ تا کاشت با فرمر و قالب و ترمیم، قدم‌به‌قدم جلو می‌برد. اگر با کاشت آشنا هستید و می‌خواهید سیستم ژل را دقیق و به‌روز اجرا کنید، «آپدیت ژل» مناسب شماست. اگر هنوز مطمئن نیستید، فرم مشاوره رایگان پایین همین صفحه را پر کنید تا با شما تماس بگیریم.',
  },
  {
    question: 'دوره‌ها را چطور تماشا کنم؟',
    answer:
      'دوره‌ها روی نرم‌افزار اسپات‌پلیر ارائه می‌شوند. بعد از پرداخت، کد لایسنس شما در «حساب من» نمایش داده می‌شود؛ اسپات‌پلیر را نصب کنید (روی آیفون و آیپد از نسخه وب) و کد را وارد کنید. همه جلسه‌های دوره از همان لحظه برایتان باز است.',
  },
  {
    question: 'روی چند دستگاه می‌توانم دوره را ببینم؟',
    answer:
      'هر خرید یک لایسنس برای یک دستگاه است: اندروید، ویندوز یا آیفون و آیپد (نسخه وب). دستگاه را موقع خرید انتخاب می‌کنید، پس همان دستگاهی را انتخاب کنید که با آن دوره را تماشا می‌کنید. دوره تا ۳۰ روز بدون اینترنت هم قابل تماشاست.',
  },
  {
    question: 'اگر سؤال یا مشکلی داشتم چه کنم؟',
    answer:
      'از بخش «پشتیبانی» در حساب کاربری‌تان پیام بدهید، یا از راه واتساپ و تلگرام با ما در ارتباط باشید؛ تیم سارا پاسخ‌گوی شماست.',
  },
]

async function main() {
  const payload = await getPayload({ config })
  const page = (await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } }, depth: 0, overrideAccess: true })).docs[0]
  if (!page) throw new Error('صفحه home پیدا نشد؛ اول npm run seed را اجرا کنید')
  let found = false
  const layout = (page.layout || []).map((block) => {
    if (block.blockType !== 'faq') return block
    found = true
    return { ...block, heading: 'پرسش‌های متداول', items: FAQ }
  })
  if (!found) throw new Error('بلوک پرسش‌های متداول در صفحه اول نیست')
  await payload.update({ collection: 'pages', id: page.id, data: { layout }, draft: false, overrideAccess: true })
  console.log('home FAQ updated:', FAQ.length, 'items')
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
