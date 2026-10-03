import { MyPackages } from '@/components/account/MyPackages'
import { requireStudent } from '@/lib/auth/get-request-user'

/**
 * صفحه اول حساب. در موبایل فقط کارت عضویت و منو (از layout) دیده می‌شود و این محتوا پنهان است؛
 * در دسکتاپ کنار منو، دوره‌های هنرجو نمایش داده می‌شود.
 */
export default async function AccountIndexPage() {
  const student = await requireStudent()
  if (!student) return null
  return <MyPackages studentId={student.id} />
}
