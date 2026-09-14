import type { Payload } from 'payload'

export async function recordAuditLog(
  payload: Payload,
  entry: {
    action: string
    entityType: string
    entityId?: string
    actorLabel?: string
    beforeJson?: Record<string, unknown>
    afterJson?: Record<string, unknown>
  },
): Promise<void> {
  try {
    await payload.create({
      collection: 'audit-log',
      data: {
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        actorLabel: entry.actorLabel,
        beforeJson: entry.beforeJson ?? null,
        afterJson: entry.afterJson ?? null,
      },
      overrideAccess: true,
    })
  } catch (error) {
    // ثبت رویداد حساس نباید عملیات اصلی را متوقف کند؛ فقط خطا را لاگ می‌کنیم
    console.error('audit log write failed', error)
  }
}

export function describeActor(user: { collection?: string; email?: string; mobile?: string; id?: string | number } | null | undefined): string {
  if (!user) return 'system'
  if (user.collection === 'admin-users') return `admin:${user.email || user.id}`
  if (user.collection === 'students') return `student:${user.mobile || user.id}`
  return 'unknown'
}
