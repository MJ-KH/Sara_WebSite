import { GLOSS_PATH, TIP_PATH } from './SwatchFan'

/** جداکننده تزئینی: خط — یک تیپ کوچک ناخن — خط. همیشه تزئینی و پنهان از صفحه‌خوان. */
export function Ornament({ className = '' }: { className?: string }) {
  return (
    <div className={`ornament ${className}`} aria-hidden="true">
      <svg viewBox="-17 -122 34 130" width="9" height="30" focusable="false">
        <path d={TIP_PATH} fill="currentColor" transform="rotate(12)" />
        <path d={GLOSS_PATH} fill="#fff" opacity="0.5" transform="rotate(12)" />
      </svg>
    </div>
  )
}
