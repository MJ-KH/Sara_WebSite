import crypto from 'node:crypto'
import type { CreateLicenseInput, CreateLicenseResult, SpotPlayerClient } from './types'

/** حالت آزمایشی (بدون کلید API، فقط محیط توسعه): لایسنس ساختگی می‌سازد، هیچ درخواستی بیرون نمی‌رود. */
export class SpotPlayerMockClient implements SpotPlayerClient {
  readonly name = 'mock' as const

  async createLicense(input: CreateLicenseInput): Promise<CreateLicenseResult> {
    console.log(`[SpotPlayer mock] license for ${input.watermark} courses=${input.courseIds.join(',')} device=${input.device ?? 'default'}`)
    const id = crypto.randomBytes(12).toString('hex')
    return { ok: true, licenseId: id, key: `TEST-${crypto.randomBytes(18).toString('base64url')}`, url: `/mock/${id}/`, isTest: true }
  }
}
