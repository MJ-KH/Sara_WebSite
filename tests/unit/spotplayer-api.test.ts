import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildDeviceLimits, SpotPlayerApiClient } from '@/lib/spotplayer/api'

const input = { courseIds: ['678105faed42c550e457adc1'], name: '09120000123', watermark: '09120000123', payload: 'entitlement:1', device: 'android' as const }

function mockFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('SpotPlayerApiClient', () => {
  it('درخواست را با هدرهای $API و $LEVEL و واترمارک موبایل می‌فرستد', async () => {
    const fetchMock = mockFetch(200, { _id: 'lic1', key: 'KEY123', url: '/a/b/' })
    const result = await new SpotPlayerApiClient('secret-key', true).createLicense(input)

    expect(result).toEqual({ ok: true, licenseId: 'lic1', key: 'KEY123', url: '/a/b/', isTest: true })
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit & { headers: Record<string, string>; body: string }]
    expect(url).toBe('https://panel.spotplayer.ir/license/edit/')
    expect(init.headers).toMatchObject({ $API: 'secret-key', $LEVEL: '-1' })
    const body = JSON.parse(init.body)
    expect(body).toMatchObject({ test: true, course: input.courseIds, name: input.name, watermark: { texts: [{ text: '09120000123' }] } })
    expect(body.offline).toBe(30)
    expect(body.data).toEqual({ limit: { '678105faed42c550e457adc1': '0-' } })
    expect(body.device).toEqual({ p0: 1, p1: 0, p2: 0, p3: 0, p4: 1, p5: 0, p6: 0 })
  })

  it('برای هر دستگاه انتخابی فقط همان سیستم یک سهم دارد', () => {
    expect(buildDeviceLimits('windows')).toMatchObject({ p0: 1, p1: 1, p4: 0, p6: 0 })
    expect(buildDeviceLimits('ios_web')).toMatchObject({ p0: 1, p1: 0, p5: 0, p6: 1 })
    // بدون انتخاب: فقط سقف یک دستگاه، نوع از پیش‌فرض پنل
    expect(buildDeviceLimits(null)).toEqual({ p0: 1 })
  })

  it('خطای اعلام‌شده اسپات‌پلیر (ex) را بدون تلاش دوباره برمی‌گرداند', async () => {
    mockFetch(200, { ex: { msg: 'invalid course' } })
    const result = await new SpotPlayerApiClient('k', false).createLicense(input)
    expect(result).toEqual({ ok: false, error: 'spotplayer: invalid course', retryable: false })
  })

  it('خطای سرور را قابل تلاش دوباره می‌داند', async () => {
    mockFetch(503, {})
    const result = await new SpotPlayerApiClient('k', false).createLicense(input)
    expect(result).toMatchObject({ ok: false, retryable: true })
  })

  it('قطع شبکه را قابل تلاش دوباره می‌داند', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')))
    const result = await new SpotPlayerApiClient('k', false).createLicense(input)
    expect(result).toMatchObject({ ok: false, retryable: true })
  })

  it('پاسخ بدون کلید لایسنس را موفق حساب نمی‌کند', async () => {
    mockFetch(200, { _id: 'lic1' })
    const result = await new SpotPlayerApiClient('k', false).createLicense(input)
    expect(result).toMatchObject({ ok: false, retryable: true })
  })
})
