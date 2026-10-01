import type { CSSProperties } from 'react'

/** جای جرقه‌ها نسبت به ردیف قاب‌ها (درصد)، اندازه، تأخیر و طول هر چرخه درخشش */
const SPARKLES = [
  { left: 4, top: 10, size: 14, delay: 0.5, dur: 6.2 },
  { left: 31, top: -3, size: 10, delay: 2.2, dur: 7.1 },
  { left: 51, top: 5, size: 16, delay: 1.1, dur: 6.6 },
  { left: 76, top: 1, size: 11, delay: 3.1, dur: 7.6 },
  { left: 95, top: 28, size: 12, delay: 0.9, dur: 6.1 },
  { left: 1, top: 58, size: 11, delay: 2.7, dur: 8 },
  { left: 97, top: 72, size: 14, delay: 1.8, dur: 7.2 },
  { left: 38, top: 97, size: 10, delay: 3.5, dur: 6.9 },
  { left: 65, top: 93, size: 12, delay: 0.3, dur: 7.3 },
]

/** چند جرقه چهارپر اکلیل طلایی دور قاب‌های سربرگ؛ تزئینی و پنهان از صفحه‌خوان. */
export function Sparkles() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {SPARKLES.map((sparkle, index) => (
        <svg
          key={index}
          viewBox="0 0 24 24"
          className="sparkle"
          style={
            {
              left: `${sparkle.left}%`,
              top: `${sparkle.top}%`,
              '--size': `${sparkle.size}px`,
              '--delay': `${sparkle.delay}s`,
              '--dur': `${sparkle.dur}s`,
            } as CSSProperties
          }
        >
          <defs>
            <radialGradient id={`sparkle-${index}`}>
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#f3e2c4" />
              <stop offset="100%" stopColor="#c4a47c" />
            </radialGradient>
          </defs>
          <path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill={`url(#sparkle-${index})`} />
        </svg>
      ))}
    </div>
  )
}
