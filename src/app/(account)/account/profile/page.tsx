import { ProfileForm } from '@/components/account/ProfileForm'
import { requireStudent } from '@/lib/auth/get-request-user'
import { getPayloadClient } from '@/lib/get-payload'
import { gregorianToJalali } from '@/lib/jalali'

export default async function ProfilePage() {
  const student = await requireStudent()
  if (!student) return null

  const payload = await getPayloadClient()
  const doc = await payload.findByID({ collection: 'students', id: student.id, overrideAccess: true })

  return (
    <div>
      <h2 className="title-1">اطلاعات من</h2>
      <p className="mb-5 mt-1 text-[0.875rem] text-[var(--color-text-muted)]">این اطلاعات فقط برای ارتباط بهتر با شما استفاده می‌شود.</p>
      <ProfileForm
        currentJalaliYear={gregorianToJalali(new Date()).jy}
        initial={{
          mobile: doc.mobile,
          firstName: doc.firstName,
          lastName: doc.lastName,
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
