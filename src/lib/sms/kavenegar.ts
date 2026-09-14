import type { SendSmsInput, SendSmsResult, SmsProvider } from './types'

/**
 * پیاده‌سازی کاوه‌نگار طبق مستندات رسمی: https://kavenegar.com/rest.html
 * (بررسی‌شده در زمان توسعه — پیش از استفاده عملیاتی دوباره بررسی کنید).
 * endpoint: POST https://api.kavenegar.com/v1/{API-KEY}/sms/send.json
 * پارامتر receptor باید شماره بدون + باشد (مثلاً 0912...)، بنابراین از فرم E.164 تبدیل می‌شود.
 *
 * نکته: برای OTP، کاوه‌نگار endpoint اختصاصی verify/lookup.json با قالب از‌پیش‌تأییدشده در
 * پنل ارائه می‌دهد که نرخ تحویل بهتری دارد؛ چون نام قالب تأییدشده در این پروژه مشخص نیست،
 * فعلاً از همان sms/send.json عمومی استفاده می‌شود. پیش از انتشار عملیاتی، ساخت و اتصال
 * قالب OTP در پنل کاوه‌نگار و migrate به verify/lookup.json به‌عنوان کار باقی‌مانده مستند
 * شده است (ر.ک. docs/integrations.md).
 */
export class KavenegarSmsProvider implements SmsProvider {
  readonly name = 'kavenegar'

  private readonly apiKey: string | undefined
  private readonly senderLine: string | undefined

  constructor(options: { apiKey: string | undefined; senderLine: string | undefined }) {
    this.apiKey = options.apiKey
    this.senderLine = options.senderLine
  }

  get isFullyConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 0)
  }

  async send(input: SendSmsInput): Promise<SendSmsResult> {
    if (!this.isFullyConfigured || !this.apiKey) {
      return { ok: false, error: 'kavenegar_not_configured' }
    }

    const receptor = input.toE164.replace(/^\+/, '')
    const params = new URLSearchParams({ receptor, message: input.body })
    if (this.senderLine) params.set('sender', this.senderLine)

    const response = await fetch(`https://api.kavenegar.com/v1/${this.apiKey}/sms/send.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    const json = (await response.json()) as {
      return?: { status?: number; message?: string }
      entries?: Array<{ messageid?: number }> | null
    }

    if (json.return?.status !== 200 || !json.entries?.[0]?.messageid) {
      return { ok: false, error: `kavenegar_send_failed:${json.return?.message ?? 'unknown'}` }
    }

    return { ok: true, providerMessageId: String(json.entries[0].messageid) }
  }
}
