import type { SendSmsInput, SendSmsResult, SmsProvider } from './types'

export type MockSmsMessage = { to: string; body: string; category: string; sentAt: string }

const OUTBOX_LIMIT = 20
// روی globalThis تا با hot reload محیط توسعه پاک نشود
const store = globalThis as typeof globalThis & { __mockSmsOutbox?: MockSmsMessage[] }

/** آخرین پیامک‌های «ارسال‌شده» در حالت آزمایشی، جدیدترین اول (فقط در حافظه همین پردازه). */
export function getMockOutbox(): MockSmsMessage[] {
  return [...(store.__mockSmsOutbox ?? [])].reverse()
}

/**
 * ارائه‌دهنده آزمایشی: پیامک واقعی ارسال نمی‌کند؛ پیام را در لاگ سرور و در صندوق آزمایشی
 * حافظه (صفحه /dev/sms، فقط در محیط توسعه) نگه می‌دارد. کد OTP هرگز در پاسخ API ورود
 * به مرورگر برگردانده نمی‌شود.
 */
export class MockSmsProvider implements SmsProvider {
  readonly name = 'mock'
  readonly isFullyConfigured = true

  async send(input: SendSmsInput): Promise<SendSmsResult> {
    console.log(`[SMS mock][${input.category}] to=${input.toE164} body=${input.body}`)
    const outbox = (store.__mockSmsOutbox ??= [])
    outbox.push({ to: input.toE164, body: input.body, category: input.category, sentAt: new Date().toISOString() })
    if (outbox.length > OUTBOX_LIMIT) outbox.splice(0, outbox.length - OUTBOX_LIMIT)
    return { ok: true, providerMessageId: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` }
  }
}
