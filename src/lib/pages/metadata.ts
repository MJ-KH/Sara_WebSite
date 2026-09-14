import type { Metadata } from 'next'

export function buildPageMetadata(page: any): Metadata {
  const seo = page?.seo || {}
  const ogImage = typeof seo.ogImage === 'object' ? seo.ogImage?.url : undefined
  return {
    title: seo.metaTitle || page?.title,
    description: seo.metaDescription || undefined,
    alternates: seo.canonicalPath ? { canonical: seo.canonicalPath } : undefined,
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: ogImage ? { images: [{ url: ogImage }] } : undefined,
  }
}
