'use client'

import { useState } from 'react'

export function ConsultationForm({ heading, description }: { heading?: string; description?: string }) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setErrorMessage('')
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/consultation-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          mobile: form.get('mobile'),
          city: form.get('city'),
          skillLevel: form.get('skillLevel'),
          goal: form.get('goal'),
        }),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.message || 'ثبت درخواست ناموفق بود')
      }
      setStatus('done')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'خطای ناشناخته')
    }
  }

  if (status === 'done') {
    return (
      <div role="status" className="py-6 text-center">
        <p className="title-1">درخواست شما ثبت شد</p>
        <p className="mt-2 text-[var(--color-text-muted)]">به‌زودی برای مشاوره با شما تماس گرفته می‌شود.</p>
      </div>
    )
  }

  const field =
    'min-h-12 w-full rounded-[var(--radius-base)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-2.5 transition-colors focus:border-[var(--color-primary)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]'
  const label = 'flex flex-col gap-1.5 text-[0.9375rem] font-semibold'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {heading ? <h2 className="title-1">{heading}</h2> : null}
      {description ? <p className="-mt-1 text-[var(--color-text-muted)]">{description}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>
          نام
          <input name="name" required autoComplete="name" className={field} />
        </label>
        <label className={label}>
          موبایل
          <input name="mobile" required inputMode="tel" autoComplete="tel" dir="ltr" placeholder="۰۹۱۲ ..." className={`${field} text-end`} />
        </label>
        <label className={label}>
          شهر
          <input name="city" autoComplete="address-level2" className={field} />
        </label>
        <label className={label}>
          سطح
          <select name="skillLevel" className={field}>
            <option value="">انتخاب کنید</option>
            <option value="beginner">مبتدی</option>
            <option value="experienced">دارای تجربه</option>
            <option value="professional">حرفه‌ای</option>
          </select>
        </label>
      </div>
      <label className={label}>
        هدف از یادگیری
        <textarea name="goal" rows={3} className={`${field} py-3`} />
      </label>
      {status === 'error' ? (
        <p role="alert" className="text-[0.9375rem] text-[var(--state-danger)]">
          {errorMessage}
        </p>
      ) : null}
      <button type="submit" disabled={status === 'submitting'} className="btn btn-primary btn-lg mt-1 disabled:opacity-60 sm:self-start">
        {status === 'submitting' ? 'در حال ارسال...' : 'ارسال درخواست مشاوره'}
      </button>
    </form>
  )
}
