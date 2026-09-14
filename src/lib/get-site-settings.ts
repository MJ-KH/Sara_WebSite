import { cache } from 'react'
import config from '@payload-config'
import { getPayload } from 'payload'

export const getSiteSettings = cache(async () => {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'site-settings' })
})
