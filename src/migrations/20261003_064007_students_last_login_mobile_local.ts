import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "students" ADD COLUMN "mobile_local" varchar;
  ALTER TABLE "students" ADD COLUMN "last_login_at" timestamp(3) with time zone;
  CREATE INDEX "students_mobile_local_idx" ON "students" USING btree ("mobile_local");`)
  // پرونده‌های موجود: شکل محلی موبایل (+98912... -> 0912...) برای جست‌وجوی پنل
  await db.execute(sql`
   UPDATE "students" SET "mobile_local" = '0' || substring("mobile" from 4) WHERE "mobile" LIKE '+989%';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "students_mobile_local_idx";
  ALTER TABLE "students" DROP COLUMN "mobile_local";
  ALTER TABLE "students" DROP COLUMN "last_login_at";`)
}
