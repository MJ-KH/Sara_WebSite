import { ProfileForm } from '@/components/account/ProfileForm'
import { requireStudent } from '@/lib/auth/get-request-user'
import { getPayloadClient } from '@/lib/get-payload'

export default async function ProfilePage() {
  const student = await requireStudent()
  if (!student) return null

  const payload = await getPayloadClient()
  const doc = await payload.findByID({ collection: 'students', id: student.id, overrideAccess: true })

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">پروفایل</h1>
      <ProfileForm
        initial={{
          name: doc.name,
          email: doc.email,
          city: doc.city,
          skillLevel: doc.skillLevel,
          marketingConsent: doc.marketingConsent,
          birthdayJalali: doc.birthdayJalali,
        }}
      />
    </div>
  )
}
