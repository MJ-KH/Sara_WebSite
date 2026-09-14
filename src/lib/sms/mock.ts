import type { SendSmsInput, SendSmsResult, SmsProvider } from './types'

/**
 * ارائه‌دهنده آزمایشی: پیامک واقعی ارسال نمی‌کند، فقط در لاگ سرور ثبت می‌کند. کد OTP یا
 * محتوای پیام هرگز نباید در پاسخ HTTP به مرورگر بازگردانده شود — فقط اینجا در لاگ سرور
 * (برای دیباگ توسعه) چاپ می‌شود.
 */
export class MockSmsProvider implements SmsProvider {
  readonly name = 'mock'
  readonly isFullyConfigured = true

  async send(input: SendSmsInput): Promise<SendSmsResult> {
    console.log(`[SMS mock][${input.category}] to=${input.toE164} body=${input.body}`)
    return { ok: true, providerMessageId: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` }
  }
}
