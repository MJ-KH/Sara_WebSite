import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { PageBlocks } from '@/blocks/BlockRenderer'
import { JsonLd } from '@/components/seo/JsonLd'
import { getPayloadClient } from '@/lib/get-payload'
import { getPageBySlug } from '@/lib/pages/get-page'
import { buildPageMetadata } from '@/lib/pages/metadata'
import { buildBreadcrumb } from '@/lib/seo/entities'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  return buildPageMetadata(page, `/${slug}`)
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

  return (
    <>
      <JsonLd data={buildBreadcrumb([[page.title, `/${slug}`]])} />
      <PageBlocks blocks={page.layout || []} />
    </>
  )
}
