import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_contact_opening_days" AS ENUM('Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday');
  CREATE TABLE "site_settings_contact_opening_days" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_site_settings_contact_opening_days",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "site_settings" ALTER COLUMN "footer_copyright_text" SET DEFAULT '© سارا نقی‌زاده — آکادمی تخصصی ناخن';
  ALTER TABLE "site_settings" ADD COLUMN "brand_experience_years" numeric;
  ALTER TABLE "site_settings" ADD COLUMN "brand_portrait_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "contact_opens_at" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "contact_closes_at" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "seo_defaults_google_site_verification" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "seo_defaults_bing_site_verification" varchar;
  ALTER TABLE "site_settings_contact_opening_days" ADD CONSTRAINT "site_settings_contact_opening_days_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_contact_opening_days_order_idx" ON "site_settings_contact_opening_days" USING btree ("order");
  CREATE INDEX "site_settings_contact_opening_days_parent_idx" ON "site_settings_contact_opening_days" USING btree ("parent_id");
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_brand_portrait_id_media_id_fk" FOREIGN KEY ("brand_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_brand_brand_portrait_idx" ON "site_settings" USING btree ("brand_portrait_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_contact_opening_days" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_settings_contact_opening_days" CASCADE;
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_brand_portrait_id_media_id_fk";
  
  DROP INDEX "site_settings_brand_brand_portrait_idx";
  ALTER TABLE "site_settings" ALTER COLUMN "footer_copyright_text" SET DEFAULT '© سارا نقی‌زاده — آموزش تخصصی ناخن';
  ALTER TABLE "site_settings" DROP COLUMN "brand_experience_years";
  ALTER TABLE "site_settings" DROP COLUMN "brand_portrait_id";
  ALTER TABLE "site_settings" DROP COLUMN "contact_opens_at";
  ALTER TABLE "site_settings" DROP COLUMN "contact_closes_at";
  ALTER TABLE "site_settings" DROP COLUMN "seo_defaults_google_site_verification";
  ALTER TABLE "site_settings" DROP COLUMN "seo_defaults_bing_site_verification";
  DROP TYPE "public"."enum_site_settings_contact_opening_days";`)
}
