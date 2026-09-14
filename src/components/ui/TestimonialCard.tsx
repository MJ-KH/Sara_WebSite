import Image from 'next/image'

export type TestimonialCardData = {
  studentName: string
  content: string
  avatar?: { url?: string | null } | null
}

export function TestimonialCard({ item }: { item: TestimonialCardData }) {
  return (
    <figure className="flex flex-col gap-3 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <blockquote className="text-sm leading-loose">«{item.content}»</blockquote>
      <figcaption className="mt-auto flex items-center gap-2">
        {item.avatar?.url ? (
          <Image src={item.avatar.url} alt={item.studentName} width={32} height={32} className="rounded-full" />
        ) : null}
        <span className="text-sm font-bold">{item.studentName}</span>
      </figcaption>
    </figure>
  )
}
