import type { ReactNode } from 'react'
import { Ornament } from '@/components/brand/Ornament'

/** سربرگ یکسان صفحه‌های داخلی: نوار صورتی، تیتر درشت وسط‌چین، جداکننده تزئینی؛ children مثلاً نوار فیلتر. */
export function PageIntro({ title, lead, children }: { title: string; lead?: string; children?: ReactNode }) {
  return (
    <section className="band-alt">
      <div className={`container-narrow text-center ${children ? 'pb-8 pt-12 md:pt-16' : 'py-12 md:py-16'}`}>
        <h1 className="display-1">{title}</h1>
        {lead ? <p className="lead mx-auto mt-3 max-w-[32rem]">{lead}</p> : null}
        <Ornament className="mt-6" />
      </div>
      {children ? <div className="container-x max-w-[56rem] pb-12 md:pb-16">{children}</div> : null}
    </section>
  )
}
