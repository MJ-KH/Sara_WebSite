/** نوع job صف برای صدور لایسنس اسپات‌پلیر (src/worker/process-jobs.ts) */
export const SPOTPLAYER_JOB_TYPE = 'spotplayer_issue_license'

/** پیشوند صفحه دانلود دوره؛ اسپات‌پلیر «url» را بدون دامنه برمی‌گرداند */
export const SPOTPLAYER_DOWNLOAD_ORIGIN = 'https://dl.spotplayer.ir'

/** صفحه دانلود نرم‌افزار اسپات‌پلیر برای هنرجو */
export const SPOTPLAYER_APP_URL = 'https://spotplayer.ir/'

/** نسخه وب اسپات‌پلیر (برای آیفون و آیپد که نرم‌افزار جدا ندارند) */
export const SPOTPLAYER_WEB_APP_URL = 'https://app.spotplayer.ir/'

/** هر خرید = یک لایسنس روی یک دستگاه */
export const SPOTPLAYER_DEVICE_COUNT = 1

/** چند روز بدون اینترنت قابل تماشا باشد */
export const SPOTPLAYER_OFFLINE_DAYS = 30

/**
 * دستگاهی که هنرجو موقع خرید انتخاب می‌کند و فیلد متناظرش در API اسپات‌پلیر
 * (p1 ویندوز، p4 اندروید، p6 نسخه وب). آیفون نرم‌افزار ندارد، پس لایسنس نسخه وب می‌گیرد.
 */
export const SPOTPLAYER_DEVICES = {
  android: { label: 'اندروید', apiField: 'p4' },
  windows: { label: 'ویندوز', apiField: 'p1' },
  ios_web: { label: 'آیفون / آیپد (نسخه وب)', apiField: 'p6' },
} as const

export type SpotPlayerDevice = keyof typeof SPOTPLAYER_DEVICES

export const SPOTPLAYER_DEVICE_VALUES = Object.keys(SPOTPLAYER_DEVICES) as [SpotPlayerDevice, ...SpotPlayerDevice[]]

export const SPOTPLAYER_DEVICE_OPTIONS = SPOTPLAYER_DEVICE_VALUES.map((value) => ({ value, label: SPOTPLAYER_DEVICES[value].label }))

export function isSpotPlayerDevice(value: unknown): value is SpotPlayerDevice {
  return typeof value === 'string' && value in SPOTPLAYER_DEVICES
}
