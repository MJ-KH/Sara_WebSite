import { KavenegarSmsProvider } from './kavenegar'
import { MockSmsProvider } from './mock'
import { SmsConfigurationError, type SmsProvider } from './types'

export * from './types'

let cached: SmsProvider | null = null

export function getSmsProvider(): SmsProvider {
  if (cached) return cached

  const provider = (process.env.SMS_PROVIDER || 'mock').toLowerCase()
  const isProduction = process.env.NODE_ENV === 'production'

  if (provider === 'mock') {
    if (isProduction) {
      throw new SmsConfigurationError(
        'SMS_PROVIDER=mock در محیط عملیاتی مجاز نیست. یک ارائه‌دهنده واقعی (مثلاً kavenegar) با کلید معتبر تنظیم کنید.',
      )
    }
    cached = new MockSmsProvider()
    return cached
  }

  if (provider === 'kavenegar') {
    const gateway = new KavenegarSmsProvider({
      apiKey: process.env.KAVENEGAR_API_KEY,
      senderLine: process.env.KAVENEGAR_SENDER_LINE,
    })
    if (isProduction && !gateway.isFullyConfigured) {
      throw new SmsConfigurationError(
        'KAVENEGAR_API_KEY تنظیم نشده است. در محیط عملیاتی بدون کلید واقعی نمی‌توان پیامک ارسال کرد.',
      )
    }
    cached = gateway
    return cached
  }

  throw new SmsConfigurationError(`SMS_PROVIDER نامعتبر: ${provider}`)
}

export function resetSmsProviderCache(): void {
  cached = null
}
