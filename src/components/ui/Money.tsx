import { formatToman } from '@/lib/money'

export function Money({ rial, className }: { rial: number; className?: string }) {
  return <span className={className}>{formatToman(rial)}</span>
}
