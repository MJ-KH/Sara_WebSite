import { expect, test } from '@playwright/test'

/**
 * مسیر کامل: مشاهده پکیج → ورود OTP → خرید آزمایشی → تماشای درس خصوصی (معیارهای پذیرش #۴ تا #۷).
 * پیش‌نیاز: seed اجراشده (npm run seed) و PAYMENT_PROVIDER=mock و ALLOW_OTP_DEBUG_RESPONSE=true.
 */

const PACKAGE_SLUG = 'paye-poodr-gel'
const TEST_MOBILE = `0912${Math.floor(1000000 + Math.random() * 8999999)}`

test('خرید پکیج و تماشای درس خصوصی', async ({ page }) => {
  await page.goto(`/packages/${PACKAGE_SLUG}`)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  await page.getByRole('link', { name: 'خرید پکیج' }).click()
  await expect(page).toHaveURL(new RegExp(`/checkout/${PACKAGE_SLUG}`))

  await page.getByPlaceholder('09xxxxxxxxx').fill(TEST_MOBILE)

  const otpResponsePromise = page.waitForResponse((res) => res.url().includes('/api/auth/otp/request'))
  await page.getByRole('button', { name: 'دریافت کد ورود' }).click()
  const otpResponse = await otpResponsePromise
  const otpBody = await otpResponse.json()
  const code = otpBody.debugCode as string | undefined
  test.skip(!code, 'ALLOW_OTP_DEBUG_RESPONSE=true تنظیم نشده؛ کد OTP در دسترس تست نیست')

  await page.locator('input[inputmode="numeric"]').fill(code as string)
  await page.getByRole('button', { name: 'تأیید و ورود' }).click()

  await expect(page.getByRole('button', { name: /پرداخت و تکمیل خرید/ })).toBeVisible()
  await page.getByRole('button', { name: /پرداخت و تکمیل خرید/ }).click()

  await expect(page).toHaveURL(/\/pay\/mock/)
  await page.getByRole('link', { name: 'پرداخت موفق (آزمایشی)' }).click()

  await expect(page).toHaveURL(/\/checkout\/result\?status=success/)

  await page.goto('/account/my-packages')
  await expect(page.getByText(/پایه پودر و ژل/)).toBeVisible()

  await page.getByText(/پایه پودر و ژل/).click()
  await expect(page.locator('video')).toBeVisible({ timeout: 15_000 })
})
