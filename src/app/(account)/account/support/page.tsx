import { NewTicketForm } from '@/components/support/NewTicketForm'
import { requireStudent } from '@/lib/auth/get-request-user'
import { getPayloadClient } from '@/lib/get-payload'

const STATUS_LABELS: Record<string, string> = { open: 'باز', answered: 'پاسخ‌داده‌شده', closed: 'بسته' }

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
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">پشتیبانی</h1>
      <NewTicketForm />
      <div className="flex flex-col gap-3">
        {tickets.docs.map((ticket) => (
          <div key={ticket.id} className="rounded-[var(--radius-base)] border border-[var(--color-border)] p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">{ticket.subject}</h2>
              <span className="text-xs text-[var(--color-text-muted)]">{STATUS_LABELS[ticket.status] || ticket.status}</span>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {(ticket.messages || []).map((message, index) => (
                <div key={index} className={message.from === 'student' ? 'text-sm' : 'rounded bg-[var(--color-accent-soft)] p-2 text-sm'}>
                  <span className="font-bold">{message.from === 'student' ? 'شما: ' : 'پشتیبانی: '}</span>
                  {message.body}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
