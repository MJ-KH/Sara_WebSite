import { SPOTPLAYER_DEVICE_COUNT, SPOTPLAYER_DEVICES, SPOTPLAYER_OFFLINE_DAYS } from './constants'
import type { CreateLicenseInput, CreateLicenseResult, SpotPlayerClient } from './types'

const ENDPOINT = 'https://panel.spotplayer.ir/license/edit/'
const TIMEOUT_MS = 20_000

/** p0 = کل دستگاه‌ها؛ p1..p6 = ویندوز، مک، لینوکس، اندروید، iOS، نسخه وب */
const PLATFORM_FIELDS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'] as const

/**
 * محدودیت دستگاه لایسنس: همیشه یک دستگاه در کل، و اگر هنرجو دستگاهش را انتخاب کرده،
 * فقط همان سیستم یک سهم دارد و بقیه صفر.
 */
export function buildDeviceLimits(device: CreateLicenseInput['device']): Record<string, number> {
  const limits: Record<string, number> = { p0: SPOTPLAYER_DEVICE_COUNT }
  if (!device) return limits
  const chosen = SPOTPLAYER_DEVICES[device].apiField
  for (const field of PLATFORM_FIELDS) limits[field] = field === chosen ? SPOTPLAYER_DEVICE_COUNT : 0
  return limits
}

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
          offline: SPOTPLAYER_OFFLINE_DAYS,
          // همه جلسه‌ها از لحظه خرید باز است (فروش قسطی نداریم)
          data: { limit: Object.fromEntries(input.courseIds.map((id) => [id, '0-'])) },
          // فقط متن واترمارک (موبایل)؛ جا، اندازه و رنگ از پیش‌فرض پنل اسپات‌پلیر
          watermark: { texts: [{ text: input.watermark }] },
          device: buildDeviceLimits(input.device),
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
