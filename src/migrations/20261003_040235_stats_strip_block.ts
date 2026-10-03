import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_stats_strip_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_stats_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats_strip_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_stats_strip_items" ADD CONSTRAINT "pages_blocks_stats_strip_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_stats_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_strip" ADD CONSTRAINT "pages_blocks_stats_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats_strip_items" ADD CONSTRAINT "_pages_v_blocks_stats_strip_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_stats_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats_strip" ADD CONSTRAINT "_pages_v_blocks_stats_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_stats_strip_items_order_idx" ON "pages_blocks_stats_strip_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_strip_items_parent_id_idx" ON "pages_blocks_stats_strip_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_strip_order_idx" ON "pages_blocks_stats_strip" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_strip_parent_id_idx" ON "pages_blocks_stats_strip" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_strip_path_idx" ON "pages_blocks_stats_strip" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_stats_strip_items_order_idx" ON "_pages_v_blocks_stats_strip_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_strip_items_parent_id_idx" ON "_pages_v_blocks_stats_strip_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_strip_order_idx" ON "_pages_v_blocks_stats_strip" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_strip_parent_id_idx" ON "_pages_v_blocks_stats_strip" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_strip_path_idx" ON "_pages_v_blocks_stats_strip" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_stats_strip_items" CASCADE;
  DROP TABLE "pages_blocks_stats_strip" CASCADE;
  DROP TABLE "_pages_v_blocks_stats_strip_items" CASCADE;
  DROP TABLE "_pages_v_blocks_stats_strip" CASCADE;`)
}
