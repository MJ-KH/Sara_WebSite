/**
 * محدودکننده نرخ ساده در حافظه پردازه (in-memory sliding window). برای استقرار تک‌نمونه‌ای
 * (این پروژه با docker-compose) کافی است. اگر در آینده اپ روی چند نمونه/replica اجرا شود،
 * باید به یک فروشگاه مشترک (مثلاً جدول دیتابیس یا Redis) منتقل شود — این محدودیت شناخته‌شده
 * در docs/known-limitations.md ثبت شده است.
 */
type Bucket = { count: number; windowStartMs: number }

const buckets = new Map<string, Bucket>()

export function isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || now - bucket.windowStartMs >= windowMs) {
    buckets.set(key, { count: 1, windowStartMs: now })
    return false
  }

  bucket.count += 1
  return bucket.count > maxRequests
}

// جلوگیری از رشد نامحدود حافظه
setInterval(
  () => {
    const now = Date.now()
    for (const [key, bucket] of buckets.entries()) {
      if (now - bucket.windowStartMs > 10 * 60_000) buckets.delete(key)
    }
  },
  5 * 60_000,
).unref?.()
