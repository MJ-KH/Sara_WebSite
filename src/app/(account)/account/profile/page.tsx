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
      <h2 className="title-1 mb-6">پروفایل</h2>
      <ProfileForm
        initial={{
          mobile: doc.mobile,
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
