import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_entitlements_spotplayer_status" AS ENUM('pending', 'issuing', 'issued', 'failed');
  ALTER TABLE "pages_blocks_consultation_form" ALTER COLUMN "heading" SET DEFAULT 'مشاوره رایگان انتخاب دوره';
  ALTER TABLE "_pages_v_blocks_consultation_form" ALTER COLUMN "heading" SET DEFAULT 'مشاوره رایگان انتخاب دوره';
  ALTER TABLE "packages" ADD COLUMN "spotplayer_course_id" varchar;
  ALTER TABLE "entitlements" ADD COLUMN "spotplayer_status" "enum_entitlements_spotplayer_status";
  ALTER TABLE "entitlements" ADD COLUMN "spotplayer_license_key" varchar;
  ALTER TABLE "entitlements" ADD COLUMN "spotplayer_license_id" varchar;
  ALTER TABLE "entitlements" ADD COLUMN "spotplayer_download_url" varchar;
  ALTER TABLE "entitlements" ADD COLUMN "spotplayer_issued_at" timestamp(3) with time zone;
  ALTER TABLE "entitlements" ADD COLUMN "spotplayer_is_test" boolean;
  ALTER TABLE "entitlements" ADD COLUMN "spotplayer_last_error" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_consultation_form" ALTER COLUMN "heading" SET DEFAULT 'مشاوره رایگان انتخاب پکیج';
  ALTER TABLE "_pages_v_blocks_consultation_form" ALTER COLUMN "heading" SET DEFAULT 'مشاوره رایگان انتخاب پکیج';
  ALTER TABLE "packages" DROP COLUMN "spotplayer_course_id";
  ALTER TABLE "entitlements" DROP COLUMN "spotplayer_status";
  ALTER TABLE "entitlements" DROP COLUMN "spotplayer_license_key";
  ALTER TABLE "entitlements" DROP COLUMN "spotplayer_license_id";
  ALTER TABLE "entitlements" DROP COLUMN "spotplayer_download_url";
  ALTER TABLE "entitlements" DROP COLUMN "spotplayer_issued_at";
  ALTER TABLE "entitlements" DROP COLUMN "spotplayer_is_test";
  ALTER TABLE "entitlements" DROP COLUMN "spotplayer_last_error";
  DROP TYPE "public"."enum_entitlements_spotplayer_status";`)
}
