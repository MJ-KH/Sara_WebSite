'use client'

import { useState } from 'react'

export function OtpLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState<'mobile' | 'code'>('mobile')
  const [mobile, setMobile] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      <form onSubmit={requestCode} className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">ورود با موبایل</h2>
        <label className="flex flex-col gap-1 text-sm">
          شماره موبایل
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
            inputMode="tel"
            placeholder="09xxxxxxxxx"
            className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-2"
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="submit" disabled={loading} className="btn btn-primary p-3 font-bold disabled:opacity-60">
          {loading ? 'در حال ارسال...' : 'دریافت کد ورود'}
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={verifyCode} className="flex flex-col gap-3">
      <h2 className="text-lg font-bold">کد ارسال‌شده را وارد کنید</h2>
      <p className="text-sm text-[var(--color-text-muted)]">کد به شماره {mobile} پیامک شد.</p>
      <label className="flex flex-col gap-1 text-sm">
        کد تأیید
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          inputMode="numeric"
          className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-2 tracking-widest"
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button type="submit" disabled={loading} className="btn btn-primary p-3 font-bold disabled:opacity-60">
        {loading ? 'در حال بررسی...' : 'تأیید و ورود'}
      </button>
      <button type="button" onClick={() => setStep('mobile')} className="text-sm text-[var(--color-text-muted)] underline">
        اصلاح شماره موبایل
      </button>
    </form>
  )
}
