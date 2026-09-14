import { requireStudent } from '@/lib/auth/get-request-user'
import { getPayloadClient } from '@/lib/get-payload'
import { formatJalaliDate } from '@/lib/jalali'
import { Money } from '@/components/ui/Money'

const STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار پرداخت',
  paid: 'پرداخت‌شده',
  failed: 'ناموفق',
  canceled: 'لغوشده',
  refund_requested: 'درخواست بازگشت وجه',
  refunded: 'بازگشت‌داده‌شده',
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
      <h1 className="mb-6 text-xl font-bold">سفارش‌ها</h1>
      {orders.docs.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">هنوز سفارشی ثبت نکرده‌اید.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-right text-[var(--color-text-muted)]">
                <th className="py-2">عنوان</th>
                <th className="py-2">مبلغ</th>
                <th className="py-2">وضعیت</th>
                <th className="py-2">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {orders.docs.map((order) => (
                <tr key={order.id} className="border-b border-[var(--color-border)]">
                  <td className="py-2">{order.titleSnapshot}</td>
                  <td className="py-2">
                    <Money rial={order.totalRialSnapshot} />
                  </td>
                  <td className="py-2">{STATUS_LABELS[order.status] || order.status}</td>
                  <td className="py-2">{formatJalaliDate(new Date(order.createdAt))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
