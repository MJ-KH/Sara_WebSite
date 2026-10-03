'use client'

import type React from 'react'
import { useState } from 'react'
import { toPersianDigits } from '@/lib/digits'
import { CityCombobox } from './CityCombobox'

export type ProfileFormData = {
  mobile: string
  firstName?: string | null
  lastName?: string | null
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

/** کارت یک بخش فرم با تیتر کوچک و خط طلایی کنارش (نمونه تأییدشده «اطلاعات من»). */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card-soft p-4 pb-1.5 md:p-6 md:pb-2">
      <h3 className="mb-4 flex items-center gap-2 text-[0.9375rem] font-semibold">
        <span aria-hidden="true" className="h-px w-3.5 bg-[var(--gold)]" />
        {title}
      </h3>
      {children}
    </section>
  )
}

const inputClass =
  'h-12 w-full min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-[0.9375rem] outline-none transition-colors focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)]'
const labelClass = 'mb-1.5 block text-[0.8125rem] text-[var(--color-text-muted)]'

export function ProfileForm({ initial, currentJalaliYear }: { initial: ProfileFormData; currentJalaliYear: number }) {
  const [form, setForm] = useState({
    firstName: initial.firstName || '',
    lastName: initial.lastName || '',
    email: initial.email || '',
    city: initial.city || '',
    skillLevel: initial.skillLevel || '',
    marketingConsent: Boolean(initial.marketingConsent),
    birthdayDay: initial.birthdayJalali?.day?.toString() || '',
    birthdayMonth: initial.birthdayJalali?.month?.toString() || '',
    birthdayYear: initial.birthdayJalali?.year?.toString() || '',
  })
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  // ماه‌های اول تا ششم ۳۱ روزه، هفتم تا یازدهم ۳۰ و اسفند حداکثر ۳۰ روز
  const daysInMonth = Number(form.birthdayMonth) > 6 ? 30 : 31
  // از ۱۰ سال پیش به عقب؛ هنرجوی کم‌سن‌تر از ۱۰ سال معنا ندارد
  const years = Array.from({ length: 80 }, (_, i) => currentJalaliYear - 10 - i)

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
          firstName: form.firstName.trim() || undefined,
          lastName: form.lastName.trim() || undefined,
          email: form.email || undefined,
          city: form.city || undefined,
          skillLevel: form.skillLevel || undefined,
          marketingConsent: form.marketingConsent,
          birthdayJalali:
            form.birthdayDay && form.birthdayMonth
              ? {
                  day: Number(form.birthdayDay),
                  month: Number(form.birthdayMonth),
                  ...(form.birthdayYear ? { year: Number(form.birthdayYear) } : {}),
                }
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
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-4 pb-24 md:pb-0">
      <Section title="مشخصات">
        <div className="mb-4">
          <span className={labelClass}>شماره موبایل</span>
          <div className="flex h-12 items-center justify-between gap-3 rounded-xl bg-[var(--color-bg-alt)] px-3.5">
            <span dir="ltr" className="text-[0.9375rem]">
              {toPersianDigits(initial.mobile.replace(/^\+98/, '0').replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3'))}
            </span>
            <span className="flex items-center gap-1 text-[0.75rem] text-[var(--color-text-muted)]">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3" fill="none" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              برای ورود؛ قابل تغییر نیست
            </span>
          </div>
        </div>
        <div className="grid gap-x-3 sm:grid-cols-2">
          <div className="mb-4">
            <label htmlFor="profile-first-name" className={labelClass}>
              نام
            </label>
            <input
              id="profile-first-name"
              value={form.firstName}
              onChange={(e) => update({ firstName: e.target.value })}
              autoComplete="given-name"
              className={inputClass}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="profile-last-name" className={labelClass}>
              نام خانوادگی
            </label>
            <input
              id="profile-last-name"
              value={form.lastName}
              onChange={(e) => update({ lastName: e.target.value })}
              autoComplete="family-name"
              className={inputClass}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="profile-city" className={labelClass}>
              شهر
            </label>
            <CityCombobox id="profile-city" value={form.city} onChange={(city) => update({ city })} className={inputClass} />
          </div>
          <div className="mb-4">
            <label htmlFor="profile-email" className={labelClass}>
              ایمیل (اختیاری)
            </label>
            <input
              id="profile-email"
              type="email"
              dir="ltr"
              value={form.email}
              onChange={(e) => update({ email: e.target.value })}
              autoComplete="email"
              placeholder="name@example.com"
              className={`${inputClass} text-left`}
            />
          </div>
        </div>
      </Section>

      <Section title="علاقه‌ها و اطلاع‌رسانی">
        <fieldset className="mb-4">
          <legend className={labelClass}>سطح مهارت شما</legend>
          <div className="flex gap-2">
            {SKILL_LEVELS.map((level) => {
              const on = form.skillLevel === level.value
              return (
                <button
                  key={level.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => update({ skillLevel: on ? '' : level.value })}
                  className={`h-11 flex-1 rounded-full border text-[0.875rem] transition-colors ${
                    on
                      ? 'border-[var(--ink-900)] bg-[var(--ink-900)] text-[#f4ecee]'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-strong)]'
                  }`}
                >
                  {level.label}
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset className="mb-4">
          <legend className={labelClass}>تاریخ تولد (اختیاری)</legend>
          <div className="grid grid-cols-[0.8fr_1.35fr_1fr] gap-2">
            <select aria-label="روز تولد" value={form.birthdayDay} onChange={(e) => update({ birthdayDay: e.target.value })} className={inputClass}>
              <option value="">روز</option>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  {toPersianDigits(day)}
                </option>
              ))}
            </select>
            <select aria-label="ماه تولد" value={form.birthdayMonth} onChange={(e) => update({ birthdayMonth: e.target.value })} className={inputClass}>
              <option value="">ماه</option>
              {JALALI_MONTHS.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
            <select aria-label="سال تولد" value={form.birthdayYear} onChange={(e) => update({ birthdayYear: e.target.value })} className={inputClass}>
              <option value="">سال</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {toPersianDigits(year)}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-1.5 text-[0.75rem] text-[var(--color-text-muted)]">روز تولدتان یک پیام تبریک از طرف سارا دریافت می‌کنید.</p>
        </fieldset>

        <div className="flex items-center gap-4 border-t border-[var(--color-border)] py-4">
          <span id="consent-label" className="flex-1 text-[0.875rem] leading-7">
            پیامک دوره‌ها و تخفیف‌ها
            <span className="block text-[0.75rem] text-[var(--color-text-muted)]">هر وقت بخواهید می‌توانید خاموشش کنید.</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={form.marketingConsent}
            aria-labelledby="consent-label"
            onClick={() => update({ marketingConsent: !form.marketingConsent })}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              form.marketingConsent ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border-strong)]'
            }`}
          >
            {/* راست‌چین: حالت روشن، دایره به سمت چپ (انتها) می‌رود */}
            <span
              className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-sm transition-all ${
                form.marketingConsent ? 'left-[3px]' : 'left-[23px]'
              }`}
            />
          </button>
        </div>
      </Section>

      {/* موبایل: دکمه ذخیره پایین صفحه ثابت است؛ دسکتاپ: زیر فرم */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_94%,transparent)] px-4 pb-4 pt-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div className="mx-auto flex max-w-2xl flex-col items-stretch gap-2 md:flex-row md:items-center">
          <button
            type="submit"
            disabled={status === 'saving'}
            className="flex h-12 items-center justify-center rounded-full bg-[var(--ink-900)] px-8 text-[0.9375rem] font-medium text-[#f4ecee] transition-colors hover:bg-[var(--color-primary)] disabled:opacity-60"
          >
            {status === 'saving' ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </button>
          {status === 'done' ? (
            <p role="status" className="text-center text-sm text-[var(--state-success)]">
              ذخیره شد
            </p>
          ) : null}
          {status === 'error' ? (
            <p role="alert" className="text-center text-sm text-red-600">
              ذخیره ناموفق بود؛ اطلاعات را بررسی کنید.
            </p>
          ) : null}
        </div>
      </div>
    </form>
  )
}
