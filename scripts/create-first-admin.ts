/**
 * ساخت اولین مدیر (نقش owner) بدون هیچ رمز ثابتی در مخزن.
 * اگر FIRST_ADMIN_EMAIL/FIRST_ADMIN_PASSWORD در .env تنظیم شده باشند از همان‌ها استفاده
 * می‌شود؛ در غیر این صورت یک رمز تصادفی امن ساخته و فقط همین یک‌بار در ترمینال چاپ می‌شود.
 * اگر مدیری با نقش owner از قبل وجود داشته باشد، اسکریپت چیزی نمی‌سازد.
 *
 * اجرا: npm run create-first-admin
 */
import crypto from 'node:crypto'
import config from '@payload-config'
import { getPayload } from 'payload'

function generateSecurePassword(): string {
  return crypto.randomBytes(18).toString('base64url')
}

async function main() {
  const payload = await getPayload({ config })

  const existingOwner = await payload.find({
    collection: 'admin-users',
    where: { role: { equals: 'owner' } },
    limit: 1,
    overrideAccess: true,
  })

  if (existingOwner.totalDocs > 0) {
    console.log('یک مدیر با نقش owner از قبل وجود دارد. کاری انجام نشد.')
    process.exit(0)
  }

  const email = process.env.FIRST_ADMIN_EMAIL
  const password = process.env.FIRST_ADMIN_PASSWORD || generateSecurePassword()

  if (!email) {
    console.error('خطا: FIRST_ADMIN_EMAIL در .env تنظیم نشده است. آن را تنظیم کنید و دوباره اجرا کنید.')
    process.exit(1)
  }

  await payload.create({
    collection: 'admin-users',
    data: { email, password, name: 'مدیر اصلی', role: 'owner' },
    overrideAccess: true,
  })

  console.log('\n✅ اولین مدیر ساخته شد.')
  console.log('ایمیل:', email)
  if (!process.env.FIRST_ADMIN_PASSWORD) {
    console.log('رمز عبور (فقط همین یک‌بار نمایش داده می‌شود، آن را جایی امن ذخیره کنید):')
    console.log('  ', password)
    console.log('\nپیشنهاد می‌شود پس از اولین ورود، رمز عبور را از پنل تغییر دهید.')
  }
  process.exit(0)
}

main().catch((error) => {
  console.error('خطا در ساخت اولین مدیر:', error)
  process.exit(1)
})
