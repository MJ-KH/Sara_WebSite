import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CheckoutFlow } from '@/components/checkout/CheckoutFlow'
import { getRequestUser } from '@/lib/auth/get-request-user'
import { getPayloadClient } from '@/lib/get-payload'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function WorkshopCheckoutPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  const payload = await getPayloadClient()
  const session = await payload.findByID({ collection: 'workshop-sessions', id: sessionId, depth: 1 }).catch(() => null)
  if (!session || session.status !== 'published') notFound()

  const workshop = typeof session.workshop === 'object' ? session.workshop : null
  const user = await getRequestUser()

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="mb-8 text-center text-2xl font-bold">ثبت‌نام دوره حضوری</h1>
      <CheckoutFlow
        isLoggedIn={user?.collection === 'students'}
        kind="workshop_session"
        workshopSessionId={sessionId}
        title={workshop?.title || 'دوره حضوری'}
        priceRial={session.priceRial}
      />
    </div>
  )
}
