import type { Access, CollectionConfig } from 'payload'
import { isAdminCollection, isOwnerOrBusinessAdmin } from '@/access/roles'

type ReqUser = { collection?: string; id?: string | number } | null | undefined

const isSelfStudent: Access = ({ req }) => {
  const user = req.user as ReqUser
  if (isAdminCollection(user)) return true
  if (user?.collection === 'students') return { student: { equals: user.id } }
  return false
}

/**
 * پیشرفت هر هنرجو در هر درس. یکتایی (student, lesson) در سطح دیتابیس با unique index
 * تعریف نشده (Payload از unique ترکیبی چندفیلدی پشتیبانی ساده ندارد)؛ به‌جای آن همیشه از
 * src/lib/progress/upsert-progress.ts (find-then-update-or-create) استفاده کنید، هرگز
 * مستقیم create نزنید. این محدودیت شناخته‌شده در docs/known-limitations.md ثبت شده است.
 */
export const LessonProgress: CollectionConfig = {
  slug: 'lesson-progress',
  admin: { useAsTitle: 'id', group: 'هنرجویان', defaultColumns: ['student', 'lesson', 'positionSeconds', 'completed'] },
  access: {
    read: isSelfStudent,
    create: isSelfStudent,
    update: isSelfStudent,
    delete: isOwnerOrBusinessAdmin,
  },
  fields: [
    { name: 'student', type: 'relationship', relationTo: 'students', required: true },
    { name: 'lesson', type: 'relationship', relationTo: 'lessons', required: true },
    { name: 'positionSeconds', type: 'number', required: true, defaultValue: 0 },
    { name: 'completed', type: 'checkbox', defaultValue: false },
  ],
}
