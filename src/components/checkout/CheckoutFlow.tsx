'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { OtpLoginForm } from '@/components/auth/OtpLoginForm'
import { Money } from '@/components/ui/Money'
import { SPOTPLAYER_DEVICE_OPTIONS, type SpotPlayerDevice } from '@/lib/spotplayer/constants'

export function CheckoutFlow({
  isLoggedIn: initialLoggedIn,
  kind,
  packageSlug,
  workshopSessionId,
  title,
  priceRial,
  deviceRequired = false,
}: {
  isLoggedIn: boolean
  kind: 'package' | 'workshop_session'
  packageSlug?: string
  workshopSessionId?: string
  title: string
  priceRial: number
  /** دوره روی اسپات‌پلیر است و لایسنس یک‌دستگاهی برای دستگاه انتخابی ساخته می‌شود */
  deviceRequired?: boolean
}) {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(initialLoggedIn)
  const [discountCode, setDiscountCode] = useState('')
  const [device, setDevice] = useState<SpotPlayerDevice | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePay() {
    if (deviceRequired && !device) {
      setError('دستگاهی را که دوره را روی آن می‌بینید انتخاب کنید')
      return
    }
    setLoading(true)
    setError('')
    try {
      const endpoint = kind === 'package' ? '/api/orders' : `/api/workshops/${workshopSessionId}/reserve`
      const body =
        kind === 'package' ? { packageSlug, discountCode: discountCode || undefined, spotplayerDevice: device ?? undefined } : {}
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await response.json()
      if (!response.ok || !result.ok) throw new Error(result.message || 'خطا در ادامه فرایند خرید')
      window.location.href = result.redirectUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته')
      setLoading(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-sm">
        <OtpLoginForm
          onSuccess={() => {
            setIsLoggedIn(true)
            // سربرگ سمت سرور ساخته می‌شود؛ تازه‌سازی تا «ورود / ثبت‌نام» به «حساب من» تبدیل شود
            router.refresh()
          }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4">
      <div className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-4">
        <h2 className="font-bold">{title}</h2>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-muted)]">مبلغ قابل پرداخت</span>
          <Money rial={priceRial} className="font-bold text-[var(--color-primary)]" />
        </div>
      </div>
      {deviceRequired ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="field-label">دوره را روی چه دستگاهی می‌بینید؟</legend>
          <div className="grid grid-cols-1 gap-2">
            {SPOTPLAYER_DEVICE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-[var(--radius-base)] border px-4 transition-colors ${
                  device === option.value
                    ? 'border-[var(--color-primary)] bg-[var(--color-accent-soft)]'
                    : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                }`}
              >
                <input
                  type="radio"
                  name="spotplayer-device"
                  value={option.value}
                  checked={device === option.value}
                  onChange={() => {
                    setDevice(option.value)
                    setError('')
                  }}
                  className="accent-[var(--color-primary)]"
                />
                <span className="text-[0.9375rem]">{option.label}</span>
              </label>
            ))}
          </div>
          <p className="text-[0.8125rem] leading-6 text-[var(--color-text-muted)]">
            لایسنس فقط روی یک دستگاه فعال می‌شود؛ همان دستگاهی را انتخاب کنید که با آن دوره را تماشا می‌کنید.
          </p>
        </fieldset>
      ) : null}
      {kind === 'package' ? (
        <label className="flex flex-col gap-1 text-sm">
          کد تخفیف (اختیاری)
          <input
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-2"
          />
        </label>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button type="button" onClick={handlePay} disabled={loading} className="btn btn-primary p-3 font-bold disabled:opacity-60">
        {loading ? 'در حال انتقال به درگاه...' : 'پرداخت و تکمیل خرید'}
      </button>
      <p className="text-xs text-[var(--color-text-muted)]">
        با پرداخت، شرایط خرید و بازگشت وجه را می‌پذیرید.
      </p>
    </div>
  )
}
