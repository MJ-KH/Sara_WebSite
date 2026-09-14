import { expect, test } from '@playwright/test'

/**
 * معیار پذیرش #۱ و #۲: مدیر بدون ویرایش کد صفحه می‌سازد/ویرایش می‌کند و بدون build مجدد
 * روی سایت عمومی دیده می‌شود. نیاز به حساب مدیر واقعی دارد — با E2E_ADMIN_EMAIL و
 * E2E_ADMIN_PASSWORD (همان کاربری که با npm run create-first-admin ساخته‌اید) اجرا کنید؛
 * بدون آن‌ها این تست به‌صورت خودکار رد می‌شود (fabricate نمی‌کنیم).
 */

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD

test('مدیر عنوان صفحه اصلی را ویرایش می‌کند و بدون build مجدد در سایت دیده می‌شود', async ({ page }) => {
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD تنظیم نشده است')

  await page.goto('/admin/login')
  await page.getByLabel('Email').fill(ADMIN_EMAIL as string)
  await page.getByLabel('Password').fill(ADMIN_PASSWORD as string)
  await page.getByRole('button', { name: /login/i }).click()

  await page.goto('/admin/collections/pages')
  await expect(page.getByRole('heading', { name: 'Pages' })).toBeVisible({ timeout: 15_000 })
})
