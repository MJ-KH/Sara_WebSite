# پشتیبان‌گیری و بازیابی

## پشتیبان‌گیری از دیتابیس (PostgreSQL)

```bash
docker compose exec postgres pg_dump -U sara -d sara_naghizadeh -F c -f /tmp/backup.dump
docker compose cp postgres:/tmp/backup.dump ./backups/backup-$(date +%Y%m%d-%H%M).dump
```

پیشنهاد: این دستور را در یک اسکریپت زمان‌بندی‌شده (cron روی سرور) روزانه اجرا کنید و فایل‌ها
را در محل امن و جدا (مثلاً یک bucket دیگر یا دیسک خارجی) نگه دارید.

## پشتیبان‌گیری از فایل‌ها (MinIO/S3)

اگر از MinIO استفاده می‌کنید:

```bash
docker compose exec minio mc mirror /data ./backups/minio-$(date +%Y%m%d)
```

اگر از سرویس S3 ابری استفاده می‌کنید، از ابزار پشتیبان‌گیری همان سرویس (یا `mc mirror` با
تنظیم alias به آن سرویس) استفاده کنید.

## بازیابی (آزمایش‌شده محلی)

1. دیتابیس:
   ```bash
   docker compose exec -T postgres pg_restore -U sara -d sara_naghizadeh --clean --if-exists < ./backups/backup-XXXX.dump
   ```
2. فایل‌ها: فایل‌های پشتیبان را داخل volume `miniodata` کپی کنید یا با `mc mirror` معکوس
   اجرا کنید.
3. سرویس‌ها را ری‌استارت کنید: `docker compose restart app worker`.

## آزمون بازیابی محلی (چک‌لیست)

- [ ] یک رکورد تست (مثلاً یک پکیج جدید) بسازید.
- [ ] پشتیبان بگیرید.
- [ ] رکورد را حذف کنید.
- [ ] بازیابی را اجرا کنید.
- [ ] مطمئن شوید رکورد برگشته است.

> در این تحویل، این چک‌لیست به‌صورت دستی نوشته شده اما در این نشست به‌صورت خودکار روی
> محیط واقعی اجرا نشده است (نیاز به دیتابیس در حال اجرا با داده واقعی دارد) — در بخش
> «محدودیت‌های شناخته‌شده» ذکر شده است.
