import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "students" ADD COLUMN "province" varchar;`)
  // شهرهای قبلی که مرکز استان‌اند به استانشان نگاشت می‌شوند؛ بقیه خالی می‌مانند و شهر قدیمی حفظ می‌شود
  await db.execute(sql`
   UPDATE "students" SET "province" = m.province
   FROM (VALUES
     ('تهران', 'تهران'), ('مشهد', 'خراسان رضوی'), ('اصفهان', 'اصفهان'), ('تبریز', 'آذربایجان شرقی'),
     ('شیراز', 'فارس'), ('اهواز', 'خوزستان'), ('کرج', 'البرز'), ('قم', 'قم'), ('کرمانشاه', 'کرمانشاه'),
     ('ارومیه', 'آذربایجان غربی'), ('رشت', 'گیلان'), ('زاهدان', 'سیستان و بلوچستان'), ('همدان', 'همدان'),
     ('کرمان', 'کرمان'), ('یزد', 'یزد'), ('اردبیل', 'اردبیل'), ('بندرعباس', 'هرمزگان'), ('اراک', 'مرکزی'),
     ('زنجان', 'زنجان'), ('سنندج', 'کردستان'), ('قزوین', 'قزوین'), ('خرم‌آباد', 'لرستان'), ('گرگان', 'گلستان'),
     ('ساری', 'مازندران'), ('بجنورد', 'خراسان شمالی'), ('بوشهر', 'بوشهر'), ('بیرجند', 'خراسان جنوبی'),
     ('ایلام', 'ایلام'), ('شهرکرد', 'چهارمحال و بختیاری'), ('یاسوج', 'کهگیلویه و بویراحمد'), ('سمنان', 'سمنان')
   ) AS m(city, province)
   WHERE btrim("students"."city") = m.city AND "students"."province" IS NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "students" DROP COLUMN "province";`)
}
