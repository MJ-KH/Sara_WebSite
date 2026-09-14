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
      <div className="rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-accent-soft)] p-6 text-center">
        درخواست شما ثبت شد. به‌زودی با شما تماس گرفته می‌شود.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-3">
      {heading ? <h2 className="text-xl font-bold">{heading}</h2> : null}
      {description ? <p className="text-sm text-[var(--color-text-muted)]">{description}</p> : null}
      <label className="flex flex-col gap-1 text-sm">
        نام
        <input name="name" required className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        موبایل
        <input
          name="mobile"
          required
          inputMode="tel"
          className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        شهر
        <input name="city" className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        سطح
        <select name="skillLevel" className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-2">
          <option value="">انتخاب کنید</option>
          <option value="beginner">مبتدی</option>
          <option value="experienced">دارای تجربه</option>
          <option value="professional">حرفه‌ای</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        هدف از یادگیری
        <textarea name="goal" rows={3} className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-2" />
      </label>
      {status === 'error' ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
      <button type="submit" disabled={status === 'submitting'} className="btn btn-primary p-3 font-bold disabled:opacity-60">
        {status === 'submitting' ? 'در حال ارسال...' : 'ارسال درخواست مشاوره'}
      </button>
    </form>
  )
}
