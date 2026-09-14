import type {
  PaymentCreateInput,
  PaymentCreateResult,
  PaymentGateway,
  PaymentVerifyInput,
  PaymentVerifyResult,
} from './types'

/**
 * پیاده‌سازی درگاه زرین‌پال (REST v4 JSON API) طبق مستندات رسمی:
 * https://www.zarinpal.com/docs/paymentGateway/connectToGateway.html
 * (بررسی‌شده در زمان توسعه — پیش از استفاده عملیاتی، نسخه فعلی مستندات را دوباره بررسی کنید).
 *
 * endpointها:
 *  - تولید: POST {base}/pg/v4/payment/request.json
 *  - هدایت کاربر: {base}/pg/StartPay/{authority}
 *  - تأیید: POST {base}/pg/v4/payment/verify.json
 * در sandbox، base از payment.zarinpal.com به sandbox.zarinpal.com تغییر می‌کند
 * (طبق مستندات رسمی sandbox).
 *
 * amount همیشه با currency:"IRR" و به‌عدد صحیح ریال ارسال می‌شود تا با واحد مرجع
 * دیتابیس این پروژه (ریال) یکسان بماند و از ابهام واحد جلوگیری شود.
 */
export class ZarinpalGateway implements PaymentGateway {
  readonly name = 'zarinpal'

  private readonly merchantId: string | undefined
  private readonly sandbox: boolean

  constructor(options: { merchantId: string | undefined; sandbox: boolean }) {
    this.merchantId = options.merchantId
    this.sandbox = options.sandbox
  }

  get isFullyConfigured(): boolean {
    return Boolean(this.merchantId && this.merchantId.length > 0)
  }

  private get baseUrl(): string {
    return this.sandbox ? 'https://sandbox.zarinpal.com' : 'https://payment.zarinpal.com'
  }

  async createPayment(input: PaymentCreateInput): Promise<PaymentCreateResult> {
    if (!this.isFullyConfigured || !this.merchantId) {
      return { ok: false, error: 'zarinpal_not_configured' }
    }

    const response = await fetch(`${this.baseUrl}/pg/v4/payment/request.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        merchant_id: this.merchantId,
        amount: input.amountRial,
        currency: 'IRR',
        description: input.description,
        callback_url: input.callbackUrl,
        metadata: {
          ...(input.payerMobile ? { mobile: input.payerMobile } : {}),
          ...(input.payerEmail ? { email: input.payerEmail } : {}),
          order_id: input.orderId,
        },
      }),
    })

    const json = (await response.json()) as {
      data?: { code?: number; authority?: string; message?: string }
      errors?: unknown
    }

    const code = json.data?.code
    const authority = json.data?.authority
    if (code !== 100 || !authority) {
      return { ok: false, error: `zarinpal_request_failed:${JSON.stringify(json.errors ?? json.data)}` }
    }

    return {
      ok: true,
      redirectUrl: `${this.baseUrl}/pg/StartPay/${authority}`,
      providerRefId: authority,
    }
  }

  async verifyPayment(input: PaymentVerifyInput): Promise<PaymentVerifyResult> {
    if (!this.isFullyConfigured || !this.merchantId) {
      return { ok: false, error: 'zarinpal_not_configured' }
    }

    if (input.callbackParams.Status !== 'OK') {
      return { ok: false, error: 'payment_not_successful', raw: input.callbackParams }
    }

    const response = await fetch(`${this.baseUrl}/pg/v4/payment/verify.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        merchant_id: this.merchantId,
        amount: input.expectedAmountRial,
        currency: 'IRR',
        authority: input.providerRefId,
      }),
    })

    const json = (await response.json()) as {
      data?: { code?: number; ref_id?: number; card_pan?: string; card_hash?: string }
      errors?: unknown
    }

    const code = json.data?.code
    // 100 = تأیید موفق برای اولین بار، 101 = قبلاً تأییدشده (نباید دسترسی دوباره صادر شود؛
    // لایه سرویس سفارش با idempotency key از پردازش مضاعف جلوگیری می‌کند)
    if (code !== 100 && code !== 101) {
      return { ok: false, error: `zarinpal_verify_failed:${JSON.stringify(json.errors ?? json.data)}`, raw: json }
    }

    return {
      ok: true,
      providerTransactionId: String(json.data?.ref_id ?? ''),
      raw: json.data,
    }
  }
}
