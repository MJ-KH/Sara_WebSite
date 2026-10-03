import type { SpotPlayerDevice } from './constants'

export type CreateLicenseInput = {
  /** شناسه دوره‌ها در اسپات‌پلیر */
  courseIds: string[]
  /** نام نمایشی هنرجو در پنل اسپات‌پلیر */
  name: string
  /** متن واترمارک روی ویدئو (شماره موبایل هنرجو) */
  watermark: string
  /** مقداری که هنگام رفتن هنرجو به صفحه پشتیبانی برگردانده می‌شود */
  payload?: string
  /** دستگاهی که هنرجو هنگام خرید انتخاب کرده؛ بدون آن، نوع دستگاه از پیش‌فرض پنل اسپات‌پلیر می‌آید */
  device?: SpotPlayerDevice | null
}

export type CreateLicenseResult =
  | { ok: true; licenseId: string; key: string; url: string; isTest: boolean }
  /** retryable: خطای شبکه/سرور که با تلاش دوباره ممکن است حل شود */
  | { ok: false; error: string; retryable: boolean }

export interface SpotPlayerClient {
  readonly name: 'api' | 'mock'
  createLicense(input: CreateLicenseInput): Promise<CreateLicenseResult>
}

export class SpotPlayerConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SpotPlayerConfigurationError'
  }
}
