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

/** برچسب کوچک دستگاه لایسنس برای سربرگ کارت دوره، مثل «ویندوز · یک دستگاه». */
export function spotPlayerDeviceLabel(device: string | null | undefined): string | null {
  return isSpotPlayerDevice(device) ? `${SPOTPLAYER_DEVICES[device].label} · یک دستگاه` : null
}

const outlinePill =
  'flex min-h-11 flex-1 items-center justify-center rounded-full border border-[var(--ink-900)] px-4 text-[0.8125rem] font-medium whitespace-nowrap transition-colors hover:bg-[var(--ink-900)] hover:text-[#f4ecee]'

/** کد لایسنس اسپات‌پلیر یک دوره با دکمه کپی، راهنمای دو مرحله‌ای و پیوندهای لازم. */
export function SpotPlayerLicense({ license }: { license: SpotPlayerLicenseData }) {
  if (license.status === 'issued' && license.licenseKey) {
    const device = isSpotPlayerDevice(license.device) ? license.device : null
    const isWeb = device === 'ios_web'
    return (
      <div className="flex flex-col gap-3">
        <div>
          <p className="sr-only">کد لایسنس{license.isTest ? ' (آزمایشی)' : ''}</p>
          <div className="flex items-center gap-2.5 rounded-xl bg-[var(--color-bg-alt)] py-2 pe-2 ps-3">
            <code dir="ltr" className="min-w-0 flex-1 truncate text-[0.75rem] leading-6" title={license.licenseKey}>
              {license.licenseKey}
            </code>
            <CopyButton text={license.licenseKey} label="کپی کد" />
          </div>
          {license.isTest ? <p className="mt-1.5 text-[0.75rem] text-[var(--color-text-muted)]">این لایسنس آزمایشی است.</p> : null}
        </div>
        <ol className="list-inside list-decimal text-[0.8125rem] leading-7 text-[var(--color-text-muted)] marker:font-bold marker:text-[var(--gold)]">
          {isWeb ? (
            <>
              <li>نسخه وب اسپات‌پلیر را در سافاری باز کنید.</li>
              <li>کد بالا را آنجا وارد کنید تا دوره باز شود.</li>
            </>
          ) : (
            <>
              <li>اسپات‌پلیر {device ? `نسخه ${SPOTPLAYER_DEVICES[device].label} ` : ''}را نصب کنید.</li>
              <li>کد بالا را در نرم‌افزار وارد کنید تا دوره باز شود.</li>
            </>
          )}
        </ol>
        <div className="flex gap-2">
          {isWeb ? (
            <a href={SPOTPLAYER_WEB_APP_URL} target="_blank" rel="noreferrer" className={outlinePill}>
              باز کردن نسخه وب
            </a>
          ) : (
            <>
              <a href={SPOTPLAYER_APP_URL} target="_blank" rel="noreferrer" className={outlinePill}>
                دانلود اسپات‌پلیر
              </a>
              {license.downloadUrl ? (
                <a href={license.downloadUrl} target="_blank" rel="noreferrer" className={outlinePill}>
                  صفحه دانلود دوره
                </a>
              ) : null}
            </>
          )}
        </div>
      </div>
    )
  }

  if (license.status === 'failed') {
    return (
      <p className="rounded-xl bg-[var(--color-accent-soft)] p-3 text-[0.875rem] leading-7">
        ساخت لایسنس با مشکل روبه‌رو شد و پشتیبانی در حال پیگیری است. اگر عجله دارید{' '}
        <Link href="/account/support" className="font-bold text-[var(--color-primary)] underline">
          پیام بدهید
        </Link>
        .
      </p>
    )
  }

  return (
    <p className="rounded-xl bg-[var(--color-bg-alt)] p-3 text-[0.875rem] leading-7 text-[var(--color-text-muted)]">
      لایسنس شما در حال ساخت است؛ چند دقیقه دیگر این صفحه را دوباره باز کنید.
    </p>
  )
}
