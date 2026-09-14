import { defineConfig, devices } from '@playwright/test'

/**
 * پیش‌نیاز اجرا: docker compose up -d postgres minio minio-init، سپس migrate + seed،
 * و .env با PAYMENT_PROVIDER=mock و ALLOW_OTP_DEBUG_RESPONSE=true (فقط محیط آزمون محلی).
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  timeout: 60_000,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  webServer: process.env.E2E_SKIP_WEBSERVER
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120_000,
      },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
