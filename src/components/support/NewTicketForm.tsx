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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-[var(--radius-base)] border border-[var(--color-border)] p-4">
      <h2 className="font-bold">درخواست جدید</h2>
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
        placeholder="موضوع"
        className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-2 text-sm"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        rows={4}
        placeholder="توضیح درخواست"
        className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-2 text-sm"
      />
      {status === 'error' ? <p className="text-sm text-red-600">ثبت درخواست ناموفق بود</p> : null}
      <button type="submit" disabled={status === 'submitting'} className="btn btn-primary self-start px-4 py-2 text-sm font-bold">
        ارسال
      </button>
    </form>
  )
}
