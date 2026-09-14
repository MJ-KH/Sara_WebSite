import { MockPaymentGateway } from './mock'
import { PaymentConfigurationError, type PaymentGateway } from './types'
import { ZarinpalGateway } from './zarinpal'

export type { PaymentGateway } from './types'
export * from './types'

let cached: PaymentGateway | null = null

/**
 * انتخاب adapter از env. طبق سند: در محیط عملیاتی (NODE_ENV=production)، اگر ارائه‌دهنده
 * واقعی انتخاب نشده یا کلید لازم را نداشته باشد، به‌جای سقوط خاموش به حالت آزمایشی، خطای
 * صریح پرتاب می‌شود تا پرداخت واقعی هرگز با درگاه آزمایشی جایگزین نشود.
 */
export function getPaymentGateway(): PaymentGateway {
  if (cached) return cached

  const provider = (process.env.PAYMENT_PROVIDER || 'mock').toLowerCase()
  const isProduction = process.env.NODE_ENV === 'production'

  if (provider === 'mock') {
    if (isProduction) {
      throw new PaymentConfigurationError(
        'PAYMENT_PROVIDER=mock در محیط عملیاتی مجاز نیست. یک درگاه واقعی (مثلاً zarinpal) با کلید معتبر تنظیم کنید.',
      )
    }
    cached = new MockPaymentGateway()
    return cached
  }

  if (provider === 'zarinpal') {
    const gateway = new ZarinpalGateway({
      merchantId: process.env.ZARINPAL_MERCHANT_ID,
      sandbox: process.env.ZARINPAL_SANDBOX !== 'false',
    })
    if (isProduction && !gateway.isFullyConfigured) {
      throw new PaymentConfigurationError(
        'ZARINPAL_MERCHANT_ID تنظیم نشده است. در محیط عملیاتی بدون کلید واقعی نمی‌توان پرداخت پذیرفت.',
      )
    }
    cached = gateway
    return cached
  }

  throw new PaymentConfigurationError(`PAYMENT_PROVIDER نامعتبر: ${provider}`)
}

/** برای آزمون‌های واحد: امکان تزریق mock یا بازنشانی کش */
export function resetPaymentGatewayCache(): void {
  cached = null
}
