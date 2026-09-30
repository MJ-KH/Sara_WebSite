/**
 * رنگ‌های «تیپ سواچ» — همان تیپ‌های پلاستیکی که ناخن‌کارها رنگ لاک را روی آن‌ها نشان
 * می‌دهند. چون عکس واقعی نداریم، هر پکیج با یک بادبزن از این تیپ‌ها هویت بصری می‌گیرد؛
 * رنگ‌ها از شِیدهای رایج لاک ژل انتخاب شده‌اند، نه پالت دلبخواه.
 */
export const SHADES = {
  milk: '#f6eeea',
  nude: '#e6c7bc',
  caramelNude: '#c99a80',
  dustyPink: '#e2a7a8',
  rose: '#c56476',
  cherry: '#a92a40',
  oxblood: '#7a1f35',
  mauve: '#9a7290',
  aubergine: '#4a2a3c',
  sage: '#a3b09c',
  shimmer: '#d8b98c',
} as const

type Shade = (typeof SHADES)[keyof typeof SHADES]

const TOPIC_PALETTES: Record<string, Shade[]> = {
  powder_gel: [SHADES.milk, SHADES.nude, SHADES.dustyPink, SHADES.rose, SHADES.oxblood],
  extensions: [SHADES.nude, SHADES.milk, SHADES.caramelNude, SHADES.shimmer, SHADES.aubergine],
  nail_art: [SHADES.milk, SHADES.cherry, SHADES.sage, SHADES.mauve, SHADES.aubergine],
  troubleshooting: [SHADES.milk, SHADES.nude, SHADES.dustyPink, SHADES.mauve, SHADES.aubergine],
  manicure_prep: [SHADES.milk, SHADES.nude, SHADES.dustyPink, SHADES.sage, SHADES.caramelNude],
}

const FALLBACK_PALETTES: Shade[][] = Object.values(TOPIC_PALETTES)

export const HERO_PALETTE: Shade[] = [
  SHADES.milk,
  SHADES.nude,
  SHADES.dustyPink,
  SHADES.rose,
  SHADES.cherry,
  SHADES.oxblood,
  SHADES.aubergine,
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
