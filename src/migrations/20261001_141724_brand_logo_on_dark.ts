import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "brand_logo_on_dark_id" integer;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_brand_logo_on_dark_id_media_id_fk" FOREIGN KEY ("brand_logo_on_dark_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_brand_brand_logo_on_dark_idx" ON "site_settings" USING btree ("brand_logo_on_dark_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_brand_logo_on_dark_id_media_id_fk";
  
  DROP INDEX "site_settings_brand_brand_logo_on_dark_idx";
  ALTER TABLE "site_settings" DROP COLUMN "brand_logo_on_dark_id";`)
}
