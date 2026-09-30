import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_about_intro_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_about_intro" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar,
  	"body" varchar,
  	"photo_id" integer,
  	"link_label" varchar,
  	"link_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_start_guide_paths" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"audience" varchar,
  	"description" varchar,
  	"link_label" varchar,
  	"link_href" varchar
  );
  
  CREATE TABLE "pages_blocks_start_guide" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar DEFAULT 'از کجا شروع کنم؟',
  	"intro" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_about_intro_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_about_intro" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar,
  	"body" varchar,
  	"photo_id" integer,
  	"link_label" varchar,
  	"link_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_start_guide_paths" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"audience" varchar,
  	"description" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_start_guide" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar DEFAULT 'از کجا شروع کنم؟',
  	"intro" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_about_intro_points" ADD CONSTRAINT "pages_blocks_about_intro_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_about_intro"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_about_intro" ADD CONSTRAINT "pages_blocks_about_intro_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_about_intro" ADD CONSTRAINT "pages_blocks_about_intro_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_start_guide_paths" ADD CONSTRAINT "pages_blocks_start_guide_paths_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_start_guide"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_start_guide" ADD CONSTRAINT "pages_blocks_start_guide_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_about_intro_points" ADD CONSTRAINT "_pages_v_blocks_about_intro_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_about_intro"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_about_intro" ADD CONSTRAINT "_pages_v_blocks_about_intro_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_about_intro" ADD CONSTRAINT "_pages_v_blocks_about_intro_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_start_guide_paths" ADD CONSTRAINT "_pages_v_blocks_start_guide_paths_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_start_guide"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_start_guide" ADD CONSTRAINT "_pages_v_blocks_start_guide_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_about_intro_points_order_idx" ON "pages_blocks_about_intro_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_about_intro_points_parent_id_idx" ON "pages_blocks_about_intro_points" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_about_intro_order_idx" ON "pages_blocks_about_intro" USING btree ("_order");
  CREATE INDEX "pages_blocks_about_intro_parent_id_idx" ON "pages_blocks_about_intro" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_about_intro_path_idx" ON "pages_blocks_about_intro" USING btree ("_path");
  CREATE INDEX "pages_blocks_about_intro_photo_idx" ON "pages_blocks_about_intro" USING btree ("photo_id");
  CREATE INDEX "pages_blocks_start_guide_paths_order_idx" ON "pages_blocks_start_guide_paths" USING btree ("_order");
  CREATE INDEX "pages_blocks_start_guide_paths_parent_id_idx" ON "pages_blocks_start_guide_paths" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_start_guide_order_idx" ON "pages_blocks_start_guide" USING btree ("_order");
  CREATE INDEX "pages_blocks_start_guide_parent_id_idx" ON "pages_blocks_start_guide" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_start_guide_path_idx" ON "pages_blocks_start_guide" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_about_intro_points_order_idx" ON "_pages_v_blocks_about_intro_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_about_intro_points_parent_id_idx" ON "_pages_v_blocks_about_intro_points" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_about_intro_order_idx" ON "_pages_v_blocks_about_intro" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_about_intro_parent_id_idx" ON "_pages_v_blocks_about_intro" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_about_intro_path_idx" ON "_pages_v_blocks_about_intro" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_about_intro_photo_idx" ON "_pages_v_blocks_about_intro" USING btree ("photo_id");
  CREATE INDEX "_pages_v_blocks_start_guide_paths_order_idx" ON "_pages_v_blocks_start_guide_paths" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_start_guide_paths_parent_id_idx" ON "_pages_v_blocks_start_guide_paths" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_start_guide_order_idx" ON "_pages_v_blocks_start_guide" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_start_guide_parent_id_idx" ON "_pages_v_blocks_start_guide" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_start_guide_path_idx" ON "_pages_v_blocks_start_guide" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_about_intro_points" CASCADE;
  DROP TABLE "pages_blocks_about_intro" CASCADE;
  DROP TABLE "pages_blocks_start_guide_paths" CASCADE;
  DROP TABLE "pages_blocks_start_guide" CASCADE;
  DROP TABLE "_pages_v_blocks_about_intro_points" CASCADE;
  DROP TABLE "_pages_v_blocks_about_intro" CASCADE;
  DROP TABLE "_pages_v_blocks_start_guide_paths" CASCADE;
  DROP TABLE "_pages_v_blocks_start_guide" CASCADE;`)
}
