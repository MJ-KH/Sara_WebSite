import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

let cached: Payload | null = null

export async function getTestPayload(): Promise<Payload> {
  if (cached) return cached
  cached = await getPayload({ config })
  return cached
}

export function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 10)
}

export async function createTestPackage(payload: Payload, overrides: Record<string, unknown> = {}) {
  const suffix = randomSuffix()
  return payload.create({
    collection: 'packages',
    data: {
      slug: `test-pkg-${suffix}`,
      title: `[تست] پکیج ${suffix}`,
      level: 'beginner',
      kind: 'comprehensive',
      priceRial: 10_000_000,
      status: 'published',
      ...overrides,
    },
    overrideAccess: true,
  })
}

export async function createTestStudent(payload: Payload, overrides: Record<string, unknown> = {}) {
  const suffix = randomSuffix()
  return payload.create({
    collection: 'students',
    data: { mobile: `+9891${suffix.padEnd(8, '0').slice(0, 8)}`, status: 'active', ...overrides },
    overrideAccess: true,
  })
}
