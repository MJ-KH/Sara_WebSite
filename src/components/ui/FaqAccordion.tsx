import { splitSampleMarker } from '@/lib/display'

export type FaqItem = { question: string; answer: string }

/** بدون JavaScript (details/summary) — با صفحه‌کلید و صفحه‌خوان بدون تنظیم اضافه کار می‌کند. */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="flex flex-col border-t border-[var(--color-border)]">
      {items.map((item, index) => (
        <details key={index} className="group border-b border-[var(--color-border)]">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-bold [&::-webkit-details-marker]:hidden">
            <span>{splitSampleMarker(item.question).text}</span>
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-border-strong)] text-[1.125rem] leading-none transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="max-w-[40rem] whitespace-pre-line pb-5 text-[var(--color-text-muted)]">{splitSampleMarker(item.answer).text}</p>
        </details>
      ))}
    </div>
  )
}
