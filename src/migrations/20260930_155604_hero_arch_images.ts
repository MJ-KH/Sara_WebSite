import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_media_id_idx" ON "pages_rels" USING btree ("media_id");
  CREATE INDEX "_pages_v_rels_media_id_idx" ON "_pages_v_rels" USING btree ("media_id");
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "image_position";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "image_position";
  DROP TYPE "public"."enum_pages_blocks_hero_image_position";
  DROP TYPE "public"."enum__pages_v_blocks_hero_image_position";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_hero_image_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_image_position" AS ENUM('right', 'left');
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_media_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_media_fk";
  
  DROP INDEX "pages_rels_media_id_idx";
  DROP INDEX "_pages_v_rels_media_id_idx";
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "image_position" "enum_pages_blocks_hero_image_position" DEFAULT 'right';
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "image_position" "enum__pages_v_blocks_hero_image_position" DEFAULT 'right';
  ALTER TABLE "pages_rels" DROP COLUMN "media_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "media_id";`)
}
