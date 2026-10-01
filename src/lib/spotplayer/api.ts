import type { CreateLicenseInput, CreateLicenseResult, SpotPlayerClient } from './types'

const ENDPOINT = 'https://panel.spotplayer.ir/license/edit/'
const TIMEOUT_MS = 20_000

/**
 * اتصال واقعی به API لایسنس اسپات‌پلیر (https://spotplayer.ir/help/api).
 * فقط سمت سرور فراخوانی می‌شود؛ کلید API هرگز به مرورگر نمی‌رسد.
 */
export class SpotPlayerApiClient implements SpotPlayerClient {
  readonly name = 'api' as const

  constructor(
    private readonly apiKey: string,
    private readonly testLicenses: boolean,
  ) {}

  async createLicense(input: CreateLicenseInput): Promise<CreateLicenseResult> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { $API: this.apiKey, $LEVEL: '-1', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test: this.testLicenses,
          course: input.courseIds,
          name: input.name,
          payload: input.payload,
          watermark: { texts: [{ text: input.watermark }] },
        }),
        signal: controller.signal,
      })
      const body = (await response.json().catch(() => null)) as
        | { _id?: string; key?: string; url?: string; ex?: { msg?: string } }
        | null

      if (body?.ex) return { ok: false, error: `spotplayer: ${body.ex.msg || 'unknown error'}`, retryable: response.status >= 500 }
      if (!response.ok) return { ok: false, error: `spotplayer_http_${response.status}`, retryable: response.status >= 500 || response.status === 429 }
      if (!body?._id || !body.key) return { ok: false, error: 'spotplayer_invalid_response', retryable: true }

      return { ok: true, licenseId: body._id, key: body.key, url: body.url || '', isTest: this.testLicenses }
    } catch (error) {
      const message = error instanceof Error && error.name === 'AbortError' ? 'spotplayer_timeout' : `spotplayer_network: ${String(error)}`
      return { ok: false, error: message, retryable: true }
    } finally {
      clearTimeout(timer)
    }
  }
}
