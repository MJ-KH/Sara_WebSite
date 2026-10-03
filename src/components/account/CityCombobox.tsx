'use client'

import type React from 'react'
import { useId, useMemo, useRef, useState } from 'react'
import { IRAN_CITIES, OUTSIDE_IRAN } from '@/lib/iran-cities'
import { normalizePersianText } from '@/lib/persian-text'

type Option = { value: string; hint?: string; custom?: boolean }

/** برای مقایسه: ی/ک یکسان، بدون نیم‌فاصله و فاصله («خرم آباد» = «خرم‌آباد») */
function searchKey(text: string): string {
  return normalizePersianText(text).replace(/[‌\s]/g, '')
}

const MAX_OPTIONS = 40

/**
 * انتخاب شهر با جست‌وجو: با تایپ چند حرف، شهرها (و شهرهای یک استان با نام استان) پیشنهاد می‌شوند.
 * شهری که در فهرست نیست هم با گزینه «ثبت ... به‌عنوان شهر» پذیرفته می‌شود.
 */
export function CityCombobox({
  id,
  value,
  onChange,
  className,
}: {
  id: string
  value: string
  onChange: (city: string) => void
  className: string
}) {
  const listId = useId()
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)

  const options = useMemo<Option[]>(() => {
    const key = searchKey(query)
    const all: Option[] = [...IRAN_CITIES.map((c) => ({ value: c.name, hint: c.province })), { value: OUTSIDE_IRAN }]
    // کادر خالی یا همان شهر انتخاب‌شده: کل فهرست برای مرور
    if (!key || key === searchKey(value)) return all
    const starts: Option[] = []
    const contains: Option[] = []
    for (const option of all) {
      const name = searchKey(option.value)
      if (name.startsWith(key)) starts.push(option)
      else if (name.includes(key) || (option.hint && searchKey(option.hint).includes(key))) contains.push(option)
    }
    const found = [...starts, ...contains].slice(0, MAX_OPTIONS)
    const exact = found.some((o) => searchKey(o.value) === key)
    return exact ? found : [...found, { value: normalizePersianText(query), custom: true }]
  }, [query, value])

  function choose(option: Option) {
    onChange(option.value)
    setQuery(option.value)
    setOpen(false)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      const next = event.key === 'ArrowDown' ? Math.min(active + 1, options.length - 1) : Math.max(active - 1, 0)
      setActive(next)
      listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' })
    } else if (event.key === 'Enter' && open && options[active]) {
      event.preventDefault()
      choose(options[active])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && options[active] ? `${listId}-${active}` : undefined}
        autoComplete="off"
        value={query}
        placeholder="جست‌وجو یا انتخاب شهر"
        onChange={(e) => {
          setQuery(e.target.value)
          setActive(0)
          setOpen(true)
          // پاک کردن کامل کادر یعنی شهر خالی
          if (!e.target.value.trim()) onChange('')
        }}
        onFocus={() => setOpen(true)}
        // کمی صبر تا کلیک روی گزینه ثبت شود؛ اگر چیزی انتخاب نشد، متن به آخرین شهر انتخاب‌شده برمی‌گردد
        onBlur={() =>
          setTimeout(() => {
            setOpen(false)
            setQuery((current) => (searchKey(current) === searchKey(value) ? current : value))
          }, 150)
        }
        onKeyDown={onKeyDown}
        className={`${className} pe-10`}
      />
      <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" aria-hidden="true">
        <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {open && options.length > 0 ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+0.375rem)] z-40 max-h-64 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-[var(--shadow-float)]"
        >
          {options.map((option, index) => (
            <li
              key={`${option.value}-${option.custom ? 'custom' : option.hint || ''}`}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(option)}
              onMouseEnter={() => setActive(index)}
              className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 px-3.5 text-[0.9375rem] ${
                index === active ? 'bg-[var(--color-bg-alt)]' : ''
              }`}
            >
              {option.custom ? (
                <span className="text-[var(--color-primary)]">ثبت «{option.value}» به‌عنوان شهر</span>
              ) : (
                <>
                  <span>{option.value}</span>
                  {option.hint ? <span className="text-[0.75rem] text-[var(--color-text-muted)]">{option.hint}</span> : null}
                </>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
