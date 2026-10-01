'use client'

import { useState } from 'react'
import { toPersianDigits } from '@/lib/digits'

export type ProfileFormData = {
  mobile: string
  name?: string | null
  email?: string | null
  city?: string | null
  skillLevel?: string | null
  marketingConsent?: boolean | null
  birthdayJalali?: { day?: number | null; month?: number | null; year?: number | null } | null
}

const SKILL_LEVELS = [
  { value: 'beginner', label: 'مبتدی' },
  { value: 'experienced', label: 'دارای تجربه' },
  { value: 'professional', label: 'حرفه‌ای' },
]

const JALALI_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']

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
  // ماه‌های اول تا ششم ۳۱ روزه، هفتم تا یازدهم ۳۰ و اسفند حداکثر ۳۰ روز
  const daysInMonth = Number(form.birthdayMonth) > 6 ? 30 : 31

  function update(patch: Partial<typeof form>) {
    setForm((current) => ({ ...current, ...patch }))
    setStatus('idle')
  }

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
            form.birthdayDay && form.birthdayMonth ? { day: Number(form.birthdayDay), month: Number(form.birthdayMonth) } : undefined,
        }),
      })
      if (!response.ok) throw new Error()
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-soft flex max-w-2xl flex-col gap-5 p-5 md:p-8">
      <div>
        <span className="field-label">شماره موبایل</span>
        <p className="rounded-[var(--radius-base)] bg-[var(--color-bg-alt)] px-4 py-3 text-[var(--color-text-muted)]">
          <span dir="ltr">{toPersianDigits(initial.mobile.replace(/^\+98/, '0'))}</span>
          <span className="ms-2 text-[0.8125rem]">(برای ورود؛ قابل تغییر نیست)</span>
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-name" className="field-label">
            نام و نام خانوادگی
          </label>
          <input id="profile-name" value={form.name} onChange={(e) => update({ name: e.target.value })} autoComplete="name" className="field" />
        </div>
        <div>
          <label htmlFor="profile-city" className="field-label">
            شهر
          </label>
          <input id="profile-city" value={form.city} onChange={(e) => update({ city: e.target.value })} className="field" />
        </div>
        <div>
          <label htmlFor="profile-email" className="field-label">
            ایمیل (اختیاری)
          </label>
          <input
            id="profile-email"
            type="email"
            dir="ltr"
            value={form.email}
            onChange={(e) => update({ email: e.target.value })}
            autoComplete="email"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="profile-skill" className="field-label">
            سطح مهارت
          </label>
          <select id="profile-skill" value={form.skillLevel} onChange={(e) => update({ skillLevel: e.target.value })} className="field">
            <option value="">انتخاب کنید</option>
            {SKILL_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset>
        <legend className="field-label">تاریخ تولد (برای تبریک؛ اختیاری)</legend>
        <div className="grid grid-cols-2 gap-3">
          <select aria-label="روز تولد" value={form.birthdayDay} onChange={(e) => update({ birthdayDay: e.target.value })} className="field">
            <option value="">روز</option>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
              <option key={day} value={day}>
                {toPersianDigits(day)}
              </option>
            ))}
          </select>
          <select aria-label="ماه تولد" value={form.birthdayMonth} onChange={(e) => update({ birthdayMonth: e.target.value })} className="field">
            <option value="">ماه</option>
            {JALALI_MONTHS.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <label className="flex items-start gap-3 text-[0.9375rem]">
        <input
          type="checkbox"
          checked={form.marketingConsent}
          onChange={(e) => update({ marketingConsent: e.target.checked })}
          className="mt-1 size-4 accent-[var(--color-primary)]"
        />
        مایلم پیامک‌های اطلاع‌رسانی دوره‌ها و تخفیف‌ها را دریافت کنم
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={status === 'saving'} className="btn btn-primary disabled:opacity-60">
          {status === 'saving' ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
        </button>
        {status === 'done' ? (
          <p role="status" className="text-sm text-[var(--state-success)]">
            ذخیره شد
          </p>
        ) : null}
        {status === 'error' ? (
          <p role="alert" className="text-sm text-red-600">
            ذخیره ناموفق بود؛ اطلاعات را بررسی کنید.
          </p>
        ) : null}
      </div>
    </form>
  )
}
