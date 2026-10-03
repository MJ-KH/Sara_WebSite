/** متن ساده یک محتوای Lexical (RichText پی‌لود)، برای توضیح متا و داده ساخت‌یافته */
export function lexicalToText(data: unknown): string {
  const parts: string[] = []
  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return
    const n = node as { text?: unknown; children?: unknown[]; type?: string }
    if (typeof n.text === 'string') parts.push(n.text)
    if (Array.isArray(n.children)) {
      n.children.forEach(walk)
      // پایان هر پاراگراف/مورد فهرست یک فاصله، تا کلمه‌ها به هم نچسبند
      if (n.type && n.type !== 'root') parts.push(' ')
    }
  }
  walk((data as { root?: unknown } | null)?.root)
  return parts.join('').replace(/\s+/g, ' ').trim()
}

/**
 * خلاصه کوتاه برای توضیح متا: حداکثر حدود ۱۶۰ نویسه، بریده‌شده سر یک کلمه با «…».
 * گوگل توضیح بلندتر را خودش کوتاه می‌کند؛ این‌جا فقط جلوی بریدن وسط کلمه را می‌گیریم.
 */
export function excerpt(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[،,؛;:.\s]+$/, '')}…`
}
