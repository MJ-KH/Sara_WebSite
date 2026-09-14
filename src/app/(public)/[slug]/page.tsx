import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { PageBlocks } from '@/blocks/BlockRenderer'
import { getPayloadClient } from '@/lib/get-payload'
import { getPageBySlug } from '@/lib/pages/get-page'
import { buildPageMetadata } from '@/lib/pages/metadata'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  return buildPageMetadata(page)
}

async function findRedirect(fromPath: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'redirects',
    where: { fromPath: { equals: fromPath } },
    limit: 1,
  })
  return result.docs[0] ?? null
}

export default async function CmsPage({ params }: Params) {
  const { slug } = await params
  const page = await getPageBySlug(slug)

  if (!page) {
    const redirectDoc = await findRedirect(`/${slug}`)
    if (redirectDoc) {
      redirect(redirectDoc.toPath)
    }
    notFound()
  }

  return <PageBlocks blocks={page.layout || []} />
}
