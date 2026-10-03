import { MyPackages } from '@/components/account/MyPackages'
import { requireStudent } from '@/lib/auth/get-request-user'

export default async function MyPackagesPage() {
  const student = await requireStudent()
  if (!student) return null
  return <MyPackages studentId={student.id} />
}
