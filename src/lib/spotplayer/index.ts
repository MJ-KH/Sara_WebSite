import { SpotPlayerApiClient } from './api'
import { SpotPlayerMockClient } from './mock'
import { SpotPlayerConfigurationError, type SpotPlayerClient } from './types'

export * from './constants'
export * from './types'

let cached: SpotPlayerClient | null = null

/**
 * با SPOTPLAYER_API_KEY به API واقعی وصل می‌شود (SPOTPLAYER_TEST_LICENSES=true یعنی لایسنس
 * آزمایشی روی همان حساب). بدون کلید، در توسعه حالت ساختگی است و در محیط عملیاتی خطا می‌دهد
 * تا هیچ‌وقت به‌جای لایسنس واقعی، کلید ساختگی به خریدار داده نشود.
 */
export function getSpotPlayerClient(): SpotPlayerClient {
  if (cached) return cached
  const apiKey = process.env.SPOTPLAYER_API_KEY?.trim()
  if (apiKey) {
    cached = new SpotPlayerApiClient(apiKey, process.env.SPOTPLAYER_TEST_LICENSES === 'true')
    return cached
  }
  if (process.env.NODE_ENV === 'production') {
    throw new SpotPlayerConfigurationError('SPOTPLAYER_API_KEY تنظیم نشده است؛ بدون کلید واقعی نمی‌توان لایسنس اسپات‌پلیر صادر کرد.')
  }
  cached = new SpotPlayerMockClient()
  return cached
}

export function resetSpotPlayerClientCache(): void {
  cached = null
}
