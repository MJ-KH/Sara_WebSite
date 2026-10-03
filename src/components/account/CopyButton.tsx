'use client'

import { useState } from 'react'

/** متن را در کلیپ‌بورد کپی می‌کند و چند ثانیه «کپی شد» نشان می‌دهد. */
export function CopyButton({ text, label = 'کپی' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // مرورگرهای قدیمی یا صفحه بدون HTTPS؛ هنرجو می‌تواند متن را دستی انتخاب کند
    }
  }

  return (
    <button type="button" onClick={copy} className="btn btn-sm shrink-0 border-transparent bg-[var(--ink-900)] text-[#f4ecee] hover:bg-[var(--color-primary)]" aria-live="polite">
      {copied ? 'کپی شد ✓' : label}
    </button>
  )
}
