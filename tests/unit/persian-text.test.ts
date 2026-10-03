import { describe, expect, it } from 'vitest'
import { normalizePersianMultiline, normalizePersianText } from '@/lib/persian-text'

describe('normalizePersianText', () => {
  it('ی و ک عربی را به فارسی تبدیل می‌کند', () => {
    expect(normalizePersianText('كاشت ناخن علي')).toBe('کاشت ناخن علی')
    expect(normalizePersianText('مصطفى')).toBe('مصطفی')
  })

  it('نیم‌فاصله را نگه می‌دارد ولی نویسه‌های نامرئی دیگر را حذف می‌کند', () => {
    expect(normalizePersianText('می‌خواهم')).toBe('می‌خواهم')
    expect(normalizePersianText('‏سلام​﻿')).toBe('سلام')
    expect(normalizePersianText('می‌‌خواهم')).toBe('می‌خواهم')
  })

  it('فاصله‌های اضافه را یکی می‌کند و دو سر را می‌تراشد', () => {
    expect(normalizePersianText('  پودر    ژل  ')).toBe('پودر ژل')
  })

  it('ارقام را تغییر نمی‌دهد', () => {
    expect(normalizePersianText('دوره ۲ و 3')).toBe('دوره ۲ و 3')
  })
})

describe('normalizePersianMultiline', () => {
  it('خط‌ها را نگه می‌دارد و خط خالی زیادی را کم می‌کند', () => {
    expect(normalizePersianMultiline('سلام  \r\n\r\n\r\n\r\nيك سوال')).toBe('سلام\n\nیک سوال')
  })
})

describe('excerpt / lexicalToText', () => {
  it('متن Lexical را ساده می‌کند و سر کلمه می‌بُرد', async () => {
    const { excerpt, lexicalToText } = await import('@/lib/seo/excerpt')
    const data = { root: { type: 'root', children: [{ type: 'paragraph', children: [{ text: 'پودر و ژل' }] }, { type: 'paragraph', children: [{ text: 'دو سیستم' }] }] } }
    expect(lexicalToText(data)).toBe('پودر و ژل دو سیستم')
    expect(excerpt('یک دو سه چهار پنج', 10)).toBe('یک دو سه…')
    expect(excerpt('کوتاه', 10)).toBe('کوتاه')
  })
})
