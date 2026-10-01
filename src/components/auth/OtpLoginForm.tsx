'use client'

import { useState } from 'react'

export function OtpLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState<'mobile' | 'code'>('mobile')
  const [mobile, setMobile] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // فقط در حالت پیامک آزمایشی (محیط توسعه) سرور نشانی صندوق آزمایشی را برمی‌گرداند
  const [testInbox, setTestInbox] = useState<string | null>(null)

  async function requestCode(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      })
      const body = await response.json()
      if (!response.ok || !body.ok) throw new Error(body.message || 'خطا در ارسال کد')
      setTestInbox(typeof body.testInbox === 'string' ? body.testInbox : null)
      setStep('code')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته')
    } finally {
      setLoading(false)
    }
  }

  async function verifyCode(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, code }),
      })
      const body = await response.json()
      if (!response.ok || !body.ok) throw new Error(body.message || 'کد نادرست است')
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'mobile') {
    return (
      <form onSubmit={requestCode} className="flex flex-col gap-4">
        <div>
          <label htmlFor="otp-mobile" className="field-label">
            شماره موبایل
          </label>
          <input
            id="otp-mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            placeholder="09xxxxxxxxx"
            className="field text-center"
          />
        </div>
        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={loading} className="btn btn-primary btn-block disabled:opacity-60">
          {loading ? 'در حال ارسال...' : 'دریافت کد ورود'}
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={verifyCode} className="flex flex-col gap-4">
      <p className="text-[0.9375rem] text-[var(--color-text-muted)]">
        کد ورود به شماره <span dir="ltr">{mobile}</span> پیامک شد.
      </p>
      {testInbox ? (
        <div className="rounded-[var(--radius-base)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-accent-soft)] p-3 text-[0.875rem] leading-7">
          <strong>حالت آزمایشی:</strong> پیامک واقعی فرستاده نمی‌شود. کد را از{' '}
          <a href={testInbox} target="_blank" rel="noreferrer" className="font-bold text-[var(--color-primary)] underline">
            صندوق پیامک آزمایشی
          </a>{' '}
          ببینید.
        </div>
      ) : null}
      <div>
        <label htmlFor="otp-code" className="field-label">
          کد تأیید
        </label>
        <input
          id="otp-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          dir="ltr"
          className="field text-center tracking-[0.4em]"
        />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={loading} className="btn btn-primary btn-block disabled:opacity-60">
        {loading ? 'در حال بررسی...' : 'تأیید و ورود'}
      </button>
      <button type="button" onClick={() => setStep('mobile')} className="text-sm text-[var(--color-text-muted)] underline">
        اصلاح شماره موبایل
      </button>
    </form>
  )
}
