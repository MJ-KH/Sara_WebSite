import Link from 'next/link'
import { Money } from '@/components/ui/Money'
import { StatusPill, type StatusTone } from '@/components/ui/StatusPill'
import { requireStudent } from '@/lib/auth/get-request-user'
import { splitSampleMarker } from '@/lib/display'
import { getPayloadClient } from '@/lib/get-payload'
import { formatJalaliDate } from '@/lib/jalali'

const STATUS: Record<string, { label: string; tone: StatusTone }> = {
  pending: { label: 'در انتظار پرداخت', tone: 'warning' },
  paid: { label: 'پرداخت‌شده', tone: 'success' },
  failed: { label: 'ناموفق', tone: 'danger' },
  canceled: { label: 'لغوشده', tone: 'muted' },
  refund_requested: { label: 'درخواست بازگشت وجه', tone: 'warning' },
  refunded: { label: 'بازگشت داده شد', tone: 'muted' },
}

export default async function OrdersPage() {
  const student = await requireStudent()
  if (!student) return null

  const payload = await getPayloadClient()
  const orders = await payload.find({
    collection: 'orders',
    where: { student: { equals: student.id } },
    sort: '-createdAt',
    limit: 100,
    overrideAccess: true,
  })

  return (
    <div>
      <h2 className="title-1 mb-6">سفارش‌ها</h2>
      {orders.docs.length === 0 ? (
        <div className="card-soft p-8 text-center">
          <p className="text-[var(--color-text-muted)]">هنوز سفارشی ثبت نکرده‌اید.</p>
          <Link href="/packages" className="btn btn-primary mt-5">
            مشاهده دوره‌ها
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.docs.map((order) => {
            const status = STATUS[order.status] ?? { label: order.status, tone: 'muted' as const }
            return (
              <li key={order.id} className="card-soft flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-bold">{splitSampleMarker(order.titleSnapshot).text}</p>
                  <p className="mt-1 text-[0.875rem] text-[var(--color-text-muted)]">{formatJalaliDate(new Date(order.createdAt))}</p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <Money rial={order.totalRialSnapshot} className="font-extrabold" />
                  <StatusPill tone={status.tone}>{status.label}</StatusPill>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
