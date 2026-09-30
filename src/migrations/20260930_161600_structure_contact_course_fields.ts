import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "packages_projects" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "packages_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_before_after_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"before_id" integer,
  	"after_id" integer,
  	"caption" varchar,
  	"student_name" varchar,
  	"consent" boolean DEFAULT false
  );
  
  CREATE TABLE "pages_blocks_before_after" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar,
  	"intro" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_before_after_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"before_id" integer,
  	"after_id" integer,
  	"caption" varchar,
  	"student_name" varchar,
  	"consent" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_before_after" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar,
  	"intro" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "packages" ADD COLUMN "problem" varchar;
  ALTER TABLE "packages" ADD COLUMN "skill_shift_before" varchar;
  ALTER TABLE "packages" ADD COLUMN "skill_shift_after" varchar;
  ALTER TABLE "packages" ADD COLUMN "promo_video_id" integer;
  ALTER TABLE "packages" ADD COLUMN "not_for" varchar;
  ALTER TABLE "packages" ADD COLUMN "certificate_issued" boolean DEFAULT false;
  ALTER TABLE "packages" ADD COLUMN "certificate_description" varchar;
  ALTER TABLE "packages" ADD COLUMN "payment_terms" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "instagram_salon_handle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "socials_youtube_url" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "socials_telegram_handle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "contact_landline" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "contact_whatsapp" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "contact_whatsapp_greeting" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "contact_neshan_url" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "contact_google_maps_url" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "contact_visit_notes" varchar;
  ALTER TABLE "packages_projects" ADD CONSTRAINT "packages_projects_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "packages_projects" ADD CONSTRAINT "packages_projects_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "packages_benefits" ADD CONSTRAINT "packages_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_before_after_items" ADD CONSTRAINT "pages_blocks_before_after_items_before_id_media_id_fk" FOREIGN KEY ("before_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_before_after_items" ADD CONSTRAINT "pages_blocks_before_after_items_after_id_media_id_fk" FOREIGN KEY ("after_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_before_after_items" ADD CONSTRAINT "pages_blocks_before_after_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_before_after"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_before_after" ADD CONSTRAINT "pages_blocks_before_after_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_before_after_items" ADD CONSTRAINT "_pages_v_blocks_before_after_items_before_id_media_id_fk" FOREIGN KEY ("before_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_before_after_items" ADD CONSTRAINT "_pages_v_blocks_before_after_items_after_id_media_id_fk" FOREIGN KEY ("after_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_before_after_items" ADD CONSTRAINT "_pages_v_blocks_before_after_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_before_after"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_before_after" ADD CONSTRAINT "_pages_v_blocks_before_after_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "packages_projects_order_idx" ON "packages_projects" USING btree ("_order");
  CREATE INDEX "packages_projects_parent_id_idx" ON "packages_projects" USING btree ("_parent_id");
  CREATE INDEX "packages_projects_image_idx" ON "packages_projects" USING btree ("image_id");
  CREATE INDEX "packages_benefits_order_idx" ON "packages_benefits" USING btree ("_order");
  CREATE INDEX "packages_benefits_parent_id_idx" ON "packages_benefits" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_before_after_items_order_idx" ON "pages_blocks_before_after_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_before_after_items_parent_id_idx" ON "pages_blocks_before_after_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_before_after_items_before_idx" ON "pages_blocks_before_after_items" USING btree ("before_id");
  CREATE INDEX "pages_blocks_before_after_items_after_idx" ON "pages_blocks_before_after_items" USING btree ("after_id");
  CREATE INDEX "pages_blocks_before_after_order_idx" ON "pages_blocks_before_after" USING btree ("_order");
  CREATE INDEX "pages_blocks_before_after_parent_id_idx" ON "pages_blocks_before_after" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_before_after_path_idx" ON "pages_blocks_before_after" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_before_after_items_order_idx" ON "_pages_v_blocks_before_after_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_before_after_items_parent_id_idx" ON "_pages_v_blocks_before_after_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_before_after_items_before_idx" ON "_pages_v_blocks_before_after_items" USING btree ("before_id");
  CREATE INDEX "_pages_v_blocks_before_after_items_after_idx" ON "_pages_v_blocks_before_after_items" USING btree ("after_id");
  CREATE INDEX "_pages_v_blocks_before_after_order_idx" ON "_pages_v_blocks_before_after" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_before_after_parent_id_idx" ON "_pages_v_blocks_before_after" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_before_after_path_idx" ON "_pages_v_blocks_before_after" USING btree ("_path");
  ALTER TABLE "packages" ADD CONSTRAINT "packages_promo_video_id_media_id_fk" FOREIGN KEY ("promo_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "packages_promo_video_idx" ON "packages" USING btree ("promo_video_id");
  ALTER TABLE "site_settings" DROP COLUMN "contact_map_embed_url";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "packages_projects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "packages_benefits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_before_after_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_before_after" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_before_after_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_before_after" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "packages_projects" CASCADE;
  DROP TABLE "packages_benefits" CASCADE;
  DROP TABLE "pages_blocks_before_after_items" CASCADE;
  DROP TABLE "pages_blocks_before_after" CASCADE;
  DROP TABLE "_pages_v_blocks_before_after_items" CASCADE;
  DROP TABLE "_pages_v_blocks_before_after" CASCADE;
  ALTER TABLE "packages" DROP CONSTRAINT "packages_promo_video_id_media_id_fk";
  
  DROP INDEX "packages_promo_video_idx";
  ALTER TABLE "site_settings" ADD COLUMN "contact_map_embed_url" varchar;
  ALTER TABLE "packages" DROP COLUMN "problem";
  ALTER TABLE "packages" DROP COLUMN "skill_shift_before";
  ALTER TABLE "packages" DROP COLUMN "skill_shift_after";
  ALTER TABLE "packages" DROP COLUMN "promo_video_id";
  ALTER TABLE "packages" DROP COLUMN "not_for";
  ALTER TABLE "packages" DROP COLUMN "certificate_issued";
  ALTER TABLE "packages" DROP COLUMN "certificate_description";
  ALTER TABLE "packages" DROP COLUMN "payment_terms";
  ALTER TABLE "site_settings" DROP COLUMN "instagram_salon_handle";
  ALTER TABLE "site_settings" DROP COLUMN "socials_youtube_url";
  ALTER TABLE "site_settings" DROP COLUMN "socials_telegram_handle";
  ALTER TABLE "site_settings" DROP COLUMN "contact_landline";
  ALTER TABLE "site_settings" DROP COLUMN "contact_whatsapp";
  ALTER TABLE "site_settings" DROP COLUMN "contact_whatsapp_greeting";
  ALTER TABLE "site_settings" DROP COLUMN "contact_neshan_url";
  ALTER TABLE "site_settings" DROP COLUMN "contact_google_maps_url";
  ALTER TABLE "site_settings" DROP COLUMN "contact_visit_notes";`)
}
