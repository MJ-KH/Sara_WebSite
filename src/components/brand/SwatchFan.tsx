import { isLightShade } from '@/lib/brand/swatches'

const TIP_WIDTH = 30
const TIP_LENGTH = 118

// تیپ بادامی: بدنه صاف، سر گرد، لبه پایین کمی قوس‌دار (مثل تیپ سواچ واقعی)
export const TIP_PATH = 'M -15 0 L -15 -62 C -15 -97 -7.5 -118 0 -118 C 7.5 -118 15 -97 15 -62 L 15 0 Q 0 6 -15 0 Z'
// بازتاب براق ژل روی یک سمت تیپ
export const GLOSS_PATH = 'M -9 -16 C -10 -60 -7 -92 -1 -105 C -4 -88 -6 -62 -5 -16 Z'

/**
 * بادبزن تیپ‌های رنگ لاک — عنصر امضای بصری سایت به‌جای عکس.
 * تزئینی است (aria-hidden)؛ معنای محتوا همیشه در متن کنارش آمده.
 * `animate` فقط برای یک لحظه باز شدن در بارگذاری صفحه است و با
 * prefers-reduced-motion خاموش می‌شود (ر.ک. globals.css).
 */
export function SwatchFan({
  colors,
  spread = 64,
  animate = false,
  id,
  className,
}: {
  colors: readonly string[]
  spread?: number
  animate?: boolean
  /** شناسه یکتا در صفحه برای gradient داخلی SVG */
  id: string
  className?: string
}) {
  const count = colors.length
  const half = (spread * Math.PI) / 360
  const maxX = Math.ceil(TIP_LENGTH * Math.sin(half) + TIP_WIDTH)
  const viewBox = `${-maxX} ${-TIP_LENGTH - 6} ${maxX * 2} ${TIP_LENGTH + 18}`
  const shadeId = `swatch-shade-${id}`

  return (
    <svg
      viewBox={viewBox}
      aria-hidden="true"
      focusable="false"
      className={`swatch-fan${animate ? ' swatch-fan--animate' : ''}${className ? ` ${className}` : ''}`}
    >
      <defs>
        <linearGradient id={shadeId} x1="0" y1={-TIP_LENGTH} x2="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#241b1f" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      {colors.map((color, index) => {
        const angle = count === 1 ? 0 : -spread / 2 + (index * spread) / (count - 1)
        const light = isLightShade(color)
        return (
          <g
            key={`${color}-${index}`}
            className="swatch-tip"
            style={{ ['--a' as string]: `${angle}deg`, ['--i' as string]: index }}
          >
            <path
              d={TIP_PATH}
              fill={color}
              stroke={light ? 'rgba(36,27,31,0.16)' : 'rgba(36,27,31,0.08)'}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            <path d={TIP_PATH} fill={`url(#${shadeId})`} />
            <path d={GLOSS_PATH} fill="#ffffff" opacity={light ? 0.75 : 0.42} />
          </g>
        )
      })}
      <circle r="5" fill="#43363c" />
      <circle r="2" fill="#faf6f6" />
    </svg>
  )
}
