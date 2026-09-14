import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
