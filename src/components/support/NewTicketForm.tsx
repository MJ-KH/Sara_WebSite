'use client'

import { useState } from 'react'

export function NewTicketForm() {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setStatus('submitting')
    try {
      const response = await fetch('/api/support-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      })
      if (!response.ok) throw new Error()
      setStatus('done')
      window.location.reload()
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-soft flex flex-col gap-4 p-5 md:p-6">
      <p className="text-[0.9375rem] text-[var(--color-text-muted)]">سؤال یا مشکلی درباره دوره‌ها دارید؟ بنویسید تا پاسخ بدهیم.</p>
      <div>
        <label htmlFor="ticket-subject" className="field-label">
          موضوع
        </label>
        <input id="ticket-subject" value={subject} onChange={(e) => setSubject(e.target.value)} required className="field" />
      </div>
      <div>
        <label htmlFor="ticket-body" className="field-label">
          توضیح
        </label>
        <textarea id="ticket-body" value={body} onChange={(e) => setBody(e.target.value)} required rows={4} className="field" />
      </div>
      {status === 'error' ? (
        <p role="alert" className="text-sm text-red-600">
          ثبت درخواست ناموفق بود؛ دوباره تلاش کنید.
        </p>
      ) : null}
      <button type="submit" disabled={status === 'submitting'} className="btn btn-primary self-start disabled:opacity-60">
        {status === 'submitting' ? 'در حال ارسال...' : 'ارسال درخواست'}
      </button>
    </form>
  )
}
