/** فونت اصلی سایت (ایران‌سنس X متغیر) را زودتر از CSS درخواست می‌کند تا متن دیرتر جابه‌جا نشود. */
export function FontPreload() {
  return <link rel="preload" href="/fonts/IRANSansXVFaNum.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
}
