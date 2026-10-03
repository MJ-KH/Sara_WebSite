import Link from 'next/link'
import { SPOTPLAYER_APP_URL, SPOTPLAYER_DEVICES, SPOTPLAYER_WEB_APP_URL, isSpotPlayerDevice } from '@/lib/spotplayer/constants'
import { CopyButton } from './CopyButton'

export type SpotPlayerLicenseData = {
  status?: 'pending' | 'issuing' | 'issued' | 'failed' | null
  licenseKey?: string | null
  downloadUrl?: string | null
  isTest?: boolean | null
  device?: string | null
}

/** وضعیت و کلید لایسنس اسپات‌پلیر یک دوره، با راهنمای کوتاه فعال‌سازی. */
export function SpotPlayerLicense({ license }: { license: SpotPlayerLicenseData }) {
  if (license.status === 'issued' && license.licenseKey) {
    const device = isSpotPlayerDevice(license.device) ? license.device : null
    const isWeb = device === 'ios_web'
    return (
      <div className="flex flex-col gap-3">
        <div>
          <p className="field-label">
            کد لایسنس شما {license.isTest ? <span className="text-[var(--color-text-muted)]">(آزمایشی)</span> : null}
          </p>
          <div className="flex items-center gap-2 rounded-[var(--radius-base)] bg-[var(--color-bg-alt)] p-2">
            <code dir="ltr" className="min-w-0 flex-1 select-all break-all px-2 text-[0.8125rem] leading-6">
              {license.licenseKey}
            </code>
            <CopyButton text={license.licenseKey} />
          </div>
        </div>
        {device ? (
          <p className="text-[0.875rem] text-[var(--color-text-muted)]">
            این لایسنس برای یک دستگاه <strong className="text-[var(--color-text)]">{SPOTPLAYER_DEVICES[device].label}</strong> است.
          </p>
        ) : null}
        {isWeb ? (
          <ol className="flex list-inside list-decimal flex-col gap-1 text-[0.875rem] leading-7 text-[var(--color-text-muted)]">
            <li>
              در مرورگر آیفون (سافاری)،{' '}
              <a href={SPOTPLAYER_WEB_APP_URL} target="_blank" rel="noreferrer" className="font-bold text-[var(--color-primary)] underline">
                نسخه وب اسپات‌پلیر
              </a>{' '}
              را باز کنید.
            </li>
            <li>کد لایسنس بالا را کپی و آنجا وارد کنید.</li>
            <li>دوره باز می‌شود و می‌توانید تماشا کنید.</li>
          </ol>
        ) : (
          <ol className="flex list-inside list-decimal flex-col gap-1 text-[0.875rem] leading-7 text-[var(--color-text-muted)]">
            <li>
              نرم‌افزار اسپات‌پلیر {device ? `نسخه ${SPOTPLAYER_DEVICES[device].label}` : ''} را از{' '}
              <a href={SPOTPLAYER_APP_URL} target="_blank" rel="noreferrer" className="font-bold text-[var(--color-primary)] underline">
                سایت اسپات‌پلیر
              </a>{' '}
              نصب کنید.
            </li>
            <li>کد لایسنس بالا را کپی و در نرم‌افزار وارد کنید.</li>
            <li>دوره در نرم‌افزار باز می‌شود و می‌توانید تماشا کنید.</li>
          </ol>
        )}
        {license.downloadUrl ? (
          <a href={license.downloadUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm self-start">
            صفحه دانلود دوره
          </a>
        ) : null}
      </div>
    )
  }

  if (license.status === 'failed') {
    return (
      <p className="rounded-[var(--radius-base)] bg-[var(--color-accent-soft)] p-3 text-[0.875rem] leading-7">
        ساخت لایسنس با مشکل روبه‌رو شد و پشتیبانی در حال پیگیری است. اگر عجله دارید{' '}
        <Link href="/account/support" className="font-bold text-[var(--color-primary)] underline">
          پیام بدهید
        </Link>
        .
      </p>
    )
  }

  return (
    <p className="rounded-[var(--radius-base)] bg-[var(--color-bg-alt)] p-3 text-[0.875rem] leading-7 text-[var(--color-text-muted)]">
      لایسنس اسپات‌پلیر شما در حال ساخت است؛ چند دقیقه دیگر این صفحه را دوباره باز کنید.
    </p>
  )
}
