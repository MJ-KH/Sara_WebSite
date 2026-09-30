'use client'

import Link from 'next/link'
import { useEffect, useId, useState } from 'react'

type MenuChild = { label: string; href: string }
type MenuItem = { label: string; href: string; children?: MenuChild[] | null }

export function MobileMenu({ menu }: { menu: MenuItem[] }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border-strong)] text-[var(--color-text)]"
      >
        <span className="sr-only">{open ? 'بستن منو' : 'باز کردن منو'}</span>
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      <nav
        id={panelId}
        aria-label="منوی اصلی"
        hidden={!open}
        // انتخاب هر لینک منو را می‌بندد (رویداد از خود لینک‌ها bubble می‌شود)
        onClick={(event) => {
          if ((event.target as HTMLElement).closest('a')) setOpen(false)
        }}
        className="absolute inset-x-0 top-[calc(100%+0.5rem)] rounded-[1.5rem] bg-[var(--color-surface)] shadow-[var(--shadow-float)]"
      >
        <ul className="flex flex-col px-5 py-3">
          {menu.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="flex min-h-12 items-center border-b border-[var(--color-border)] text-[1.0625rem] font-semibold">
                {item.label}
              </Link>
              {item.children?.length ? (
                <ul className="pb-2 ps-4">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link href={child.href} className="flex min-h-11 items-center text-[var(--color-text-muted)]">
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
