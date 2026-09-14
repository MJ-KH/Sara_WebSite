import config from '@payload-config'
import { getPayload } from 'payload'
import { enqueueBirthdayJobs } from './enqueue-birthday-jobs'
import { enqueueWorkshopReminders } from './enqueue-workshop-reminders'
import { notifyWaitlist } from './notify-waitlist'
import { processOneJob } from './process-jobs'
import { sweepExpiredHolds } from './sweep-expired-holds'

const POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_INTERVAL_MS || 5000)
const HOURLY_SWEEP_MS = 60 * 60_000
const HOLD_SWEEP_MS = 30_000

let lastHourlySweep = 0
let lastHoldSweep = 0

async function tick(payload: Awaited<ReturnType<typeof getPayload>>) {
  const now = Date.now()

  if (now - lastHoldSweep > HOLD_SWEEP_MS) {
    lastHoldSweep = now
    await sweepExpiredHolds(payload).catch((e) => console.error('sweepExpiredHolds failed', e))
    await notifyWaitlist(payload).catch((e) => console.error('notifyWaitlist failed', e))
  }

  if (now - lastHourlySweep > HOURLY_SWEEP_MS) {
    lastHourlySweep = now
    await enqueueBirthdayJobs(payload).catch((e) => console.error('enqueueBirthdayJobs failed', e))
    await enqueueWorkshopReminders(payload).catch((e) => console.error('enqueueWorkshopReminders failed', e))
  }

  // در هر tick چند job را پردازش کن تا صف عقب نماند
  for (let i = 0; i < 10; i++) {
    const processed = await processOneJob(payload)
    if (!processed) break
  }
}

async function main() {
  console.log('[worker] starting — poll interval', POLL_INTERVAL_MS, 'ms')
  const payload = await getPayload({ config })

  // اجرای فوری یک‌بار در استارتاپ، سپس با فاصله ثابت
  while (true) {
    try {
      await tick(payload)
    } catch (error) {
      console.error('[worker] tick failed', error)
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
  }
}

main().catch((error) => {
  console.error('[worker] fatal error', error)
  process.exit(1)
})
