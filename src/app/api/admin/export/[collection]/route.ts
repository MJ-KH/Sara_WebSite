import { NextResponse } from 'next/server'
import { requireAdminStaff } from '@/lib/auth/get-request-user'
import { toCsv } from '@/lib/csv/export'
import { getPayloadClient } from '@/lib/get-payload'

const ALLOWED: Record<string, { key: string; label: string }[]> = {
  orders: [
    { key: 'id', label: 'شناسه' },
    { key: 'titleSnapshot', label: 'عنوان' },
    { key: 'totalRialSnapshot', label: 'مبلغ (ریال)' },
    { key: 'status', label: 'وضعیت' },
    { key: 'createdAt', label: 'تاریخ ثبت' },
  ],
  students: [
    { key: 'id', label: 'شناسه' },
    { key: 'mobile', label: 'موبایل' },
    { key: 'name', label: 'نام' },
    { key: 'city', label: 'شهر' },
    { key: 'status', label: 'وضعیت' },
    { key: 'createdAt', label: 'تاریخ ثبت' },
  ],
  'workshop-enrollments': [
    { key: 'id', label: 'شناسه' },
    { key: 'status', label: 'وضعیت' },
    { key: 'createdAt', label: 'تاریخ ثبت' },
  ],
}

/** فقط مدیر/پشتیبان — خروجی محدود به فیلدهای مجاز، بدون کلید یا اطلاعات حساس */
export async function GET(req: Request, context: { params: Promise<{ collection: string }> }) {
  const admin = await requireAdminStaff()
  if (!admin) return NextResponse.json({ ok: false, message: 'دسترسی ندارید' }, { status: 403 })

  const { collection } = await context.params
  const columns = ALLOWED[collection]
  if (!columns) return NextResponse.json({ ok: false, message: 'این کالکشن قابل خروجی‌گیری نیست' }, { status: 400 })

  const payload = await getPayloadClient()
  const result = await payload.find({ collection: collection as any, limit: 5000, depth: 0, overrideAccess: true })

  const csv = toCsv(result.docs as Record<string, unknown>[], columns)
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${collection}.csv"`,
    },
  })
}
