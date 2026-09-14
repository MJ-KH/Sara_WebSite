# اتصال‌های واقعی و آزمایشی

## وضعیت فعلی این تحویل

| اتصال | وضعیت | جزئیات |
|---|---|---|
| پرداخت (زرین‌پال) | **آزمایشی (mock) به‌طور پیش‌فرض** — adapter واقعی نوشته شده اما بدون `ZARINPAL_MERCHANT_ID` تست نشده | `src/lib/payments/zarinpal.ts` |
| پیامک (کاوه‌نگار) | **آزمایشی (mock) به‌طور پیش‌فرض** — adapter واقعی نوشته شده اما بدون `KAVENEGAR_API_KEY` تست نشده | `src/lib/sms/kavenegar.ts` |
| ذخیره‌سازی S3 | در توسعه: MinIO (واقعی، محلی) — در تولید: هر سرویس سازگار با S3 | `docker-compose.yml`, `.env` |

قانون امنیتی مهم: اگر `NODE_ENV=production` باشد و ارائه‌دهنده واقعی انتخاب نشده یا کلید
نداشته باشد، برنامه با خطای صریح متوقف می‌شود — هرگز به‌صورت خاموش به حالت آزمایشی برنمی‌گردد
(ر.ک. `src/lib/payments/index.ts` و `src/lib/sms/index.ts`).

## اتصال زرین‌پال واقعی

1. حساب پذیرنده زرین‌پال بسازید و `merchant_id` (رشته ۳۶ کاراکتری) را دریافت کنید.
2. در `.env` سرور تولید:
   ```
   PAYMENT_PROVIDER=zarinpal
   ZARINPAL_MERCHANT_ID=<merchant_id واقعی>
   ZARINPAL_SANDBOX=false
   ```
3. پیاده‌سازی طبق مستندات رسمی زرین‌پال (بررسی‌شده در زمان توسعه):
   <https://www.zarinpal.com/docs/paymentGateway/connectToGateway.html>
   پیش از رفتن به تولید، این مستند را دوباره بررسی کنید چون ممکن است تغییر کرده باشد.
4. endpoint تأیید (`verify.json`) با کد `100` یا `101` موفق تلقی می‌شود؛ کد `101` یعنی
   «قبلاً تأییدشده» — سیستم این پروژه با idempotency key از اعطای دسترسی دوباره جلوگیری
   می‌کند.

## اتصال کاوه‌نگار واقعی

1. حساب کاوه‌نگار بسازید، `API-KEY` و خط ارسال (sender) را دریافت کنید.
2. در `.env`:
   ```
   SMS_PROVIDER=kavenegar
   KAVENEGAR_API_KEY=<کلید واقعی>
   KAVENEGAR_SENDER_LINE=<خط ارسال>
   ```
3. پیاده‌سازی فعلی از endpoint عمومی `sms/send.json` استفاده می‌کند (طبق
   <https://kavenegar.com/rest.html>). **کار باقی‌مانده**: برای OTP بهتر است از
   endpoint اختصاصی `verify/lookup.json` با قالب تأییدشده در پنل کاوه‌نگار استفاده شود
   (نرخ تحویل بهتر) — این migration در این نسخه انجام نشده چون نام قالب تأییدشده مشخص
   نبود.

## S3 در تولید

هر سرویس سازگار با S3 (Liara Object Storage، Arvan Object Storage، AWS S3 و ...) با تنظیم
`S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` قابل استفاده است.
حتماً دو bucket جدا برای عمومی و خصوصی بسازید و سیاست دسترسی عمومی را فقط روی bucket
عمومی فعال کنید (bucket خصوصی نباید public باشد).
