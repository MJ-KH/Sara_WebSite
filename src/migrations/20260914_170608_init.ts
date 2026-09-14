import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_admin_users_role" AS ENUM('owner', 'business_admin', 'support');
  CREATE TYPE "public"."enum_students_interests" AS ENUM('powder_gel', 'extensions', 'nail_art', 'troubleshooting', 'manicure_prep');
  CREATE TYPE "public"."enum_students_skill_level" AS ENUM('beginner', 'experienced', 'professional');
  CREATE TYPE "public"."enum_students_status" AS ENUM('active', 'blocked');
  CREATE TYPE "public"."enum_media_private_kind" AS ENUM('video', 'attachment');
  CREATE TYPE "public"."enum_media_private_processing_status" AS ENUM('ready', 'error');
  CREATE TYPE "public"."enum_packages_topics" AS ENUM('powder_gel', 'extensions', 'nail_art', 'troubleshooting', 'manicure_prep');
  CREATE TYPE "public"."enum_packages_level" AS ENUM('beginner', 'intermediate', 'advanced');
  CREATE TYPE "public"."enum_packages_kind" AS ENUM('comprehensive', 'short');
  CREATE TYPE "public"."enum_packages_status" AS ENUM('draft', 'published', 'stopped');
  CREATE TYPE "public"."enum_chapters_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_lessons_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_orders_subject_type" AS ENUM('package', 'workshop_session');
  CREATE TYPE "public"."enum_orders_status" AS ENUM('pending', 'paid', 'failed', 'canceled', 'refund_requested', 'refunded');
  CREATE TYPE "public"."enum_orders_refund_method" AS ENUM('online', 'manual');
  CREATE TYPE "public"."enum_payment_attempts_status" AS ENUM('initiated', 'succeeded', 'failed');
  CREATE TYPE "public"."enum_discount_codes_type" AS ENUM('percent', 'fixed');
  CREATE TYPE "public"."enum_workshops_level" AS ENUM('beginner', 'intermediate', 'advanced');
  CREATE TYPE "public"."enum_workshops_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_workshop_sessions_status" AS ENUM('draft', 'published', 'closed', 'completed', 'canceled');
  CREATE TYPE "public"."enum_workshop_reservations_status" AS ENUM('holding', 'confirmed', 'expired', 'released');
  CREATE TYPE "public"."enum_workshop_enrollments_status" AS ENUM('confirmed', 'canceled');
  CREATE TYPE "public"."enum_free_lessons_content_type" AS ENUM('article', 'video', 'file');
  CREATE TYPE "public"."enum_free_lessons_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_consultation_requests_status" AS ENUM('new', 'following', 'done');
  CREATE TYPE "public"."enum_support_tickets_messages_from" AS ENUM('student', 'staff');
  CREATE TYPE "public"."enum_support_tickets_status" AS ENUM('open', 'answered', 'closed');
  CREATE TYPE "public"."enum_pages_blocks_hero_image_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum_pages_blocks_video_source_type" AS ENUM('upload', 'external');
  CREATE TYPE "public"."enum_pages_blocks_package_list_mode" AS ENUM('featured', 'latest', 'manual');
  CREATE TYPE "public"."enum_pages_blocks_workshop_list_mode" AS ENUM('upcoming', 'manual');
  CREATE TYPE "public"."enum_pages_blocks_free_lesson_list_mode" AS ENUM('latest', 'category', 'manual');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_mode" AS ENUM('all', 'manual');
  CREATE TYPE "public"."enum_pages_blocks_cta_style" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_image_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum__pages_v_blocks_video_source_type" AS ENUM('upload', 'external');
  CREATE TYPE "public"."enum__pages_v_blocks_package_list_mode" AS ENUM('featured', 'latest', 'manual');
  CREATE TYPE "public"."enum__pages_v_blocks_workshop_list_mode" AS ENUM('upcoming', 'manual');
  CREATE TYPE "public"."enum__pages_v_blocks_free_lesson_list_mode" AS ENUM('latest', 'category', 'manual');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_mode" AS ENUM('all', 'manual');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_style" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_message_templates_key" AS ENUM('purchase_confirm', 'workshop_enrollment_confirm', 'workshop_reminder', 'birthday', 'package_updated', 'waitlist_seat_available');
  CREATE TYPE "public"."enum_message_templates_category" AS ENUM('transactional', 'marketing');
  CREATE TYPE "public"."enum_campaigns_status" AS ENUM('draft', 'queued', 'sent');
  CREATE TYPE "public"."enum_jobs_status" AS ENUM('pending', 'processing', 'sent', 'failed');
  CREATE TYPE "public"."enum_redirects_status_code" AS ENUM('301', '302');
  CREATE TYPE "public"."enum_site_settings_theme_primary_color" AS ENUM('gold-dark', 'gold-rose', 'copper');
  CREATE TYPE "public"."enum_site_settings_theme_font_scale" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum_site_settings_theme_radius" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum_site_settings_theme_button_style" AS ENUM('solid', 'outline');
  CREATE TABLE "admin_users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "admin_users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_admin_users_role" DEFAULT 'support' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "students_interests" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_students_interests",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "students" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"mobile" varchar NOT NULL,
  	"name" varchar,
  	"email" varchar,
  	"birthday_jalali_day" numeric,
  	"birthday_jalali_month" numeric,
  	"birthday_jalali_year" numeric,
  	"city" varchar,
  	"skill_level" "enum_students_skill_level",
  	"acquisition_source" varchar,
  	"acquisition_medium" varchar,
  	"acquisition_campaign" varchar,
  	"marketing_consent" boolean DEFAULT false,
  	"internal_notes" varchar,
  	"status" "enum_students_status" DEFAULT 'active',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "students_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "otp_codes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"mobile" varchar NOT NULL,
  	"code_hash" varchar NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"attempts" numeric DEFAULT 0 NOT NULL,
  	"consumed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "media_private" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_media_private_kind" DEFAULT 'video' NOT NULL,
  	"processing_status" "enum_media_private_processing_status" DEFAULT 'ready',
  	"error_message" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "packages_topics" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_packages_topics",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "packages_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "packages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"subtitle" varchar,
  	"cover_image_id" integer,
  	"level" "enum_packages_level" NOT NULL,
  	"kind" "enum_packages_kind" DEFAULT 'comprehensive' NOT NULL,
  	"description" jsonb,
  	"target_audience" varchar,
  	"expected_outcome" varchar,
  	"tools_and_materials" varchar,
  	"price_rial" numeric NOT NULL,
  	"compare_at_price_rial" numeric,
  	"access_duration_days" numeric,
  	"support_scope" varchar,
  	"status" "enum_packages_status" DEFAULT 'draft' NOT NULL,
  	"featured" boolean DEFAULT false,
  	"featured_order" numeric,
  	"cancellation_policy" varchar,
  	"content_updated_at" timestamp(3) with time zone,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "packages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"packages_id" integer
  );
  
  CREATE TABLE "chapters" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"package_id" integer NOT NULL,
  	"title" varchar NOT NULL,
  	"order" numeric DEFAULT 0 NOT NULL,
  	"status" "enum_chapters_status" DEFAULT 'draft' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "lessons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"package_id" integer NOT NULL,
  	"chapter_id" integer NOT NULL,
  	"title" varchar NOT NULL,
  	"order" numeric DEFAULT 0 NOT NULL,
  	"summary" varchar,
  	"video_private_id" integer,
  	"duration_seconds" numeric,
  	"is_free_preview" boolean DEFAULT false,
  	"status" "enum_lessons_status" DEFAULT 'draft' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "lessons_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_private_id" integer
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"student_id" integer NOT NULL,
  	"subject_type" "enum_orders_subject_type" NOT NULL,
  	"subject_package_id" integer,
  	"subject_workshop_session_id" integer,
  	"title_snapshot" varchar NOT NULL,
  	"unit_price_rial_snapshot" numeric NOT NULL,
  	"discount_code_id" integer,
  	"discount_code_snapshot" varchar,
  	"discount_amount_rial_snapshot" numeric DEFAULT 0,
  	"total_rial_snapshot" numeric NOT NULL,
  	"access_duration_days_snapshot" numeric,
  	"terms_version_snapshot" varchar,
  	"status" "enum_orders_status" DEFAULT 'pending' NOT NULL,
  	"paid_at" timestamp(3) with time zone,
  	"refund_requested_at" timestamp(3) with time zone,
  	"refund_reason" varchar,
  	"refund_method" "enum_orders_refund_method",
  	"refund_amount_rial" numeric,
  	"refund_note" varchar,
  	"refund_completed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payment_attempts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order_id" integer NOT NULL,
  	"gateway" varchar NOT NULL,
  	"provider_ref_id" varchar NOT NULL,
  	"amount_rial_snapshot" numeric NOT NULL,
  	"status" "enum_payment_attempts_status" DEFAULT 'initiated' NOT NULL,
  	"provider_transaction_id" varchar,
  	"raw_response_redacted" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "entitlements_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"changed_at" timestamp(3) with time zone NOT NULL,
  	"changed_by_id" integer,
  	"action" varchar NOT NULL,
  	"note" varchar
  );
  
  CREATE TABLE "entitlements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"student_id" integer NOT NULL,
  	"package_id" integer NOT NULL,
  	"source_order_id" integer,
  	"granted_at" timestamp(3) with time zone NOT NULL,
  	"expires_at" timestamp(3) with time zone,
  	"revoked_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "lesson_progress" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"student_id" integer NOT NULL,
  	"lesson_id" integer NOT NULL,
  	"position_seconds" numeric DEFAULT 0 NOT NULL,
  	"completed" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "discount_codes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"type" "enum_discount_codes_type" DEFAULT 'percent' NOT NULL,
  	"value" numeric NOT NULL,
  	"valid_from" timestamp(3) with time zone,
  	"valid_to" timestamp(3) with time zone,
  	"max_uses" numeric,
  	"max_uses_per_student" numeric DEFAULT 1,
  	"used_count" numeric DEFAULT 0,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "discount_codes_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"packages_id" integer
  );
  
  CREATE TABLE "workshops" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"cover_image_id" integer,
  	"level" "enum_workshops_level",
  	"description" jsonb,
  	"syllabus" jsonb,
  	"certificate_type" varchar,
  	"status" "enum_workshops_status" DEFAULT 'draft' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "workshop_sessions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"workshop_id" integer NOT NULL,
  	"start_at" timestamp(3) with time zone NOT NULL,
  	"end_at" timestamp(3) with time zone,
  	"location" varchar,
  	"capacity" numeric NOT NULL,
  	"occupied_count" numeric DEFAULT 0 NOT NULL,
  	"price_rial" numeric NOT NULL,
  	"tools_needed" varchar,
  	"practice_requirements" varchar,
  	"cancellation_policy" varchar,
  	"status" "enum_workshop_sessions_status" DEFAULT 'draft' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "workshop_reservations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"session_id" integer NOT NULL,
  	"student_id" integer NOT NULL,
  	"status" "enum_workshop_reservations_status" DEFAULT 'holding' NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"order_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "workshop_enrollments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"session_id" integer NOT NULL,
  	"student_id" integer NOT NULL,
  	"order_id" integer NOT NULL,
  	"status" "enum_workshop_enrollments_status" DEFAULT 'confirmed' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "workshop_waitlist" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"session_id" integer NOT NULL,
  	"student_id" integer NOT NULL,
  	"joined_at" timestamp(3) with time zone NOT NULL,
  	"notified_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "free_lesson_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "free_lessons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"category_id" integer,
  	"content_type" "enum_free_lessons_content_type" DEFAULT 'article' NOT NULL,
  	"cover_image_id" integer,
  	"body" jsonb,
  	"video_url" varchar,
  	"download_file_id" integer,
  	"requires_login_for_download" boolean DEFAULT false,
  	"related_package_id" integer,
  	"status" "enum_free_lessons_status" DEFAULT 'draft' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"student_name" varchar NOT NULL,
  	"avatar_id" integer,
  	"content" varchar NOT NULL,
  	"work_sample_id" integer,
  	"related_package_id" integer,
  	"approved" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "consultation_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"mobile" varchar NOT NULL,
  	"city" varchar,
  	"skill_level" varchar,
  	"goal" varchar,
  	"linked_student_id" integer,
  	"status" "enum_consultation_requests_status" DEFAULT 'new' NOT NULL,
  	"internal_note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "support_tickets_messages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"from" "enum_support_tickets_messages_from" NOT NULL,
  	"body" varchar NOT NULL,
  	"created_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "support_tickets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"student_id" integer NOT NULL,
  	"subject" varchar NOT NULL,
  	"related_order_id" integer,
  	"related_package_id" integer,
  	"status" "enum_support_tickets_status" DEFAULT 'open' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar,
  	"subheading" varchar,
  	"image_id" integer,
  	"image_position" "enum_pages_blocks_hero_image_position" DEFAULT 'right',
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"image_id" integer,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar,
  	"source_type" "enum_pages_blocks_video_source_type" DEFAULT 'upload',
  	"media_file_id" integer,
  	"external_url" varchar,
  	"poster_image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_package_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar,
  	"mode" "enum_pages_blocks_package_list_mode" DEFAULT 'featured',
  	"limit" numeric DEFAULT 6,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_workshop_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar,
  	"mode" "enum_pages_blocks_workshop_list_mode" DEFAULT 'upcoming',
  	"limit" numeric DEFAULT 3,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_free_lesson_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar,
  	"mode" "enum_pages_blocks_free_lesson_list_mode" DEFAULT 'latest',
  	"category_id" integer,
  	"limit" numeric DEFAULT 4,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar,
  	"mode" "enum_pages_blocks_testimonials_mode" DEFAULT 'all',
  	"limit" numeric DEFAULT 6,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar DEFAULT 'پرسش‌های متداول',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_consultation_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar DEFAULT 'مشاوره رایگان انتخاب پکیج',
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar,
  	"description" varchar,
  	"button_label" varchar,
  	"button_href" varchar,
  	"style" "enum_pages_blocks_cta_style" DEFAULT 'primary',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_og_image_id" integer,
  	"seo_canonical_path" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"packages_id" integer,
  	"workshop_sessions_id" integer,
  	"free_lessons_id" integer,
  	"testimonials_id" integer
  );
  
  CREATE TABLE "_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar,
  	"subheading" varchar,
  	"image_id" integer,
  	"image_position" "enum__pages_v_blocks_hero_image_position" DEFAULT 'right',
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"image_id" integer,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar,
  	"source_type" "enum__pages_v_blocks_video_source_type" DEFAULT 'upload',
  	"media_file_id" integer,
  	"external_url" varchar,
  	"poster_image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_package_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar,
  	"mode" "enum__pages_v_blocks_package_list_mode" DEFAULT 'featured',
  	"limit" numeric DEFAULT 6,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_workshop_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar,
  	"mode" "enum__pages_v_blocks_workshop_list_mode" DEFAULT 'upcoming',
  	"limit" numeric DEFAULT 3,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_free_lesson_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar,
  	"mode" "enum__pages_v_blocks_free_lesson_list_mode" DEFAULT 'latest',
  	"category_id" integer,
  	"limit" numeric DEFAULT 4,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar,
  	"mode" "enum__pages_v_blocks_testimonials_mode" DEFAULT 'all',
  	"limit" numeric DEFAULT 6,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar DEFAULT 'پرسش‌های متداول',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_consultation_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar DEFAULT 'مشاوره رایگان انتخاب پکیج',
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"heading" varchar,
  	"description" varchar,
  	"button_label" varchar,
  	"button_href" varchar,
  	"style" "enum__pages_v_blocks_cta_style" DEFAULT 'primary',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version_seo_canonical_path" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"packages_id" integer,
  	"workshop_sessions_id" integer,
  	"free_lessons_id" integer,
  	"testimonials_id" integer
  );
  
  CREATE TABLE "message_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" "enum_message_templates_key" NOT NULL,
  	"category" "enum_message_templates_category" NOT NULL,
  	"body" varchar NOT NULL,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "campaigns" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"audience_filter_only_marketing_consent" boolean DEFAULT true,
  	"audience_filter_city" varchar,
  	"audience_filter_tag" varchar,
  	"status" "enum_campaigns_status" DEFAULT 'draft' NOT NULL,
  	"approved_by_id" integer,
  	"approved_at" timestamp(3) with time zone,
  	"audience_count_at_approval" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" varchar NOT NULL,
  	"unique_key" varchar NOT NULL,
  	"payload" jsonb NOT NULL,
  	"scheduled_for" timestamp(3) with time zone NOT NULL,
  	"status" "enum_jobs_status" DEFAULT 'pending' NOT NULL,
  	"attempts" numeric DEFAULT 0 NOT NULL,
  	"last_error" varchar,
  	"provider_message_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "audit_log" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"action" varchar NOT NULL,
  	"entity_type" varchar NOT NULL,
  	"entity_id" varchar,
  	"actor_label" varchar,
  	"before_json" jsonb,
  	"after_json" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from_path" varchar NOT NULL,
  	"to_path" varchar NOT NULL,
  	"status_code" "enum_redirects_status_code" DEFAULT '301' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admin_users_id" integer,
  	"students_id" integer,
  	"otp_codes_id" integer,
  	"media_id" integer,
  	"media_private_id" integer,
  	"packages_id" integer,
  	"chapters_id" integer,
  	"lessons_id" integer,
  	"orders_id" integer,
  	"payment_attempts_id" integer,
  	"entitlements_id" integer,
  	"lesson_progress_id" integer,
  	"discount_codes_id" integer,
  	"workshops_id" integer,
  	"workshop_sessions_id" integer,
  	"workshop_reservations_id" integer,
  	"workshop_enrollments_id" integer,
  	"workshop_waitlist_id" integer,
  	"free_lesson_categories_id" integer,
  	"free_lessons_id" integer,
  	"testimonials_id" integer,
  	"consultation_requests_id" integer,
  	"support_tickets_id" integer,
  	"pages_id" integer,
  	"message_templates_id" integer,
  	"campaigns_id" integer,
  	"jobs_id" integer,
  	"audit_log_id" integer,
  	"redirects_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admin_users_id" integer,
  	"students_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_header_menu_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_header_menu" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"brand_name_fa" varchar DEFAULT 'سارا نقی‌زاده' NOT NULL,
  	"brand_name_en" varchar DEFAULT 'Sara Naghizadeh' NOT NULL,
  	"brand_tagline" varchar,
  	"brand_logo_id" integer,
  	"brand_favicon_id" integer,
  	"instagram_academy_handle" varchar DEFAULT 'saranaghizadeh_nailacademy',
  	"instagram_services_handle" varchar DEFAULT 'sara_vip_nailfashion',
  	"contact_phone" varchar,
  	"contact_email" varchar,
  	"contact_address" varchar,
  	"contact_map_embed_url" varchar,
  	"footer_copyright_text" varchar DEFAULT '© سارا نقی‌زاده — آموزش تخصصی ناخن',
  	"announcement_bar_enabled" boolean DEFAULT false,
  	"announcement_bar_text" varchar,
  	"announcement_bar_href" varchar,
  	"theme_primary_color" "enum_site_settings_theme_primary_color" DEFAULT 'gold-dark',
  	"theme_font_scale" "enum_site_settings_theme_font_scale" DEFAULT 'md',
  	"theme_radius" "enum_site_settings_theme_radius" DEFAULT 'md',
  	"theme_button_style" "enum_site_settings_theme_button_style" DEFAULT 'solid',
  	"legal_purchase_terms_version" varchar DEFAULT '1' NOT NULL,
  	"legal_purchase_terms_text" jsonb,
  	"legal_privacy_text" jsonb,
  	"seo_defaults_meta_title" varchar,
  	"seo_defaults_meta_description" varchar,
  	"seo_defaults_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "admin_users_sessions" ADD CONSTRAINT "admin_users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "students_interests" ADD CONSTRAINT "students_interests_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "students_texts" ADD CONSTRAINT "students_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "packages_topics" ADD CONSTRAINT "packages_topics_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "packages_faqs" ADD CONSTRAINT "packages_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "packages" ADD CONSTRAINT "packages_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "packages" ADD CONSTRAINT "packages_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "packages_rels" ADD CONSTRAINT "packages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "packages_rels" ADD CONSTRAINT "packages_rels_packages_fk" FOREIGN KEY ("packages_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chapters" ADD CONSTRAINT "chapters_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons" ADD CONSTRAINT "lessons_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons" ADD CONSTRAINT "lessons_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons" ADD CONSTRAINT "lessons_video_private_id_media_private_id_fk" FOREIGN KEY ("video_private_id") REFERENCES "public"."media_private"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons_rels" ADD CONSTRAINT "lessons_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_rels" ADD CONSTRAINT "lessons_rels_media_private_fk" FOREIGN KEY ("media_private_id") REFERENCES "public"."media_private"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_subject_package_id_packages_id_fk" FOREIGN KEY ("subject_package_id") REFERENCES "public"."packages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_subject_workshop_session_id_workshop_sessions_id_fk" FOREIGN KEY ("subject_workshop_session_id") REFERENCES "public"."workshop_sessions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_discount_code_id_discount_codes_id_fk" FOREIGN KEY ("discount_code_id") REFERENCES "public"."discount_codes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "entitlements_history" ADD CONSTRAINT "entitlements_history_changed_by_id_admin_users_id_fk" FOREIGN KEY ("changed_by_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "entitlements_history" ADD CONSTRAINT "entitlements_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."entitlements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_source_order_id_orders_id_fk" FOREIGN KEY ("source_order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "discount_codes_rels" ADD CONSTRAINT "discount_codes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."discount_codes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "discount_codes_rels" ADD CONSTRAINT "discount_codes_rels_packages_fk" FOREIGN KEY ("packages_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "workshops" ADD CONSTRAINT "workshops_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workshop_sessions" ADD CONSTRAINT "workshop_sessions_workshop_id_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workshop_reservations" ADD CONSTRAINT "workshop_reservations_session_id_workshop_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."workshop_sessions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workshop_reservations" ADD CONSTRAINT "workshop_reservations_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workshop_reservations" ADD CONSTRAINT "workshop_reservations_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workshop_enrollments" ADD CONSTRAINT "workshop_enrollments_session_id_workshop_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."workshop_sessions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workshop_enrollments" ADD CONSTRAINT "workshop_enrollments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workshop_enrollments" ADD CONSTRAINT "workshop_enrollments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workshop_waitlist" ADD CONSTRAINT "workshop_waitlist_session_id_workshop_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."workshop_sessions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workshop_waitlist" ADD CONSTRAINT "workshop_waitlist_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "free_lessons" ADD CONSTRAINT "free_lessons_category_id_free_lesson_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."free_lesson_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "free_lessons" ADD CONSTRAINT "free_lessons_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "free_lessons" ADD CONSTRAINT "free_lessons_download_file_id_media_id_fk" FOREIGN KEY ("download_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "free_lessons" ADD CONSTRAINT "free_lessons_related_package_id_packages_id_fk" FOREIGN KEY ("related_package_id") REFERENCES "public"."packages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_work_sample_id_media_id_fk" FOREIGN KEY ("work_sample_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_related_package_id_packages_id_fk" FOREIGN KEY ("related_package_id") REFERENCES "public"."packages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "consultation_requests" ADD CONSTRAINT "consultation_requests_linked_student_id_students_id_fk" FOREIGN KEY ("linked_student_id") REFERENCES "public"."students"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "support_tickets_messages" ADD CONSTRAINT "support_tickets_messages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."support_tickets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_related_order_id_orders_id_fk" FOREIGN KEY ("related_order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_related_package_id_packages_id_fk" FOREIGN KEY ("related_package_id") REFERENCES "public"."packages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_text" ADD CONSTRAINT "pages_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image" ADD CONSTRAINT "pages_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image" ADD CONSTRAINT "pages_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_items" ADD CONSTRAINT "pages_blocks_gallery_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_items" ADD CONSTRAINT "pages_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery" ADD CONSTRAINT "pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_video" ADD CONSTRAINT "pages_blocks_video_media_file_id_media_id_fk" FOREIGN KEY ("media_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_video" ADD CONSTRAINT "pages_blocks_video_poster_image_id_media_id_fk" FOREIGN KEY ("poster_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_video" ADD CONSTRAINT "pages_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_package_list" ADD CONSTRAINT "pages_blocks_package_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_workshop_list" ADD CONSTRAINT "pages_blocks_workshop_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_free_lesson_list" ADD CONSTRAINT "pages_blocks_free_lesson_list_category_id_free_lesson_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."free_lesson_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_free_lesson_list" ADD CONSTRAINT "pages_blocks_free_lesson_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials" ADD CONSTRAINT "pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_consultation_form" ADD CONSTRAINT "pages_blocks_consultation_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_packages_fk" FOREIGN KEY ("packages_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_workshop_sessions_fk" FOREIGN KEY ("workshop_sessions_id") REFERENCES "public"."workshop_sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_free_lessons_fk" FOREIGN KEY ("free_lessons_id") REFERENCES "public"."free_lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_text" ADD CONSTRAINT "_pages_v_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image" ADD CONSTRAINT "_pages_v_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image" ADD CONSTRAINT "_pages_v_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_items" ADD CONSTRAINT "_pages_v_blocks_gallery_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_items" ADD CONSTRAINT "_pages_v_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery" ADD CONSTRAINT "_pages_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video" ADD CONSTRAINT "_pages_v_blocks_video_media_file_id_media_id_fk" FOREIGN KEY ("media_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video" ADD CONSTRAINT "_pages_v_blocks_video_poster_image_id_media_id_fk" FOREIGN KEY ("poster_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video" ADD CONSTRAINT "_pages_v_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_package_list" ADD CONSTRAINT "_pages_v_blocks_package_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_workshop_list" ADD CONSTRAINT "_pages_v_blocks_workshop_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_free_lesson_list" ADD CONSTRAINT "_pages_v_blocks_free_lesson_list_category_id_free_lesson_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."free_lesson_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_free_lesson_list" ADD CONSTRAINT "_pages_v_blocks_free_lesson_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_consultation_form" ADD CONSTRAINT "_pages_v_blocks_consultation_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_packages_fk" FOREIGN KEY ("packages_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_workshop_sessions_fk" FOREIGN KEY ("workshop_sessions_id") REFERENCES "public"."workshop_sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_free_lessons_fk" FOREIGN KEY ("free_lessons_id") REFERENCES "public"."free_lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_approved_by_id_admin_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_admin_users_fk" FOREIGN KEY ("admin_users_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_students_fk" FOREIGN KEY ("students_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_otp_codes_fk" FOREIGN KEY ("otp_codes_id") REFERENCES "public"."otp_codes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_private_fk" FOREIGN KEY ("media_private_id") REFERENCES "public"."media_private"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_packages_fk" FOREIGN KEY ("packages_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_chapters_fk" FOREIGN KEY ("chapters_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lessons_fk" FOREIGN KEY ("lessons_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payment_attempts_fk" FOREIGN KEY ("payment_attempts_id") REFERENCES "public"."payment_attempts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_entitlements_fk" FOREIGN KEY ("entitlements_id") REFERENCES "public"."entitlements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lesson_progress_fk" FOREIGN KEY ("lesson_progress_id") REFERENCES "public"."lesson_progress"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_discount_codes_fk" FOREIGN KEY ("discount_codes_id") REFERENCES "public"."discount_codes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_workshops_fk" FOREIGN KEY ("workshops_id") REFERENCES "public"."workshops"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_workshop_sessions_fk" FOREIGN KEY ("workshop_sessions_id") REFERENCES "public"."workshop_sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_workshop_reservations_fk" FOREIGN KEY ("workshop_reservations_id") REFERENCES "public"."workshop_reservations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_workshop_enrollments_fk" FOREIGN KEY ("workshop_enrollments_id") REFERENCES "public"."workshop_enrollments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_workshop_waitlist_fk" FOREIGN KEY ("workshop_waitlist_id") REFERENCES "public"."workshop_waitlist"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_free_lesson_categories_fk" FOREIGN KEY ("free_lesson_categories_id") REFERENCES "public"."free_lesson_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_free_lessons_fk" FOREIGN KEY ("free_lessons_id") REFERENCES "public"."free_lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_consultation_requests_fk" FOREIGN KEY ("consultation_requests_id") REFERENCES "public"."consultation_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_support_tickets_fk" FOREIGN KEY ("support_tickets_id") REFERENCES "public"."support_tickets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_message_templates_fk" FOREIGN KEY ("message_templates_id") REFERENCES "public"."message_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_campaigns_fk" FOREIGN KEY ("campaigns_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_log_fk" FOREIGN KEY ("audit_log_id") REFERENCES "public"."audit_log"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_admin_users_fk" FOREIGN KEY ("admin_users_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_students_fk" FOREIGN KEY ("students_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_header_menu_children" ADD CONSTRAINT "site_settings_header_menu_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_header_menu"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_header_menu" ADD CONSTRAINT "site_settings_header_menu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_columns_links" ADD CONSTRAINT "site_settings_footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_columns" ADD CONSTRAINT "site_settings_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_brand_logo_id_media_id_fk" FOREIGN KEY ("brand_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_brand_favicon_id_media_id_fk" FOREIGN KEY ("brand_favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_seo_defaults_og_image_id_media_id_fk" FOREIGN KEY ("seo_defaults_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "admin_users_sessions_order_idx" ON "admin_users_sessions" USING btree ("_order");
  CREATE INDEX "admin_users_sessions_parent_id_idx" ON "admin_users_sessions" USING btree ("_parent_id");
  CREATE INDEX "admin_users_updated_at_idx" ON "admin_users" USING btree ("updated_at");
  CREATE INDEX "admin_users_created_at_idx" ON "admin_users" USING btree ("created_at");
  CREATE UNIQUE INDEX "admin_users_email_idx" ON "admin_users" USING btree ("email");
  CREATE INDEX "students_interests_order_idx" ON "students_interests" USING btree ("order");
  CREATE INDEX "students_interests_parent_idx" ON "students_interests" USING btree ("parent_id");
  CREATE UNIQUE INDEX "students_mobile_idx" ON "students" USING btree ("mobile");
  CREATE INDEX "students_updated_at_idx" ON "students" USING btree ("updated_at");
  CREATE INDEX "students_created_at_idx" ON "students" USING btree ("created_at");
  CREATE INDEX "students_texts_order_parent" ON "students_texts" USING btree ("order","parent_id");
  CREATE INDEX "otp_codes_mobile_idx" ON "otp_codes" USING btree ("mobile");
  CREATE INDEX "otp_codes_updated_at_idx" ON "otp_codes" USING btree ("updated_at");
  CREATE INDEX "otp_codes_created_at_idx" ON "otp_codes" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "media_private_updated_at_idx" ON "media_private" USING btree ("updated_at");
  CREATE INDEX "media_private_created_at_idx" ON "media_private" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_private_filename_idx" ON "media_private" USING btree ("filename");
  CREATE INDEX "packages_topics_order_idx" ON "packages_topics" USING btree ("order");
  CREATE INDEX "packages_topics_parent_idx" ON "packages_topics" USING btree ("parent_id");
  CREATE INDEX "packages_faqs_order_idx" ON "packages_faqs" USING btree ("_order");
  CREATE INDEX "packages_faqs_parent_id_idx" ON "packages_faqs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "packages_slug_idx" ON "packages" USING btree ("slug");
  CREATE INDEX "packages_cover_image_idx" ON "packages" USING btree ("cover_image_id");
  CREATE INDEX "packages_seo_seo_og_image_idx" ON "packages" USING btree ("seo_og_image_id");
  CREATE INDEX "packages_updated_at_idx" ON "packages" USING btree ("updated_at");
  CREATE INDEX "packages_created_at_idx" ON "packages" USING btree ("created_at");
  CREATE INDEX "packages_rels_order_idx" ON "packages_rels" USING btree ("order");
  CREATE INDEX "packages_rels_parent_idx" ON "packages_rels" USING btree ("parent_id");
  CREATE INDEX "packages_rels_path_idx" ON "packages_rels" USING btree ("path");
  CREATE INDEX "packages_rels_packages_id_idx" ON "packages_rels" USING btree ("packages_id");
  CREATE INDEX "chapters_package_idx" ON "chapters" USING btree ("package_id");
  CREATE INDEX "chapters_updated_at_idx" ON "chapters" USING btree ("updated_at");
  CREATE INDEX "chapters_created_at_idx" ON "chapters" USING btree ("created_at");
  CREATE INDEX "lessons_package_idx" ON "lessons" USING btree ("package_id");
  CREATE INDEX "lessons_chapter_idx" ON "lessons" USING btree ("chapter_id");
  CREATE INDEX "lessons_video_private_idx" ON "lessons" USING btree ("video_private_id");
  CREATE INDEX "lessons_updated_at_idx" ON "lessons" USING btree ("updated_at");
  CREATE INDEX "lessons_created_at_idx" ON "lessons" USING btree ("created_at");
  CREATE INDEX "lessons_rels_order_idx" ON "lessons_rels" USING btree ("order");
  CREATE INDEX "lessons_rels_parent_idx" ON "lessons_rels" USING btree ("parent_id");
  CREATE INDEX "lessons_rels_path_idx" ON "lessons_rels" USING btree ("path");
  CREATE INDEX "lessons_rels_media_private_id_idx" ON "lessons_rels" USING btree ("media_private_id");
  CREATE INDEX "orders_student_idx" ON "orders" USING btree ("student_id");
  CREATE INDEX "orders_subject_package_idx" ON "orders" USING btree ("subject_package_id");
  CREATE INDEX "orders_subject_workshop_session_idx" ON "orders" USING btree ("subject_workshop_session_id");
  CREATE INDEX "orders_discount_code_idx" ON "orders" USING btree ("discount_code_id");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE INDEX "payment_attempts_order_idx" ON "payment_attempts" USING btree ("order_id");
  CREATE UNIQUE INDEX "payment_attempts_provider_ref_id_idx" ON "payment_attempts" USING btree ("provider_ref_id");
  CREATE INDEX "payment_attempts_updated_at_idx" ON "payment_attempts" USING btree ("updated_at");
  CREATE INDEX "payment_attempts_created_at_idx" ON "payment_attempts" USING btree ("created_at");
  CREATE INDEX "entitlements_history_order_idx" ON "entitlements_history" USING btree ("_order");
  CREATE INDEX "entitlements_history_parent_id_idx" ON "entitlements_history" USING btree ("_parent_id");
  CREATE INDEX "entitlements_history_changed_by_idx" ON "entitlements_history" USING btree ("changed_by_id");
  CREATE INDEX "entitlements_student_idx" ON "entitlements" USING btree ("student_id");
  CREATE INDEX "entitlements_package_idx" ON "entitlements" USING btree ("package_id");
  CREATE INDEX "entitlements_source_order_idx" ON "entitlements" USING btree ("source_order_id");
  CREATE INDEX "entitlements_updated_at_idx" ON "entitlements" USING btree ("updated_at");
  CREATE INDEX "entitlements_created_at_idx" ON "entitlements" USING btree ("created_at");
  CREATE INDEX "lesson_progress_student_idx" ON "lesson_progress" USING btree ("student_id");
  CREATE INDEX "lesson_progress_lesson_idx" ON "lesson_progress" USING btree ("lesson_id");
  CREATE INDEX "lesson_progress_updated_at_idx" ON "lesson_progress" USING btree ("updated_at");
  CREATE INDEX "lesson_progress_created_at_idx" ON "lesson_progress" USING btree ("created_at");
  CREATE UNIQUE INDEX "discount_codes_code_idx" ON "discount_codes" USING btree ("code");
  CREATE INDEX "discount_codes_updated_at_idx" ON "discount_codes" USING btree ("updated_at");
  CREATE INDEX "discount_codes_created_at_idx" ON "discount_codes" USING btree ("created_at");
  CREATE INDEX "discount_codes_rels_order_idx" ON "discount_codes_rels" USING btree ("order");
  CREATE INDEX "discount_codes_rels_parent_idx" ON "discount_codes_rels" USING btree ("parent_id");
  CREATE INDEX "discount_codes_rels_path_idx" ON "discount_codes_rels" USING btree ("path");
  CREATE INDEX "discount_codes_rels_packages_id_idx" ON "discount_codes_rels" USING btree ("packages_id");
  CREATE UNIQUE INDEX "workshops_slug_idx" ON "workshops" USING btree ("slug");
  CREATE INDEX "workshops_cover_image_idx" ON "workshops" USING btree ("cover_image_id");
  CREATE INDEX "workshops_updated_at_idx" ON "workshops" USING btree ("updated_at");
  CREATE INDEX "workshops_created_at_idx" ON "workshops" USING btree ("created_at");
  CREATE INDEX "workshop_sessions_workshop_idx" ON "workshop_sessions" USING btree ("workshop_id");
  CREATE INDEX "workshop_sessions_updated_at_idx" ON "workshop_sessions" USING btree ("updated_at");
  CREATE INDEX "workshop_sessions_created_at_idx" ON "workshop_sessions" USING btree ("created_at");
  CREATE INDEX "workshop_reservations_session_idx" ON "workshop_reservations" USING btree ("session_id");
  CREATE INDEX "workshop_reservations_student_idx" ON "workshop_reservations" USING btree ("student_id");
  CREATE INDEX "workshop_reservations_order_idx" ON "workshop_reservations" USING btree ("order_id");
  CREATE INDEX "workshop_reservations_updated_at_idx" ON "workshop_reservations" USING btree ("updated_at");
  CREATE INDEX "workshop_reservations_created_at_idx" ON "workshop_reservations" USING btree ("created_at");
  CREATE INDEX "workshop_enrollments_session_idx" ON "workshop_enrollments" USING btree ("session_id");
  CREATE INDEX "workshop_enrollments_student_idx" ON "workshop_enrollments" USING btree ("student_id");
  CREATE INDEX "workshop_enrollments_order_idx" ON "workshop_enrollments" USING btree ("order_id");
  CREATE INDEX "workshop_enrollments_updated_at_idx" ON "workshop_enrollments" USING btree ("updated_at");
  CREATE INDEX "workshop_enrollments_created_at_idx" ON "workshop_enrollments" USING btree ("created_at");
  CREATE INDEX "workshop_waitlist_session_idx" ON "workshop_waitlist" USING btree ("session_id");
  CREATE INDEX "workshop_waitlist_student_idx" ON "workshop_waitlist" USING btree ("student_id");
  CREATE INDEX "workshop_waitlist_updated_at_idx" ON "workshop_waitlist" USING btree ("updated_at");
  CREATE INDEX "workshop_waitlist_created_at_idx" ON "workshop_waitlist" USING btree ("created_at");
  CREATE UNIQUE INDEX "free_lesson_categories_slug_idx" ON "free_lesson_categories" USING btree ("slug");
  CREATE INDEX "free_lesson_categories_updated_at_idx" ON "free_lesson_categories" USING btree ("updated_at");
  CREATE INDEX "free_lesson_categories_created_at_idx" ON "free_lesson_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "free_lessons_slug_idx" ON "free_lessons" USING btree ("slug");
  CREATE INDEX "free_lessons_category_idx" ON "free_lessons" USING btree ("category_id");
  CREATE INDEX "free_lessons_cover_image_idx" ON "free_lessons" USING btree ("cover_image_id");
  CREATE INDEX "free_lessons_download_file_idx" ON "free_lessons" USING btree ("download_file_id");
  CREATE INDEX "free_lessons_related_package_idx" ON "free_lessons" USING btree ("related_package_id");
  CREATE INDEX "free_lessons_updated_at_idx" ON "free_lessons" USING btree ("updated_at");
  CREATE INDEX "free_lessons_created_at_idx" ON "free_lessons" USING btree ("created_at");
  CREATE INDEX "testimonials_avatar_idx" ON "testimonials" USING btree ("avatar_id");
  CREATE INDEX "testimonials_work_sample_idx" ON "testimonials" USING btree ("work_sample_id");
  CREATE INDEX "testimonials_related_package_idx" ON "testimonials" USING btree ("related_package_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE INDEX "consultation_requests_linked_student_idx" ON "consultation_requests" USING btree ("linked_student_id");
  CREATE INDEX "consultation_requests_updated_at_idx" ON "consultation_requests" USING btree ("updated_at");
  CREATE INDEX "consultation_requests_created_at_idx" ON "consultation_requests" USING btree ("created_at");
  CREATE INDEX "support_tickets_messages_order_idx" ON "support_tickets_messages" USING btree ("_order");
  CREATE INDEX "support_tickets_messages_parent_id_idx" ON "support_tickets_messages" USING btree ("_parent_id");
  CREATE INDEX "support_tickets_student_idx" ON "support_tickets" USING btree ("student_id");
  CREATE INDEX "support_tickets_related_order_idx" ON "support_tickets" USING btree ("related_order_id");
  CREATE INDEX "support_tickets_related_package_idx" ON "support_tickets" USING btree ("related_package_id");
  CREATE INDEX "support_tickets_updated_at_idx" ON "support_tickets" USING btree ("updated_at");
  CREATE INDEX "support_tickets_created_at_idx" ON "support_tickets" USING btree ("created_at");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_image_idx" ON "pages_blocks_hero" USING btree ("image_id");
  CREATE INDEX "pages_blocks_text_order_idx" ON "pages_blocks_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_text_parent_id_idx" ON "pages_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_text_path_idx" ON "pages_blocks_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_order_idx" ON "pages_blocks_image" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_parent_id_idx" ON "pages_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_path_idx" ON "pages_blocks_image" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_image_idx" ON "pages_blocks_image" USING btree ("image_id");
  CREATE INDEX "pages_blocks_gallery_items_order_idx" ON "pages_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_items_parent_id_idx" ON "pages_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_items_image_idx" ON "pages_blocks_gallery_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_gallery_order_idx" ON "pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_parent_id_idx" ON "pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_path_idx" ON "pages_blocks_gallery" USING btree ("_path");
  CREATE INDEX "pages_blocks_video_order_idx" ON "pages_blocks_video" USING btree ("_order");
  CREATE INDEX "pages_blocks_video_parent_id_idx" ON "pages_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_video_path_idx" ON "pages_blocks_video" USING btree ("_path");
  CREATE INDEX "pages_blocks_video_media_file_idx" ON "pages_blocks_video" USING btree ("media_file_id");
  CREATE INDEX "pages_blocks_video_poster_image_idx" ON "pages_blocks_video" USING btree ("poster_image_id");
  CREATE INDEX "pages_blocks_package_list_order_idx" ON "pages_blocks_package_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_package_list_parent_id_idx" ON "pages_blocks_package_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_package_list_path_idx" ON "pages_blocks_package_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_workshop_list_order_idx" ON "pages_blocks_workshop_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_workshop_list_parent_id_idx" ON "pages_blocks_workshop_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_workshop_list_path_idx" ON "pages_blocks_workshop_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_free_lesson_list_order_idx" ON "pages_blocks_free_lesson_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_free_lesson_list_parent_id_idx" ON "pages_blocks_free_lesson_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_free_lesson_list_path_idx" ON "pages_blocks_free_lesson_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_free_lesson_list_category_idx" ON "pages_blocks_free_lesson_list" USING btree ("category_id");
  CREATE INDEX "pages_blocks_testimonials_order_idx" ON "pages_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_parent_id_idx" ON "pages_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_path_idx" ON "pages_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_items_order_idx" ON "pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_items_parent_id_idx" ON "pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_consultation_form_order_idx" ON "pages_blocks_consultation_form" USING btree ("_order");
  CREATE INDEX "pages_blocks_consultation_form_parent_id_idx" ON "pages_blocks_consultation_form" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_consultation_form_path_idx" ON "pages_blocks_consultation_form" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_seo_seo_og_image_idx" ON "pages" USING btree ("seo_og_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_packages_id_idx" ON "pages_rels" USING btree ("packages_id");
  CREATE INDEX "pages_rels_workshop_sessions_id_idx" ON "pages_rels" USING btree ("workshop_sessions_id");
  CREATE INDEX "pages_rels_free_lessons_id_idx" ON "pages_rels" USING btree ("free_lessons_id");
  CREATE INDEX "pages_rels_testimonials_id_idx" ON "pages_rels" USING btree ("testimonials_id");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_image_idx" ON "_pages_v_blocks_hero" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_text_order_idx" ON "_pages_v_blocks_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_text_parent_id_idx" ON "_pages_v_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_text_path_idx" ON "_pages_v_blocks_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_order_idx" ON "_pages_v_blocks_image" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_parent_id_idx" ON "_pages_v_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_path_idx" ON "_pages_v_blocks_image" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_image_idx" ON "_pages_v_blocks_image" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_gallery_items_order_idx" ON "_pages_v_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_items_parent_id_idx" ON "_pages_v_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_items_image_idx" ON "_pages_v_blocks_gallery_items" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_gallery_order_idx" ON "_pages_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_parent_id_idx" ON "_pages_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_path_idx" ON "_pages_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_video_order_idx" ON "_pages_v_blocks_video" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_video_parent_id_idx" ON "_pages_v_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_video_path_idx" ON "_pages_v_blocks_video" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_video_media_file_idx" ON "_pages_v_blocks_video" USING btree ("media_file_id");
  CREATE INDEX "_pages_v_blocks_video_poster_image_idx" ON "_pages_v_blocks_video" USING btree ("poster_image_id");
  CREATE INDEX "_pages_v_blocks_package_list_order_idx" ON "_pages_v_blocks_package_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_package_list_parent_id_idx" ON "_pages_v_blocks_package_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_package_list_path_idx" ON "_pages_v_blocks_package_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_workshop_list_order_idx" ON "_pages_v_blocks_workshop_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_workshop_list_parent_id_idx" ON "_pages_v_blocks_workshop_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_workshop_list_path_idx" ON "_pages_v_blocks_workshop_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_free_lesson_list_order_idx" ON "_pages_v_blocks_free_lesson_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_free_lesson_list_parent_id_idx" ON "_pages_v_blocks_free_lesson_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_free_lesson_list_path_idx" ON "_pages_v_blocks_free_lesson_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_free_lesson_list_category_idx" ON "_pages_v_blocks_free_lesson_list" USING btree ("category_id");
  CREATE INDEX "_pages_v_blocks_testimonials_order_idx" ON "_pages_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_parent_id_idx" ON "_pages_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_path_idx" ON "_pages_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_faq_items_order_idx" ON "_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_items_parent_id_idx" ON "_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_consultation_form_order_idx" ON "_pages_v_blocks_consultation_form" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_consultation_form_parent_id_idx" ON "_pages_v_blocks_consultation_form" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_consultation_form_path_idx" ON "_pages_v_blocks_consultation_form" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_seo_version_seo_og_image_idx" ON "_pages_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_packages_id_idx" ON "_pages_v_rels" USING btree ("packages_id");
  CREATE INDEX "_pages_v_rels_workshop_sessions_id_idx" ON "_pages_v_rels" USING btree ("workshop_sessions_id");
  CREATE INDEX "_pages_v_rels_free_lessons_id_idx" ON "_pages_v_rels" USING btree ("free_lessons_id");
  CREATE INDEX "_pages_v_rels_testimonials_id_idx" ON "_pages_v_rels" USING btree ("testimonials_id");
  CREATE UNIQUE INDEX "message_templates_key_idx" ON "message_templates" USING btree ("key");
  CREATE INDEX "message_templates_updated_at_idx" ON "message_templates" USING btree ("updated_at");
  CREATE INDEX "message_templates_created_at_idx" ON "message_templates" USING btree ("created_at");
  CREATE INDEX "campaigns_approved_by_idx" ON "campaigns" USING btree ("approved_by_id");
  CREATE INDEX "campaigns_updated_at_idx" ON "campaigns" USING btree ("updated_at");
  CREATE INDEX "campaigns_created_at_idx" ON "campaigns" USING btree ("created_at");
  CREATE INDEX "jobs_type_idx" ON "jobs" USING btree ("type");
  CREATE UNIQUE INDEX "jobs_unique_key_idx" ON "jobs" USING btree ("unique_key");
  CREATE INDEX "jobs_scheduled_for_idx" ON "jobs" USING btree ("scheduled_for");
  CREATE INDEX "jobs_status_idx" ON "jobs" USING btree ("status");
  CREATE INDEX "jobs_updated_at_idx" ON "jobs" USING btree ("updated_at");
  CREATE INDEX "jobs_created_at_idx" ON "jobs" USING btree ("created_at");
  CREATE INDEX "audit_log_updated_at_idx" ON "audit_log" USING btree ("updated_at");
  CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");
  CREATE UNIQUE INDEX "redirects_from_path_idx" ON "redirects" USING btree ("from_path");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_admin_users_id_idx" ON "payload_locked_documents_rels" USING btree ("admin_users_id");
  CREATE INDEX "payload_locked_documents_rels_students_id_idx" ON "payload_locked_documents_rels" USING btree ("students_id");
  CREATE INDEX "payload_locked_documents_rels_otp_codes_id_idx" ON "payload_locked_documents_rels" USING btree ("otp_codes_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_media_private_id_idx" ON "payload_locked_documents_rels" USING btree ("media_private_id");
  CREATE INDEX "payload_locked_documents_rels_packages_id_idx" ON "payload_locked_documents_rels" USING btree ("packages_id");
  CREATE INDEX "payload_locked_documents_rels_chapters_id_idx" ON "payload_locked_documents_rels" USING btree ("chapters_id");
  CREATE INDEX "payload_locked_documents_rels_lessons_id_idx" ON "payload_locked_documents_rels" USING btree ("lessons_id");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_payment_attempts_id_idx" ON "payload_locked_documents_rels" USING btree ("payment_attempts_id");
  CREATE INDEX "payload_locked_documents_rels_entitlements_id_idx" ON "payload_locked_documents_rels" USING btree ("entitlements_id");
  CREATE INDEX "payload_locked_documents_rels_lesson_progress_id_idx" ON "payload_locked_documents_rels" USING btree ("lesson_progress_id");
  CREATE INDEX "payload_locked_documents_rels_discount_codes_id_idx" ON "payload_locked_documents_rels" USING btree ("discount_codes_id");
  CREATE INDEX "payload_locked_documents_rels_workshops_id_idx" ON "payload_locked_documents_rels" USING btree ("workshops_id");
  CREATE INDEX "payload_locked_documents_rels_workshop_sessions_id_idx" ON "payload_locked_documents_rels" USING btree ("workshop_sessions_id");
  CREATE INDEX "payload_locked_documents_rels_workshop_reservations_id_idx" ON "payload_locked_documents_rels" USING btree ("workshop_reservations_id");
  CREATE INDEX "payload_locked_documents_rels_workshop_enrollments_id_idx" ON "payload_locked_documents_rels" USING btree ("workshop_enrollments_id");
  CREATE INDEX "payload_locked_documents_rels_workshop_waitlist_id_idx" ON "payload_locked_documents_rels" USING btree ("workshop_waitlist_id");
  CREATE INDEX "payload_locked_documents_rels_free_lesson_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("free_lesson_categories_id");
  CREATE INDEX "payload_locked_documents_rels_free_lessons_id_idx" ON "payload_locked_documents_rels" USING btree ("free_lessons_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_consultation_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("consultation_requests_id");
  CREATE INDEX "payload_locked_documents_rels_support_tickets_id_idx" ON "payload_locked_documents_rels" USING btree ("support_tickets_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_message_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("message_templates_id");
  CREATE INDEX "payload_locked_documents_rels_campaigns_id_idx" ON "payload_locked_documents_rels" USING btree ("campaigns_id");
  CREATE INDEX "payload_locked_documents_rels_jobs_id_idx" ON "payload_locked_documents_rels" USING btree ("jobs_id");
  CREATE INDEX "payload_locked_documents_rels_audit_log_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_log_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_admin_users_id_idx" ON "payload_preferences_rels" USING btree ("admin_users_id");
  CREATE INDEX "payload_preferences_rels_students_id_idx" ON "payload_preferences_rels" USING btree ("students_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_header_menu_children_order_idx" ON "site_settings_header_menu_children" USING btree ("_order");
  CREATE INDEX "site_settings_header_menu_children_parent_id_idx" ON "site_settings_header_menu_children" USING btree ("_parent_id");
  CREATE INDEX "site_settings_header_menu_order_idx" ON "site_settings_header_menu" USING btree ("_order");
  CREATE INDEX "site_settings_header_menu_parent_id_idx" ON "site_settings_header_menu" USING btree ("_parent_id");
  CREATE INDEX "site_settings_footer_columns_links_order_idx" ON "site_settings_footer_columns_links" USING btree ("_order");
  CREATE INDEX "site_settings_footer_columns_links_parent_id_idx" ON "site_settings_footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_footer_columns_order_idx" ON "site_settings_footer_columns" USING btree ("_order");
  CREATE INDEX "site_settings_footer_columns_parent_id_idx" ON "site_settings_footer_columns" USING btree ("_parent_id");
  CREATE INDEX "site_settings_brand_brand_logo_idx" ON "site_settings" USING btree ("brand_logo_id");
  CREATE INDEX "site_settings_brand_brand_favicon_idx" ON "site_settings" USING btree ("brand_favicon_id");
  CREATE INDEX "site_settings_seo_defaults_seo_defaults_og_image_idx" ON "site_settings" USING btree ("seo_defaults_og_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "admin_users_sessions" CASCADE;
  DROP TABLE "admin_users" CASCADE;
  DROP TABLE "students_interests" CASCADE;
  DROP TABLE "students" CASCADE;
  DROP TABLE "students_texts" CASCADE;
  DROP TABLE "otp_codes" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_private" CASCADE;
  DROP TABLE "packages_topics" CASCADE;
  DROP TABLE "packages_faqs" CASCADE;
  DROP TABLE "packages" CASCADE;
  DROP TABLE "packages_rels" CASCADE;
  DROP TABLE "chapters" CASCADE;
  DROP TABLE "lessons" CASCADE;
  DROP TABLE "lessons_rels" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "payment_attempts" CASCADE;
  DROP TABLE "entitlements_history" CASCADE;
  DROP TABLE "entitlements" CASCADE;
  DROP TABLE "lesson_progress" CASCADE;
  DROP TABLE "discount_codes" CASCADE;
  DROP TABLE "discount_codes_rels" CASCADE;
  DROP TABLE "workshops" CASCADE;
  DROP TABLE "workshop_sessions" CASCADE;
  DROP TABLE "workshop_reservations" CASCADE;
  DROP TABLE "workshop_enrollments" CASCADE;
  DROP TABLE "workshop_waitlist" CASCADE;
  DROP TABLE "free_lesson_categories" CASCADE;
  DROP TABLE "free_lessons" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "consultation_requests" CASCADE;
  DROP TABLE "support_tickets_messages" CASCADE;
  DROP TABLE "support_tickets" CASCADE;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_text" CASCADE;
  DROP TABLE "pages_blocks_image" CASCADE;
  DROP TABLE "pages_blocks_gallery_items" CASCADE;
  DROP TABLE "pages_blocks_gallery" CASCADE;
  DROP TABLE "pages_blocks_video" CASCADE;
  DROP TABLE "pages_blocks_package_list" CASCADE;
  DROP TABLE "pages_blocks_workshop_list" CASCADE;
  DROP TABLE "pages_blocks_free_lesson_list" CASCADE;
  DROP TABLE "pages_blocks_testimonials" CASCADE;
  DROP TABLE "pages_blocks_faq_items" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_consultation_form" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_text" CASCADE;
  DROP TABLE "_pages_v_blocks_image" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery_items" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery" CASCADE;
  DROP TABLE "_pages_v_blocks_video" CASCADE;
  DROP TABLE "_pages_v_blocks_package_list" CASCADE;
  DROP TABLE "_pages_v_blocks_workshop_list" CASCADE;
  DROP TABLE "_pages_v_blocks_free_lesson_list" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_consultation_form" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "message_templates" CASCADE;
  DROP TABLE "campaigns" CASCADE;
  DROP TABLE "jobs" CASCADE;
  DROP TABLE "audit_log" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_header_menu_children" CASCADE;
  DROP TABLE "site_settings_header_menu" CASCADE;
  DROP TABLE "site_settings_footer_columns_links" CASCADE;
  DROP TABLE "site_settings_footer_columns" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TYPE "public"."enum_admin_users_role";
  DROP TYPE "public"."enum_students_interests";
  DROP TYPE "public"."enum_students_skill_level";
  DROP TYPE "public"."enum_students_status";
  DROP TYPE "public"."enum_media_private_kind";
  DROP TYPE "public"."enum_media_private_processing_status";
  DROP TYPE "public"."enum_packages_topics";
  DROP TYPE "public"."enum_packages_level";
  DROP TYPE "public"."enum_packages_kind";
  DROP TYPE "public"."enum_packages_status";
  DROP TYPE "public"."enum_chapters_status";
  DROP TYPE "public"."enum_lessons_status";
  DROP TYPE "public"."enum_orders_subject_type";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_refund_method";
  DROP TYPE "public"."enum_payment_attempts_status";
  DROP TYPE "public"."enum_discount_codes_type";
  DROP TYPE "public"."enum_workshops_level";
  DROP TYPE "public"."enum_workshops_status";
  DROP TYPE "public"."enum_workshop_sessions_status";
  DROP TYPE "public"."enum_workshop_reservations_status";
  DROP TYPE "public"."enum_workshop_enrollments_status";
  DROP TYPE "public"."enum_free_lessons_content_type";
  DROP TYPE "public"."enum_free_lessons_status";
  DROP TYPE "public"."enum_consultation_requests_status";
  DROP TYPE "public"."enum_support_tickets_messages_from";
  DROP TYPE "public"."enum_support_tickets_status";
  DROP TYPE "public"."enum_pages_blocks_hero_image_position";
  DROP TYPE "public"."enum_pages_blocks_video_source_type";
  DROP TYPE "public"."enum_pages_blocks_package_list_mode";
  DROP TYPE "public"."enum_pages_blocks_workshop_list_mode";
  DROP TYPE "public"."enum_pages_blocks_free_lesson_list_mode";
  DROP TYPE "public"."enum_pages_blocks_testimonials_mode";
  DROP TYPE "public"."enum_pages_blocks_cta_style";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_hero_image_position";
  DROP TYPE "public"."enum__pages_v_blocks_video_source_type";
  DROP TYPE "public"."enum__pages_v_blocks_package_list_mode";
  DROP TYPE "public"."enum__pages_v_blocks_workshop_list_mode";
  DROP TYPE "public"."enum__pages_v_blocks_free_lesson_list_mode";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_mode";
  DROP TYPE "public"."enum__pages_v_blocks_cta_style";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_message_templates_key";
  DROP TYPE "public"."enum_message_templates_category";
  DROP TYPE "public"."enum_campaigns_status";
  DROP TYPE "public"."enum_jobs_status";
  DROP TYPE "public"."enum_redirects_status_code";
  DROP TYPE "public"."enum_site_settings_theme_primary_color";
  DROP TYPE "public"."enum_site_settings_theme_font_scale";
  DROP TYPE "public"."enum_site_settings_theme_radius";
  DROP TYPE "public"."enum_site_settings_theme_button_style";`)
}
