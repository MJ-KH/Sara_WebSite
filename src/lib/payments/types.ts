export type PaymentCreateInput = {
  orderId: string
  amountRial: number
  description: string
  callbackUrl: string
  payerMobile?: string
  payerEmail?: string
}

export type PaymentCreateResult =
  | { ok: true; redirectUrl: string; providerRefId: string }
  | { ok: false; error: string }

export type PaymentVerifyInput = {
  /** شناسه مرجع ثبت‌شده هنگام ایجاد تراکنش (مثلاً authority زرین‌پال) */
  providerRefId: string
  /** مبلغ صحیح از دیتابیس (منبع حقیقت)، نه از ورودی کاربر */
  expectedAmountRial: number
  /** پارامترهای خام بازگشتی از callback درگاه، برای بررسی دستکاری */
  callbackParams: Record<string, string | string[] | undefined>
}

export type PaymentVerifyResult =
  | { ok: true; providerTransactionId: string; raw: unknown }
  | { ok: false; error: string; raw?: unknown }

export interface PaymentGateway {
  readonly name: string
  /** true اگر تنظیمات لازم (کلید/مرچنت واقعی) برای این ارائه‌دهنده موجود باشد */
  readonly isFullyConfigured: boolean
  createPayment(input: PaymentCreateInput): Promise<PaymentCreateResult>
  verifyPayment(input: PaymentVerifyInput): Promise<PaymentVerifyResult>
}

export class PaymentConfigurationError extends Error {}
