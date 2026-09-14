# استقرار روی سرور

## پیش‌نیاز

سرور لینوکسی با Docker و Docker Compose نصب‌شده، یک دامنه، و یک reverse proxy برای HTTPS
(پیشنهاد: Caddy یا Nginx + Certbot؛ Caddy به‌دلیل HTTPS خودکار ساده‌تر است).

## مراحل

1. مخزن را روی سرور clone کنید.
2. `.env` را با مقادیر واقعی تولید پر کنید (اسرار قوی، `NODE_ENV=production`،
   `PAYMENT_PROVIDER=zarinpal` + کلید واقعی، `SMS_PROVIDER=kavenegar` + کلید واقعی،
   `NEXT_PUBLIC_SERVER_URL=https://دامنه-شما`). **مهم**: `S3_PUBLIC_URL_PROTOCOL` /
   `S3_PUBLIC_URL_HOSTNAME` / `S3_PUBLIC_URL_PORT` باید پیش از build به آدرس واقعی
   سرویس S3/CDN تنظیم شوند (این مقادیر در `next.config.ts` هنگام build خوانده می‌شوند تا
   next/image اجازه نمایش تصاویر را بدهد) — اگر بعداً تغییرشان دهید باید image را دوباره
   build کنید.
3. اگر از S3 ابری واقعی استفاده می‌کنید، سرویس `minio`/`minio-init` را از
   `docker-compose.yml` حذف کنید و مستقیم به آن سرویس وصل شوید.
4. اجرا:
   ```bash
   docker compose up -d --build
   docker compose exec app npx payload migrate
   docker compose exec app npm run create-first-admin
   ```
5. reverse proxy را برای `NEXT_PUBLIC_SERVER_URL` روی پورت ۳۰۰۰ کانتینر `app` تنظیم کنید و
   HTTPS را فعال کنید (نمونه Caddyfile):
   ```
   your-domain.com {
     reverse_proxy localhost:3000
   }
   ```
6. مطمئن شوید سرویس `worker` هم اجرا مانده (health خاصی برای worker تعریف نشده؛ لاگ آن را
   با `docker compose logs -f worker` رصد کنید).

## نکات امنیتی استقرار

- هرگز `.env` را در مخزن گیت commit نکنید.
- `PAYLOAD_SECRET` و `STUDENT_JWT_SECRET` باید مقادیر تصادفی طولانی و متفاوت باشند.
- فایروال سرور فقط پورت‌های ۸۰/۴۴۳ (و درصورت نیاز SSH) را باز نگه دارد؛ پورت‌های ۵۴۳۲
  (postgres) و ۹۰۰۰/۹۰۰۱ (minio) نباید از اینترنت عمومی در دسترس باشند.
- به‌روزرسانی دوره‌ای image پایه Node و بسته‌ها را در برنامه نگهداری قرار دهید.

## کار باقی‌مانده مستند

پایپ‌لاین CI/CD (build/test خودکار روی هر push) در این نسخه پیاده نشده — استقرار در حال
حاضر دستی است. این مورد در «محدودیت‌های شناخته‌شده» ثبت شده است.
