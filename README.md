# سارا نقی‌زاده — آموزش تخصصی ناخن

پلتفرم فروش پکیج آموزشی ویدئویی، آموزش رایگان، دوره حضوری و پنل مدیریت بدون‌کد.

مستندات کامل فارسی در پوشه [`docs/`](./docs/00-overview.md) — از همان‌جا شروع کنید:

- [راه‌اندازی محلی](./docs/01-local-setup.md)
- [ساخت اولین مدیر](./docs/02-first-admin.md)
- [راهنمای پنل برای سارا](./docs/03-panel-guide-fa.md)
- [اتصال‌های واقعی و آزمایشی](./docs/04-integrations.md)
- [پشتیبان‌گیری و بازیابی](./docs/05-backup-restore.md)
- [استقرار روی سرور](./docs/06-deployment.md)
- [محدودیت‌های شناخته‌شده و کارهای باقی‌مانده](./docs/07-known-limitations.md)
- [گزارش پذیرش و نتیجه آزمون‌ها](./docs/08-acceptance-report.md)

## شروع سریع

```bash
cp .env.example .env
# مقادیر PAYLOAD_SECRET, STUDENT_JWT_SECRET, S3_SECRET_ACCESS_KEY را تغییر دهید
docker compose up -d --build
docker compose exec app npx payload migrate
docker compose exec app npm run seed
docker compose exec app npm run create-first-admin
```

سایت: <http://localhost:3000> — پنل مدیریت: <http://localhost:3000/admin>
