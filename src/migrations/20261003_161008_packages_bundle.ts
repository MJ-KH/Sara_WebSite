import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_packages_kind" ADD VALUE 'bundle';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "packages" ALTER COLUMN "kind" SET DATA TYPE text;
  ALTER TABLE "packages" ALTER COLUMN "kind" SET DEFAULT 'comprehensive'::text;
  DROP TYPE "public"."enum_packages_kind";
  CREATE TYPE "public"."enum_packages_kind" AS ENUM('comprehensive', 'short');
  ALTER TABLE "packages" ALTER COLUMN "kind" SET DEFAULT 'comprehensive'::"public"."enum_packages_kind";
  ALTER TABLE "packages" ALTER COLUMN "kind" SET DATA TYPE "public"."enum_packages_kind" USING "kind"::"public"."enum_packages_kind";`)
}
