export type SmsMessageCategory = 'otp' | 'transactional' | 'marketing'

export type SendSmsInput = {
  toE164: string
  body: string
  category: SmsMessageCategory
}

export type SendSmsResult =
  | { ok: true; providerMessageId: string }
  | { ok: false; error: string }

export interface SmsProvider {
  readonly name: string
  readonly isFullyConfigured: boolean
  send(input: SendSmsInput): Promise<SendSmsResult>
}

export class SmsConfigurationError extends Error {}
