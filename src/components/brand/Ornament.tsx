/**
 * جداکننده تزئینی: خط — قاب طاقی کوچک — خط (نمونه «د» تأییدشده کارفرما؛ هم‌خانواده قاب‌های
 * طاقی عکس‌ها). همیشه تزئینی و پنهان از صفحه‌خوان.
 */
export function Ornament({ className = '' }: { className?: string }) {
  return (
    <div className={`ornament ${className}`} aria-hidden="true">
      <span className="ornament-arch" />
    </div>
  )
}
