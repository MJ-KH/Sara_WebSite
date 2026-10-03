import { Money } from '@/components/ui/Money'
import { toPersianDigits } from '@/lib/digits'
import { discountPercent } from '@/lib/money'

/** قیمت نهایی، قیمت قبل خط‌خورده و برچسب درصد تخفیف — همان ظاهر کارت دوره. */
export function PriceWithDiscount({ priceRial, compareAtPriceRial }: { priceRial: number; compareAtPriceRial?: number | null }) {
  const percent = discountPercent(priceRial, compareAtPriceRial)
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <Money rial={priceRial} className="text-[1.1rem] font-semibold text-[var(--color-text)]" />
      {percent > 0 ? (
        <>
          <span className="text-[0.875rem] text-[var(--color-text-muted)] line-through decoration-[var(--gold)]">
            <Money rial={compareAtPriceRial as number} />
          </span>
          <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-0.5 text-[0.75rem] font-semibold text-[var(--color-primary)]">
            {toPersianDigits(percent)}٪ تخفیف
          </span>
        </>
      ) : null}
    </div>
  )
}
