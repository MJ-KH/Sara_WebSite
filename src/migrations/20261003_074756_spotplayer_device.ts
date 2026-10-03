import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_spotplayer_device" AS ENUM('android', 'windows', 'ios_web');
  CREATE TYPE "public"."enum_entitlements_spotplayer_device" AS ENUM('android', 'windows', 'ios_web');
  ALTER TABLE "orders" ADD COLUMN "spotplayer_device" "enum_orders_spotplayer_device";
  ALTER TABLE "entitlements" ADD COLUMN "spotplayer_device" "enum_entitlements_spotplayer_device";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" DROP COLUMN "spotplayer_device";
  ALTER TABLE "entitlements" DROP COLUMN "spotplayer_device";
  DROP TYPE "public"."enum_orders_spotplayer_device";
  DROP TYPE "public"."enum_entitlements_spotplayer_device";`)
}
