import nextConfig from 'eslint-config-next'

const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'src/payload-types.ts',
      'src/app/(payload)/admin/importMap.js',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  ...(Array.isArray(nextConfig) ? nextConfig : [nextConfig]),
]

export default config
