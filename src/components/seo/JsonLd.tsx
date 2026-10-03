/**
 * داده ساختاریافته (schema.org) برای موتور جست‌وجو. «<» داخل JSON فرار داده می‌شود تا متن
 * محتوا (مثلاً «</script>» در عنوان) نتواند از تگ اسکریپت بیرون بزند.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\u003c') }} />
}
