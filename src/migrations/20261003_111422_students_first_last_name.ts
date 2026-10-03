import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "students" ADD COLUMN "first_name" varchar;
  ALTER TABLE "students" ADD COLUMN "last_name" varchar;`)
  // پرونده‌های موجود: «نام کامل» با اولین فاصله به نام و نام خانوادگی شکسته می‌شود
  await db.execute(sql`
   UPDATE "students"
   SET "first_name" = split_part(btrim("name"), ' ', 1),
       "last_name" = NULLIF(btrim(substr(btrim("name"), length(split_part(btrim("name"), ' ', 1)) + 1)), '')
   WHERE "name" IS NOT NULL AND btrim("name") <> '';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "students" DROP COLUMN "first_name";
  ALTER TABLE "students" DROP COLUMN "last_name";`)
}
