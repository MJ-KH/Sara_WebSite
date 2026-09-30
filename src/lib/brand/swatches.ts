/**
 * رنگ‌های «تیپ سواچ» — همان تیپ‌های پلاستیکی که ناخن‌کارها رنگ لاک را روی آن‌ها نشان
 * می‌دهند. وقتی پکیج عکس واقعی ندارد، بادبزنی از این تیپ‌ها جای جلد را می‌گیرد.
 * پالت غالباً صورتی است تا با هویت سفید/صورتی برند هم‌خوان باشد.
 */
export const SHADES = {
  milk: '#fff5f8',
  blush: '#fcd5e3',
  petal: '#f7a8c4',
  rose: '#ec6f9c',
  fuchsia: '#d63384',
  raspberry: '#c2185b',
  berry: '#8e1045',
  nude: '#f1cfc4',
  lilac: '#d9c2e8',
  mauve: '#b58bb0',
  shimmer: '#e6c78f',
} as const

type Shade = (typeof SHADES)[keyof typeof SHADES]

const TOPIC_PALETTES: Record<string, Shade[]> = {
  powder_gel: [SHADES.milk, SHADES.blush, SHADES.petal, SHADES.rose, SHADES.raspberry],
  extensions: [SHADES.milk, SHADES.nude, SHADES.blush, SHADES.rose, SHADES.berry],
  nail_art: [SHADES.milk, SHADES.lilac, SHADES.petal, SHADES.fuchsia, SHADES.berry],
  troubleshooting: [SHADES.milk, SHADES.blush, SHADES.mauve, SHADES.rose, SHADES.berry],
  manicure_prep: [SHADES.milk, SHADES.nude, SHADES.blush, SHADES.petal, SHADES.rose],
}

const FALLBACK_PALETTES: Shade[][] = Object.values(TOPIC_PALETTES)

export const HERO_PALETTE: Shade[] = [
  SHADES.milk,
  SHADES.blush,
  SHADES.petal,
  SHADES.rose,
  SHADES.fuchsia,
  SHADES.raspberry,
  SHADES.berry,
]

function hash(value: string): number {
  let h = 0
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** پالت پایدار برای یک پکیج: بر اساس اولین موضوعش، وگرنه بر اساس slug. */
export function paletteForPackage(pkg: { slug: string; topics?: string[] | null }): Shade[] {
  const topic = pkg.topics?.find((t) => TOPIC_PALETTES[t])
  if (topic) return TOPIC_PALETTES[topic] as Shade[]
  return FALLBACK_PALETTES[hash(pkg.slug) % FALLBACK_PALETTES.length] as Shade[]
}

/** روشنایی نسبی تقریبی برای تصمیم دربارهٔ خط دور تیپ‌های روشن روی زمینه روشن. */
export function isLightShade(hex: string): boolean {
  const n = Number.parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 200
}
