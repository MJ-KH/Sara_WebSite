import type { Payload } from 'payload'
import { formatJalaliDate } from '@/lib/jalali'
import { formatToman } from '@/lib/money'
import { getSmsProvider } from '@/lib/sms'
import { renderTemplate } from './render-template'

const MAX_ATTEMPTS = Number(process.env.WORKER_MAX_ATTEMPTS || 5)

const JOB_TYPE_TO_TEMPLATE_KEY: Record<string, string> = {
  sms_purchase_confirm: 'purchase_confirm',
  sms_workshop_enrollment_confirm: 'workshop_enrollment_confirm',
  sms_workshop_reminder: 'workshop_reminder',
  sms_birthday: 'birthday',
  sms_package_updated: 'package_updated',
  sms_waitlist_seat_available: 'waitlist_seat_available',
}

/** یک job در انتظار را با CAS اتمیک claim می‌کند تا دو نمونه worker یک job را دوبار پردازش نکنند. */
async function claimNextPendingJob(payload: Payload) {
  const candidates = await payload.find({
    collection: 'jobs',
    where: { status: { equals: 'pending' }, scheduledFor: { less_than_equal: new Date().toISOString() } },
    sort: 'scheduledFor',
    limit: 5,
    overrideAccess: true,
  })

  for (const job of candidates.docs) {
    const cas = await payload.update({
      collection: 'jobs',
      where: { and: [{ id: { equals: job.id } }, { status: { equals: 'pending' } }] },
      data: { status: 'processing' },
      overrideAccess: true,
    })
    if (cas.docs.length > 0) return cas.docs[0]
  }
  return null
}

async function buildVariablesAndRecipient(
  payload: Payload,
  jobType: string,
  jobPayload: Record<string, unknown>,
): Promise<{ mobile: string; category: 'transactional' | 'marketing'; variables: Record<string, string> } | null> {
  const studentId = jobPayload.studentId as string
  const student = await payload.findByID({ collection: 'students', id: studentId, overrideAccess: true, disableErrors: true })
  if (!student || student.status === 'blocked') return null

  const variables: Record<string, string> = { name: student.name || 'هنرجوی گرامی' }

  if (jobType === 'sms_purchase_confirm') {
    const pkg = await payload.findByID({ collection: 'packages', id: jobPayload.packageId as string, overrideAccess: true, disableErrors: true })
    variables.title = pkg?.title || ''
    return { mobile: student.mobile, category: 'transactional', variables }
  }

  if (jobType === 'sms_workshop_enrollment_confirm' || jobType === 'sms_workshop_reminder' || jobType === 'sms_waitlist_seat_available') {
    const session = await payload.findByID({
      collection: 'workshop-sessions',
      id: jobPayload.sessionId as string,
      overrideAccess: true,
      disableErrors: true,
      depth: 1,
    })
    const workshop = session && typeof session.workshop === 'object' ? session.workshop : null
    variables.title = workshop?.title || ''
    variables.date = session?.startAt ? formatJalaliDate(new Date(session.startAt)) : ''
    return { mobile: student.mobile, category: 'transactional', variables }
  }

  if (jobType === 'sms_birthday') {
    return { mobile: student.mobile, category: 'marketing', variables }
  }

  if (jobType === 'sms_package_updated') {
    const pkg = await payload.findByID({ collection: 'packages', id: jobPayload.packageId as string, overrideAccess: true, disableErrors: true })
    variables.title = pkg?.title || ''
    variables.amount = pkg ? formatToman(pkg.priceRial) : ''
    return { mobile: student.mobile, category: 'marketing', variables }
  }

  return { mobile: student.mobile, category: 'transactional', variables }
}

export async function processOneJob(payload: Payload): Promise<boolean> {
  const job = await claimNextPendingJob(payload)
  if (!job) return false

  try {
    if (job.type === 'sms_campaign') {
      await processCampaignJob(payload, job)
    } else {
      await processTemplatedJob(payload, job)
    }
    return true
  } catch (error) {
    const attempts = (job.attempts || 0) + 1
    await payload.update({
      collection: 'jobs',
      id: job.id,
      data: {
        status: attempts >= MAX_ATTEMPTS ? 'failed' : 'pending',
        attempts,
        lastError: error instanceof Error ? error.message : String(error),
        // تلاش مجدد با فاصله فزاینده ساده
        scheduledFor: new Date(Date.now() + attempts * 60_000).toISOString(),
      },
      overrideAccess: true,
    })
    return true
  }
}

async function processTemplatedJob(payload: Payload, job: any) {
  const templateKey = JOB_TYPE_TO_TEMPLATE_KEY[job.type]
  const templates = await payload.find({
    collection: 'message-templates',
    where: { key: { equals: templateKey }, active: { equals: true } },
    limit: 1,
    overrideAccess: true,
  })
  const template = templates.docs[0]
  if (!template) {
    await payload.update({ collection: 'jobs', id: job.id, data: { status: 'failed', lastError: 'template_missing_or_inactive' }, overrideAccess: true })
    return
  }

  const recipient = await buildVariablesAndRecipient(payload, job.type, job.payload || {})
  if (!recipient) {
    await payload.update({ collection: 'jobs', id: job.id, data: { status: 'failed', lastError: 'recipient_not_found' }, overrideAccess: true })
    return
  }

  if (template.category === 'marketing') {
    const student = await payload.findByID({ collection: 'students', id: job.payload.studentId, overrideAccess: true })
    if (!student?.marketingConsent) {
      await payload.update({ collection: 'jobs', id: job.id, data: { status: 'failed', lastError: 'no_marketing_consent' }, overrideAccess: true })
      return
    }
  }

  const sms = getSmsProvider()
  const result = await sms.send({
    toE164: recipient.mobile,
    body: renderTemplate(template.body, recipient.variables),
    category: recipient.category,
  })

  await payload.update({
    collection: 'jobs',
    id: job.id,
    data: {
      status: result.ok ? 'sent' : 'failed',
      lastError: result.ok ? undefined : result.error,
      providerMessageId: result.ok ? result.providerMessageId : undefined,
    },
    overrideAccess: true,
  })
}

async function processCampaignJob(payload: Payload, job: any) {
  const studentId = job.payload.studentId as string
  const student = await payload.findByID({ collection: 'students', id: studentId, overrideAccess: true, disableErrors: true })
  if (!student || student.status === 'blocked' || !student.marketingConsent) {
    await payload.update({ collection: 'jobs', id: job.id, data: { status: 'failed', lastError: 'not_eligible' }, overrideAccess: true })
    return
  }

  const sms = getSmsProvider()
  const result = await sms.send({
    toE164: student.mobile,
    body: renderTemplate(job.payload.body as string, { name: student.name || 'هنرجوی گرامی' }),
    category: 'marketing',
  })

  await payload.update({
    collection: 'jobs',
    id: job.id,
    data: { status: result.ok ? 'sent' : 'failed', lastError: result.ok ? undefined : result.error },
    overrideAccess: true,
  })
}
