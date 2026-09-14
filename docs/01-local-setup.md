# راه‌اندازی محلی

## پیش‌نیازها

- Docker Desktop (ویندوز/مک) یا Docker Engine + Docker Compose (لینوکس)
- حداقل ۴ گیگابایت رم آزاد برای کانتینرها

نیازی به نصب Node.js روی سیستم خودتان نیست — همه‌چیز داخل کانتینر اجرا می‌شود.

## ویندوز (Docker Desktop)

1. Docker Desktop را نصب و اجرا کنید (از منوی استارت، یا مطمئن شوید در حال اجراست).
2. این پوشه پروژه را در PowerShell یا Git Bash باز کنید.
3. فایل محیط را کپی کنید:

   ```bash
   cp .env.example .env
   ```

4. مقادیر زیر را در `.env` حتماً تغییر دهید (نمونه‌ها امن نیستند):
   - `PAYLOAD_SECRET`
   - `STUDENT_JWT_SECRET`
   - `POSTGRES_PASSWORD` (اگر در docker-compose.yml override نشده، همان مقدار پیش‌فرض در .env استفاده می‌شود — برای امنیت بیشتر تغییرش دهید)
   - `S3_SECRET_ACCESS_KEY`
5. اجرا:

   ```bash
   docker compose up -d --build
   ```

6. صبر کنید تا سرویس‌ها healthy شوند (`docker compose ps`).
7. اجرای migration و داده نمونه (یک‌بار، از داخل کانتینر app یا با یک کانتینر موقت):

   ```bash
   docker compose exec app npx payload migrate
   docker compose exec app npm run seed
   docker compose exec app npm run create-first-admin
   ```

   دستور آخر یک مدیر با نقش owner می‌سازد. اگر `FIRST_ADMIN_EMAIL` را در `.env` گذاشته باشید
   ولی `FIRST_ADMIN_PASSWORD` را خالی بگذارید، یک رمز تصادفی امن ساخته و فقط همان یک‌بار در
   ترمینال چاپ می‌شود — آن را جایی امن ذخیره کنید.

8. سایت: <http://localhost:3000> — پنل مدیریت: <http://localhost:3000/admin>

## لینوکس

مراحل مشابه است؛ فقط بسته به توزیع، دستور `docker compose` ممکن است `docker-compose` باشد.

## توقف و اجرای مجدد

```bash
docker compose stop
docker compose start
```

توقف/اجرای مجدد داده‌ها را پاک نمی‌کند (volume پایدار `pgdata` و `miniodata`). برای پاک‌سازی
کامل (فقط در توسعه، هرگز در تولید):

```bash
docker compose down -v
```

## اجرای بدون Docker برای کد اپ (اختیاری، برای توسعه‌دهنده)

اگر Node.js ≥20.9 نصب دارید، می‌توانید فقط `postgres` و `minio` را در Docker نگه دارید و
اپ Next.js را مستقیم روی سیستم اجرا کنید:

```bash
docker compose up -d postgres minio minio-init
npm install
npm run migrate
npm run seed
npm run create-first-admin
npm run dev
```
