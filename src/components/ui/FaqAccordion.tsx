export type FaqItem = { question: string; answer: string }

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="flex flex-col divide-y divide-[var(--color-border)]">
      {items.map((item, index) => (
        <details key={index} className="group py-3">
          <summary className="flex cursor-pointer list-none items-center justify-between font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]">
            <span>{item.question}</span>
            <span aria-hidden="true" className="transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-2 text-sm leading-loose text-[var(--color-text-muted)]">{item.answer}</p>
        </details>
      ))}
    </div>
  )
}
