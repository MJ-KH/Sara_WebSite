import type {
  PaymentCreateInput,
  PaymentCreateResult,
  PaymentGateway,
  PaymentVerifyInput,
  PaymentVerifyResult,
} from './types'

/**
 * درگاه آزمایشی برای توسعه محلی و آزمون خودکار. هیچ اتصال شبکه‌ای واقعی برقرار نمی‌کند.
 *
 * نکته امنیتی مهم: این کلاس عمداً مبلغ را از callback نمی‌خواند/تأیید نمی‌کند — چون در
 * معماری این پروژه، مبلغ هرگز از پارامترهای callback (قابل دستکاری توسط کاربر) خوانده
 * نمی‌شود؛ لایه سرویس سفارش («src/lib/orders/complete-order.ts») همیشه مبلغ را از ردیف
 * PaymentAttempt در دیتابیس (ثبت‌شده هنگام ایجاد تراکنش، قبل از هدایت کاربر) می‌خواند و
 * همان را به‌عنوان expectedAmountRial به verifyPayment می‌دهد. بنابراین «دستکاری مبلغ در
 * URL بازگشت» در این معماری اثری روی مبلغ نهایی ندارد، صرف‌نظر از رفتار خود درگاه.
 */
export class MockPaymentGateway implements PaymentGateway {
  readonly name = 'mock'
  readonly isFullyConfigured = true

  async createPayment(input: PaymentCreateInput): Promise<PaymentCreateResult> {
    const providerRefId = `MOCK${cryptoRandomId()}`
    const redirectUrl = `/pay/mock?authority=${encodeURIComponent(providerRefId)}&callback=${encodeURIComponent(
      input.callbackUrl,
    )}&desc=${encodeURIComponent(input.description)}`
    return { ok: true, redirectUrl, providerRefId }
  }

  async verifyPayment(input: PaymentVerifyInput): Promise<PaymentVerifyResult> {
    const status = input.callbackParams.Status
    if (status !== 'OK') {
      return { ok: false, error: 'payment_not_successful', raw: input.callbackParams }
    }
    return {
      ok: true,
      providerTransactionId: `MOCKTXN_${input.providerRefId}`,
      raw: { ...input.callbackParams, verifiedAmountRial: input.expectedAmountRial },
    }
  }
}

function cryptoRandomId(): string {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 36).toString(36)).join('')
}
