/** برچسب «داده نمونه» — تا اطلاعات تأییدنشده با محتوای واقعی سارا اشتباه گرفته نشود. */
export function SampleBadge() {
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full border border-dashed border-[var(--color-border-strong)] px-2 py-0.5 text-[0.6875rem] font-semibold leading-5 text-[var(--color-text-muted)]"
      title="این محتوا داده نمونه است و هنوز توسط سارا تأیید نشده"
    >
      نمونه
    </span>
  )
}
