import { type NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/get-payload'
import { completeOrderPayment } from '@/lib/orders/complete-order-payment'

/**
 * callback مشترک برای همه درگاه‌ها (mock و zarinpal هر دو دقیقاً همین شکل Authority/Status
 * را برمی‌گردانند — ر.ک. src/lib/payments/mock.ts). مبلغ هرگز از اینجا خوانده نمی‌شود.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const authority = url.searchParams.get('Authority')
  const status = url.searchParams.get('Status')
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || url.origin

  if (!authority) {
    return NextResponse.redirect(`${baseUrl}/checkout/result?status=error`)
  }

  const payload = await getPayloadClient()

  try {
    const result = await completeOrderPayment(payload, authority, { Authority: authority, Status: status ?? '' })
    const finalStatus = result.ok ? 'success' : 'failed'
    return NextResponse.redirect(`${baseUrl}/checkout/result?status=${finalStatus}`)
  } catch (error) {
    console.error('payment callback error', error)
    return NextResponse.redirect(`${baseUrl}/checkout/result?status=error`)
  }
}
