import { notFound } from 'next/navigation'

// هر آدرس چندبخشی ناشناخته (مثل /abc/def) به صفحه ۴۰۴ فارسی همین بخش می‌رسد
export default function UnknownNestedPage() {
  notFound()
}
