'use client'

import { useState } from 'react'

export type ProfileFormData = {
  name?: string | null
  email?: string | null
  city?: string | null
  skillLevel?: string | null
  marketingConsent?: boolean | null
  birthdayJalali?: { day?: number | null; month?: number | null; year?: number | null } | null
}

export function ProfileForm({ initial }: { initial: ProfileFormData }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    email: initial.email || '',
    city: initial.city || '',
    skillLevel: initial.skillLevel || '',
    marketingConsent: Boolean(initial.marketingConsent),
    birthdayDay: initial.birthdayJalali?.day?.toString() || '',
    birthdayMonth: initial.birthdayJalali?.month?.toString() || '',
  })
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setStatus('saving')
    try {
      const response = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name || undefined,
          email: form.email || undefined,
          city: form.city || undefined,
          skillLevel: form.skillLevel || undefined,
          marketingConsent: form.marketingConsent,
          birthdayJalali:
            form.birthdayDay && form.birthdayMonth
              ? { day: Number(form.birthdayDay), month: Number(form.birthdayMonth) }
              : undefined,
        }),
      })
      if (!response.ok) throw new Error()
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        نام
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        ایمیل
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        شهر
        <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-2" />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-sm">
          روز تولد (شمسی)
          <input value={form.birthdayDay} onChange={(e) => setForm({ ...form, birthdayDay: e.target.value })} inputMode="numeric" className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          ماه تولد (شمسی)
          <input value={form.birthdayMonth} onChange={(e) => setForm({ ...form, birthdayMonth: e.target.value })} inputMode="numeric" className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-2" />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.marketingConsent} onChange={(e) => setForm({ ...form, marketingConsent: e.target.checked })} />
        مایلم پیامک‌های تبلیغاتی و اطلاع‌رسانی دریافت کنم
      </label>
      {status === 'done' ? <p className="text-sm text-green-700">ذخیره شد</p> : null}
      {status === 'error' ? <p className="text-sm text-red-600">ذخیره ناموفق بود</p> : null}
      <button type="submit" disabled={status === 'saving'} className="btn btn-primary self-start px-4 py-2 text-sm font-bold">
        ذخیره
      </button>
    </form>
  )
}
