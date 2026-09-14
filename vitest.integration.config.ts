import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * این آزمون‌ها به دیتابیس Postgres واقعی نیاز دارند (docker compose up -d postgres) و
 * .env با DATABASE_URI معتبر. جدا از vitest.config.ts نگه داشته شده تا `npm run test:unit`
 * بدون دیتابیس هم قابل اجرا بماند.
 */
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(dirname, 'src'), '@payload-config': path.resolve(dirname, 'src/payload.config.ts') },
  },
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
})
