import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const PUBLIC_BUCKET = process.env.S3_BUCKET_PUBLIC || 'media-public'
// آدرس داخلی ذخیره‌ساز از دید سرور Next (در Docker: http://minio:9000). در زمان build خوانده
// می‌شود چون rewrites در routes-manifest ثبت می‌شوند؛ ر.ک. build arg در Dockerfile.
const S3_INTERNAL_URL = (process.env.S3_INTERNAL_URL || process.env.S3_ENDPOINT || '').replace(/\/$/, '')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * تصاویر عمومی از همان دامنه سایت سرو می‌شوند (/media-public/...) و Next آن‌ها را به
   * ذخیره‌ساز داخلی می‌رساند. این کار هم در Docker محلی (که مرورگر به minio:9000 دسترسی
   * ندارد) و هم برای بهینه‌ساز تصویر Next (که آدرس‌های شبکه داخلی را واکشی نمی‌کند) کار
   * می‌کند. در استقرار با CDN، S3_PUBLIC_BASE_URL را آدرس کامل CDN بگذارید و remotePatterns
   * پایین استفاده می‌شود.
   */
  async rewrites() {
    return S3_INTERNAL_URL ? [{ source: `/${PUBLIC_BUCKET}/:path*`, destination: `${S3_INTERNAL_URL}/${PUBLIC_BUCKET}/:path*` }] : []
  },
  images: {
    remotePatterns: [
      {
        protocol: (process.env.S3_PUBLIC_URL_PROTOCOL as 'http' | 'https') || 'http',
        hostname: process.env.S3_PUBLIC_URL_HOSTNAME || 'localhost',
        port: process.env.S3_PUBLIC_URL_PORT || '9000',
      },
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
