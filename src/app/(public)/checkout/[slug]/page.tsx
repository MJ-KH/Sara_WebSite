import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CheckoutFlow } from '@/components/checkout/CheckoutFlow'
import { getRequestUser } from '@/lib/auth/get-request-user'
import { getPayloadClient } from '@/lib/get-payload'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'packages',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    limit: 1,
  })
  const pkg = result.docs[0]
  if (!pkg) notFound()

  const user = await getRequestUser()

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="mb-8 text-center text-2xl font-bold">تکمیل خرید</h1>
      <CheckoutFlow
        isLoggedIn={user?.collection === 'students'}
        kind="package"
        packageSlug={pkg.slug}
        title={pkg.title}
        priceRial={pkg.priceRial}
      />
    </div>
  )
}
