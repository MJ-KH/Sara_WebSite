const TONES = {
  success: 'bg-[color-mix(in_srgb,var(--state-success)_14%,transparent)] text-[var(--state-success)]',
  warning: 'bg-[var(--color-accent-soft)] text-[var(--color-primary-strong)]',
  danger: 'bg-[color-mix(in_srgb,var(--state-danger)_12%,transparent)] text-[var(--state-danger)]',
  muted: 'bg-[var(--color-bg-alt)] text-[var(--color-text-muted)]',
} as const

export type StatusTone = keyof typeof TONES

/** برچسب وضعیت کوچک (پرداخت‌شده، در انتظار، لغوشده و …). */
export function StatusPill({ tone, children }: { tone: StatusTone; children: React.ReactNode }) {
  return <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[0.8125rem] font-bold ${TONES[tone]}`}>{children}</span>
}
