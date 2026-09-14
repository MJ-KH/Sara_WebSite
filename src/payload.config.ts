import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'

import { AdminUsers } from '@/collections/AdminUsers'
import { AuditLog } from '@/collections/AuditLog'
import { Campaigns } from '@/collections/Campaigns'
import { Chapters } from '@/collections/Chapters'
import { ConsultationRequests } from '@/collections/ConsultationRequests'
import { DiscountCodes } from '@/collections/DiscountCodes'
import { Entitlements } from '@/collections/Entitlements'
import { FreeLessonCategories } from '@/collections/FreeLessonCategories'
import { FreeLessons } from '@/collections/FreeLessons'
import { Jobs } from '@/collections/Jobs'
import { LessonProgress } from '@/collections/LessonProgress'
import { Lessons } from '@/collections/Lessons'
import { MediaPrivate } from '@/collections/MediaPrivate'
import { MediaPublic } from '@/collections/MediaPublic'
import { MessageTemplates } from '@/collections/MessageTemplates'
import { OtpCodes } from '@/collections/OtpCodes'
import { Orders } from '@/collections/Orders'
import { Packages } from '@/collections/Packages'
import { Pages } from '@/collections/Pages'
import { PaymentAttempts } from '@/collections/PaymentAttempts'
import { Redirects } from '@/collections/Redirects'
import { Students } from '@/collections/Students'
import { SupportTickets } from '@/collections/SupportTickets'
import { Testimonials } from '@/collections/Testimonials'
import { WorkshopEnrollments } from '@/collections/WorkshopEnrollments'
import { WorkshopReservations } from '@/collections/WorkshopReservations'
import { WorkshopSessions } from '@/collections/WorkshopSessions'
import { WorkshopWaitlist } from '@/collections/WorkshopWaitlist'
import { Workshops } from '@/collections/Workshops'
import { SiteSettings } from '@/globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const MAX_VIDEO_BYTES = Number(process.env.UPLOAD_MAX_VIDEO_MB || 2048) * 1024 * 1024

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  secret: process.env.PAYLOAD_SECRET || '',
  admin: {
    user: AdminUsers.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: '- پنل مدیریت سارا نقی‌زاده',
    },
  },
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI },
  }),
  collections: [
    AdminUsers,
    Students,
    OtpCodes,
    MediaPublic,
    MediaPrivate,
    Packages,
    Chapters,
    Lessons,
    Orders,
    PaymentAttempts,
    Entitlements,
    LessonProgress,
    DiscountCodes,
    Workshops,
    WorkshopSessions,
    WorkshopReservations,
    WorkshopEnrollments,
    WorkshopWaitlist,
    FreeLessonCategories,
    FreeLessons,
    Testimonials,
    ConsultationRequests,
    SupportTickets,
    Pages,
    MessageTemplates,
    Campaigns,
    Jobs,
    AuditLog,
    Redirects,
  ],
  globals: [SiteSettings],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  upload: {
    limits: { fileSize: MAX_VIDEO_BYTES },
  },
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'],
  cors: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'],
  plugins: [
    s3Storage({
      collections: { media: { disablePayloadAccessControl: true } },
      bucket: process.env.S3_BUCKET_PUBLIC || 'media-public',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'us-east-1',
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
      acl: 'public-read',
    }),
    s3Storage({
      // disablePayloadAccessControl عمداً ست نشده (پیش‌فرض false) — فایل خصوصی از پروکسی
      // Payload با access control خود کالکشن رد می‌شود، نه URL مستقیم S3.
      collections: { 'media-private': true },
      bucket: process.env.S3_BUCKET_PRIVATE || 'media-private',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'us-east-1',
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
})
