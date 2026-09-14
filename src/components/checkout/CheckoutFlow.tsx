'use client'

import { useState } from 'react'
import { OtpLoginForm } from '@/components/auth/OtpLoginForm'
import { Money } from '@/components/ui/Money'

export function CheckoutFlow({
  isLoggedIn: initialLoggedIn,
  kind,
  packageSlug,
  workshopSessionId,
  title,
  priceRial,
}: {
  isLoggedIn: boolean
  kind: 'package' | 'workshop_session'
  packageSlug?: string
  workshopSessionId?: string
  title: string
  priceRial: number
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(initialLoggedIn)
  const [discountCode, setDiscountCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePay() {
    setLoading(true)
    setError('')
    try {
      const endpoint = kind === 'package' ? '/api/orders' : `/api/workshops/${workshopSessionId}/reserve`
      const body = kind === 'package' ? { packageSlug, discountCode: discountCode || undefined } : {}
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
        <OtpLoginForm onSuccess={() => setIsLoggedIn(true)} />
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
