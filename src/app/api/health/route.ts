import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/get-payload'

export async function GET() {
  try {
    const payload = await getPayloadClient()
    // یک کوئری سبک واقعی از طریق Local API برای اطمینان از اتصال زنده به دیتابیس
    await payload.find({ collection: 'admin-users', limit: 1, depth: 0, overrideAccess: true })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}
