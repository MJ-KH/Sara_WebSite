'use client'

import { useState } from 'react'

export function SessionActionButton({ sessionId, soldOut }: { sessionId: string; soldOut: boolean }) {
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(false)
  const [error, setError] = useState('')

  async function handleEnroll() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/workshops/${sessionId}/reserve`, { method: 'POST' })
      const body = await response.json()
      if (!response.ok || !body.ok) throw new Error(body.message || 'خطا در ثبت‌نام')
      window.location.href = body.redirectUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته')
      setLoading(false)
    }
  }

  async function handleWaitlist() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/workshops/${sessionId}/waitlist`, { method: 'POST' })
      const body = await response.json()
      if (!response.ok || !body.ok) throw new Error(body.message || 'خطا در ثبت‌نام فهرست انتظار')
      setJoined(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته')
    } finally {
      setLoading(false)
    }
  }

  if (joined) return <p className="text-sm text-green-700">در فهرست انتظار ثبت شدید؛ در صورت آزادشدن ظرفیت اطلاع می‌دهیم.</p>

  return (
    <div className="flex flex-col gap-2">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {soldOut ? (
        <button type="button" onClick={handleWaitlist} disabled={loading} className="rounded-[var(--radius-base)] border border-[var(--color-border)] px-4 py-2 text-sm font-bold">
          عضویت در فهرست انتظار
        </button>
      ) : (
        <button type="button" onClick={handleEnroll} disabled={loading} className="btn btn-primary px-4 py-2 text-sm font-bold">
          {loading ? 'در حال انتقال...' : 'ثبت‌نام و پرداخت'}
        </button>
      )}
    </div>
  )
}
