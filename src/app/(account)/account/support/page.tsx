import { NewTicketForm } from '@/components/support/NewTicketForm'
import { StatusPill, type StatusTone } from '@/components/ui/StatusPill'
import { requireStudent } from '@/lib/auth/get-request-user'
import { getPayloadClient } from '@/lib/get-payload'
import { formatJalaliDate } from '@/lib/jalali'

const STATUS: Record<string, { label: string; tone: StatusTone }> = {
  open: { label: 'در انتظار پاسخ', tone: 'warning' },
  answered: { label: 'پاسخ داده شد', tone: 'success' },
  closed: { label: 'بسته', tone: 'muted' },
}

export default async function SupportPage() {
  const student = await requireStudent()
  if (!student) return null

  const payload = await getPayloadClient()
  const tickets = await payload.find({
    collection: 'support-tickets',
    where: { student: { equals: student.id } },
    sort: '-updatedAt',
    limit: 50,
    overrideAccess: true,
  })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="title-1 mb-6">پشتیبانی</h2>
        <NewTicketForm />
      </div>

      {tickets.docs.length > 0 ? (
        <div>
          <h3 className="title-2 mb-4">درخواست‌های قبلی</h3>
          <ul className="flex flex-col gap-4">
            {tickets.docs.map((ticket) => {
              const status = STATUS[ticket.status] ?? { label: ticket.status, tone: 'muted' as const }
              return (
                <li key={ticket.id} className="card-soft p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold">{ticket.subject}</p>
                    <StatusPill tone={status.tone}>{status.label}</StatusPill>
                  </div>
                  <p className="mt-1 text-[0.8125rem] text-[var(--color-text-muted)]">{formatJalaliDate(new Date(ticket.createdAt))}</p>
                  <div className="mt-4 flex flex-col gap-2">
                    {(ticket.messages || []).map((message, index) => {
                      const fromStudent = message.from === 'student'
                      return (
                        <div
                          key={index}
                          className={`max-w-[85%] rounded-[var(--radius-media)] px-4 py-3 text-[0.9375rem] leading-[1.9] ${
                            fromStudent ? 'self-start bg-[var(--color-bg-alt)]' : 'self-end bg-[var(--color-accent-soft)]'
                          }`}
                        >
                          <span className="mb-0.5 block text-[0.75rem] font-bold text-[var(--color-text-muted)]">{fromStudent ? 'شما' : 'پشتیبانی'}</span>
                          {message.body}
                        </div>
                      )
                    })}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
