

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."calculate_age"("birth_year" integer, "birth_month" integer, "birth_day" integer) RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF birth_year IS NULL OR birth_month IS NULL OR birth_day IS NULL THEN
        RETURN NULL;
    END IF;
    
    RETURN date_part('year', age(make_date(birth_year, birth_month, birth_day)));
END;
$$;


ALTER FUNCTION "public"."calculate_age"("birth_year" integer, "birth_month" integer, "birth_day" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_age_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.age = calculate_age(NEW.birth_year, NEW.birth_month, NEW.birth_day);
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_age_trigger"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_age_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.birth_date IS NOT NULL THEN
        NEW.age = date_part('year', age(NEW.birth_date));
    ELSE
        NEW.age = NULL;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."user_age_trigger"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."consultations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "consultation_date" "date" NOT NULL,
    "consultation_route_self" boolean DEFAULT false,
    "consultation_route_family" boolean DEFAULT false,
    "consultation_route_care_manager" boolean DEFAULT false,
    "consultation_route_elderly_center" boolean DEFAULT false,
    "consultation_route_disability_center" boolean DEFAULT false,
    "consultation_route_government" boolean DEFAULT false,
    "consultation_route_government_other" "text",
    "consultation_route_other" boolean DEFAULT false,
    "consultation_route_other_text" "text",
    "attribute_elderly" boolean DEFAULT false,
    "attribute_disability" boolean DEFAULT false,
    "attribute_disability_mental" boolean DEFAULT false,
    "attribute_disability_physical" boolean DEFAULT false,
    "attribute_disability_intellectual" boolean DEFAULT false,
    "attribute_childcare" boolean DEFAULT false,
    "attribute_single_parent" boolean DEFAULT false,
    "attribute_dv" boolean DEFAULT false,
    "attribute_foreigner" boolean DEFAULT false,
    "attribute_poverty" boolean DEFAULT false,
    "attribute_low_income" boolean DEFAULT false,
    "attribute_lgbt" boolean DEFAULT false,
    "attribute_welfare" boolean DEFAULT false,
    "name" "text",
    "furigana" "text",
    "gender" "text",
    "household_single" boolean DEFAULT false,
    "household_couple" boolean DEFAULT false,
    "household_common_law" boolean DEFAULT false,
    "household_parent_child" boolean DEFAULT false,
    "household_siblings" boolean DEFAULT false,
    "household_acquaintance" boolean DEFAULT false,
    "household_other" boolean DEFAULT false,
    "household_other_text" "text",
    "postal_code" "text",
    "address" "text",
    "phone_home" "text",
    "phone_mobile" "text",
    "birth_year" integer,
    "birth_month" integer,
    "birth_day" integer,
    "physical_condition" "text",
    "mental_disability_certificate" boolean DEFAULT false,
    "mental_disability_level" "text",
    "physical_disability_certificate" boolean DEFAULT false,
    "physical_disability_level" "text",
    "therapy_certificate" boolean DEFAULT false,
    "therapy_level" "text",
    "service_day_service" boolean DEFAULT false,
    "service_visiting_nurse" boolean DEFAULT false,
    "service_visiting_care" boolean DEFAULT false,
    "service_home_medical" boolean DEFAULT false,
    "service_short_stay" boolean DEFAULT false,
    "service_other" boolean DEFAULT false,
    "service_other_text" "text",
    "service_provider" "text",
    "care_support_office" "text",
    "care_manager" "text",
    "medical_history" "text",
    "medical_institution_name" "text",
    "medical_institution_staff" "text",
    "income_salary" numeric(10,2),
    "income_injury_allowance" numeric(10,2),
    "income_pension" numeric(10,2),
    "welfare_recipient" boolean DEFAULT false,
    "welfare_staff" "text",
    "savings" numeric(10,2),
    "dementia" "text",
    "dementia_hospital" "text",
    "hospital_support_required" boolean DEFAULT false,
    "medication_management_needed" boolean DEFAULT false,
    "mobility_independent" boolean DEFAULT false,
    "mobility_partial_assist" boolean DEFAULT false,
    "mobility_full_assist" boolean DEFAULT false,
    "mobility_other" boolean DEFAULT false,
    "mobility_other_text" "text",
    "eating_independent" boolean DEFAULT false,
    "eating_partial_assist" boolean DEFAULT false,
    "eating_full_assist" boolean DEFAULT false,
    "eating_other" boolean DEFAULT false,
    "eating_other_text" "text",
    "shopping_possible" boolean DEFAULT false,
    "shopping_support_needed" boolean DEFAULT false,
    "shopping_support_text" "text",
    "cooking_possible" boolean DEFAULT false,
    "cooking_support_needed" boolean DEFAULT false,
    "cooking_support_text" "text",
    "excretion_independent" boolean DEFAULT false,
    "excretion_partial_assist" boolean DEFAULT false,
    "excretion_full_assist" boolean DEFAULT false,
    "excretion_other" boolean DEFAULT false,
    "excretion_other_text" "text",
    "diaper_usage" boolean DEFAULT false,
    "garbage_disposal_independent" boolean DEFAULT false,
    "garbage_disposal_support_needed" boolean DEFAULT false,
    "garbage_disposal_support_text" "text",
    "stairs_independent" boolean DEFAULT false,
    "stairs_partial_assist" boolean DEFAULT false,
    "stairs_full_assist" boolean DEFAULT false,
    "stairs_other" boolean DEFAULT false,
    "stairs_other_text" "text",
    "second_floor_possible" boolean DEFAULT false,
    "bed_or_futon" "text",
    "bathing_independent" boolean DEFAULT false,
    "bathing_partial_assist" boolean DEFAULT false,
    "bathing_full_assist" boolean DEFAULT false,
    "bathing_other" boolean DEFAULT false,
    "bathing_other_text" "text",
    "unit_bath_possible" boolean DEFAULT false,
    "money_management" "text",
    "supporter_available" boolean DEFAULT false,
    "supporter_text" "text",
    "proxy_payment" boolean DEFAULT false,
    "rent_payment_method" "text",
    "mobility_aids" "text",
    "money_management_supporter" "text",
    "other_notes" "text",
    "consultation_content" "text",
    "relocation_reason" "text",
    "emergency_contact_name" "text",
    "emergency_contact_relationship" "text",
    "emergency_contact_postal_code" "text",
    "emergency_contact_address" "text",
    "emergency_contact_phone_home" "text",
    "emergency_contact_phone_mobile" "text",
    "emergency_contact_email" "text",
    "consultation_result" "text",
    "next_appointment_scheduled" boolean DEFAULT false,
    "next_appointment_details" "text",
    "user_id" "uuid",
    "staff_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "staff_name" "text",
    "status" "text" DEFAULT '進行中'::"text" NOT NULL,
    "is_relocation_to_other_city_desired" boolean,
    "relocation_admin_opinion" "text",
    "relocation_admin_opinion_details" "text",
    "relocation_cost_bearer" "text",
    "relocation_cost_bearer_details" "text",
    "relocation_notes" "text",
    "rent_arrears_status" "text",
    "rent_arrears_duration" "text",
    "rent_arrears_details" "text",
    "pet_status" "text",
    "pet_details" "text",
    "vehicle_car" boolean DEFAULT false NOT NULL,
    "vehicle_motorcycle" boolean DEFAULT false NOT NULL,
    "vehicle_bicycle" boolean DEFAULT false NOT NULL,
    "vehicle_none" boolean DEFAULT false NOT NULL,
    "current_floor_plan" "text",
    "current_rent" integer,
    "eviction_date" "date",
    "eviction_date_notes" "text",
    CONSTRAINT "consultations_bed_or_futon_check" CHECK (("bed_or_futon" = ANY (ARRAY['bed'::"text", 'futon'::"text"]))),
    CONSTRAINT "consultations_gender_check" CHECK (("gender" = ANY (ARRAY['male'::"text", 'female'::"text", 'other'::"text"]))),
    CONSTRAINT "consultations_physical_condition_check" CHECK (("physical_condition" = ANY (ARRAY['independent'::"text", 'support1'::"text", 'support2'::"text", 'care1'::"text", 'care2'::"text", 'care3'::"text", 'care4'::"text", 'care5'::"text"]))),
    CONSTRAINT "consultations_rent_payment_method_check" CHECK (("rent_payment_method" = ANY (ARRAY['transfer'::"text", 'collection'::"text", 'automatic'::"text"])))
);


ALTER TABLE "public"."consultations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."staff" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "role" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."staff" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."support_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "creation_date" "date" NOT NULL,
    "staff_name" "text" NOT NULL,
    "name" "text" NOT NULL,
    "furigana" "text" NOT NULL,
    "birth_date" "date" NOT NULL,
    "residence" "text" NOT NULL,
    "phone_mobile" "text",
    "line_available" boolean DEFAULT false,
    "welfare_recipient" boolean DEFAULT false,
    "welfare_worker" "text",
    "welfare_contact" "text",
    "care_level_independent" boolean DEFAULT false,
    "care_level_support1" boolean DEFAULT false,
    "care_level_support2" boolean DEFAULT false,
    "care_level_care1" boolean DEFAULT false,
    "care_level_care2" boolean DEFAULT false,
    "care_level_care3" boolean DEFAULT false,
    "care_level_care4" boolean DEFAULT false,
    "care_level_care5" boolean DEFAULT false,
    "outpatient_care" boolean DEFAULT false,
    "outpatient_institution" "text",
    "visiting_medical" boolean DEFAULT false,
    "visiting_medical_institution" "text",
    "home_oxygen" boolean DEFAULT false,
    "physical_disability_level" "text",
    "mental_disability_level" "text",
    "therapy_certificate_level" "text",
    "pension_national" boolean DEFAULT false,
    "pension_employee" boolean DEFAULT false,
    "pension_disability" boolean DEFAULT false,
    "pension_survivor" boolean DEFAULT false,
    "pension_corporate" boolean DEFAULT false,
    "pension_other" boolean DEFAULT false,
    "pension_other_details" "text",
    "monitoring_secom" boolean DEFAULT false,
    "monitoring_secom_details" "text",
    "monitoring_hello_light" boolean DEFAULT false,
    "monitoring_hello_light_details" "text",
    "support_shopping" boolean DEFAULT false,
    "support_bank_visit" boolean DEFAULT false,
    "support_cleaning" boolean DEFAULT false,
    "support_bulb_change" boolean DEFAULT false,
    "support_garbage_disposal" boolean DEFAULT false,
    "goals" "text",
    "needs_financial" "text",
    "needs_physical" "text",
    "needs_mental" "text",
    "needs_lifestyle" "text",
    "needs_environment" "text",
    "evacuation_plan_completed" boolean DEFAULT false,
    "evacuation_plan_other_details" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."support_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "uid" "text" NOT NULL,
    "name" "text" NOT NULL,
    "birth_date" "date",
    "gender" "text",
    "property_address" "text",
    "property_name" "text",
    "room_number" "text",
    "intermediary" "text",
    "deposit" numeric(10,2),
    "key_money" numeric(10,2),
    "rent" numeric(10,2),
    "fire_insurance" numeric(10,2),
    "common_fee" numeric(10,2),
    "landlord_rent" numeric(10,2),
    "landlord_common_fee" numeric(10,2),
    "rent_difference" numeric(10,2),
    "move_in_date" "date",
    "next_renewal_date" "date",
    "renewal_count" integer DEFAULT 0,
    "resident_contact" "text",
    "line_available" boolean DEFAULT false,
    "emergency_contact" "text",
    "emergency_contact_name" "text",
    "relationship" "text",
    "monitoring_system" "text",
    "support_medical_institution" "text",
    "notes" "text",
    "proxy_payment_eligible" boolean DEFAULT false,
    "welfare_recipient" boolean DEFAULT false,
    "posthumous_affairs" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "registered_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "users_gender_check" CHECK (("gender" = ANY (ARRAY['male'::"text", 'female'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON COLUMN "public"."users"."registered_at" IS '利用者が任意に設定・編集可能な登録日';



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."staff"
    ADD CONSTRAINT "staff_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."support_plans"
    ADD CONSTRAINT "support_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_uid_key" UNIQUE ("uid");



CREATE OR REPLACE TRIGGER "update_consultations_updated_at" BEFORE UPDATE ON "public"."consultations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_staff_updated_at" BEFORE UPDATE ON "public"."staff" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_support_plans_updated_at" BEFORE UPDATE ON "public"."support_plans" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."support_plans"
    ADD CONSTRAINT "support_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Enable all operations for all users" ON "public"."consultations" USING (true);



CREATE POLICY "Enable all operations for all users" ON "public"."staff" USING (true);



CREATE POLICY "Enable all operations for all users" ON "public"."support_plans" USING (true);



CREATE POLICY "Enable all operations for all users" ON "public"."users" USING (true);



ALTER TABLE "public"."consultations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."staff" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."support_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "ログイン済みユーザーに全ての操作を許可" ON "public"."consultations" TO "authenticated" USING (true) WITH CHECK (true);





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."calculate_age"("birth_year" integer, "birth_month" integer, "birth_day" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_age"("birth_year" integer, "birth_month" integer, "birth_day" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_age"("birth_year" integer, "birth_month" integer, "birth_day" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_age_trigger"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_age_trigger"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_age_trigger"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_age_trigger"() TO "anon";
GRANT ALL ON FUNCTION "public"."user_age_trigger"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_age_trigger"() TO "service_role";


















GRANT ALL ON TABLE "public"."consultations" TO "anon";
GRANT ALL ON TABLE "public"."consultations" TO "authenticated";
GRANT ALL ON TABLE "public"."consultations" TO "service_role";



GRANT ALL ON TABLE "public"."staff" TO "anon";
GRANT ALL ON TABLE "public"."staff" TO "authenticated";
GRANT ALL ON TABLE "public"."staff" TO "service_role";



GRANT ALL ON TABLE "public"."support_plans" TO "anon";
GRANT ALL ON TABLE "public"."support_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."support_plans" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
CREATE TYPE "public"."consultation_status" AS ENUM (
  '進行中',
  '初回面談',
  '支援検討中',
  '物件探し中',
  '申込・審査中',
  '入居後フォロー中',
  '支援終了',
  '対象外・辞退'
);CREATE TABLE "public"."consultation_events" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "consultation_id" uuid NOT NULL,
    "staff_id" uuid,
    "status" public.consultation_status NOT NULL,
    "event_note" text,
    "next_action_date" date,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "consultation_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "consultation_events_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE CASCADE,
    CONSTRAINT "consultation_events_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE SET NULL
);

-- パフォーマンス向上のためのインデックス設定
CREATE INDEX "idx_consultation_events_consultation_id" ON "public"."consultation_events" USING btree ("consultation_id");
CREATE INDEX "idx_consultation_events_created_at" ON "public"."consultation_events" USING btree ("created_at" DESC);-- consultationsテーブルのUPDATEを全員に許可する暫定ポリシー
CREATE POLICY "Allow anyone to update consultations TEMPORARY"
ON public.consultations
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);-- ========== RLSポリシーの最終形 ==========

-- Step 1: 既存のポリシーを全てクリーンアップする
-- (テーブルごとに存在する可能性のある古いポリシーを全て削除)
DROP POLICY IF EXISTS "Enable all operations for all users" ON public.consultations;
DROP POLICY IF EXISTS "ログイン済みユーザーに全ての操作を許可" ON public.consultations;
DROP POLICY IF EXISTS "Enable all operations for all users" ON public.support_plans;
DROP POLICY IF EXISTS "Enable all operations for all users" ON public.users;
DROP POLICY IF EXISTS "Enable all operations for all users" ON public.staff;
-- (これまでに作成した他の名前のポリシーも念のため削除)
DROP POLICY IF EXISTS "Allow service-role to perform all actions on consultations" ON public.consultations;
DROP POLICY IF EXISTS "Allow service-role to insert into consultations" ON public.consultations;
DROP POLICY IF EXISTS "Allow service-role to perform all actions on events" ON public.consultation_events;


-- Step 2: 全ての主要テーブルに、統一された「service_role」ポリシーを再作成する
-- これにより、アプリケーションサーバーからのアクセスのみが許可される
CREATE POLICY "Allow ALL for service_role" ON public.consultations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL for service_role" ON public.consultation_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL for service_role" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL for service_role" ON public.support_plans FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL for service_role" ON public.staff FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Step 3: 新規テーブル'consultation_events'のRLSを有効化する
-- (他のテーブルは初期マイグレーションで有効化済みのため、これだけで良い)
ALTER TABLE public.consultation_events ENABLE ROW LEVEL SECURITY;-- supabase/migrations/YYYYMMDDHHMMSS_unify_staff_management.sql

-- =============================================================
-- スタッフ管理の統一化マイグレーション (決定版)
-- 目的: スキーマ変更と、それに伴う既存データの移行
-- =============================================================

-- ステップ1: staff.name カラムに UNIQUE 制約を追加
ALTER TABLE public.staff
ADD CONSTRAINT staff_name_unique UNIQUE (name);


-- ステップ2: データ移行に必要なスタッフ '三輪千加映' が存在することを保証する
-- (このマイグレーションが本番環境で実行される際、既存データ移行に必須)
INSERT INTO public.staff (name, email, role)
VALUES ('三輪千加映', 'miwa@example.com', '相談員')
ON CONFLICT (name) DO NOTHING;


-- ステップ3: support_plans テーブルに staff_id カラムを追加
ALTER TABLE public.support_plans
ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL;


-- ステップ4: 既存の consultations テーブルのデータを移行
UPDATE public.consultations
SET staff_id = (
    SELECT id FROM public.staff WHERE name = '三輪千加映' LIMIT 1
)
WHERE
    staff_name = '三輪千加映' AND staff_id IS NULL;


-- ステップ5: 既存の support_plans テーブルのデータを移行
UPDATE public.support_plans
SET staff_id = (
    SELECT id FROM public.staff WHERE name = '三輪千加映' LIMIT 1
)
WHERE
    staff_name = '三輪千加映' AND staff_id IS NULL;


-- ステップ6: 不要になった古い staff_name カラムを削除
ALTER TABLE public.consultations
DROP COLUMN IF EXISTS staff_name;

ALTER TABLE public.support_plans
DROP COLUMN IF EXISTS staff_name;


-- ステップ7: パフォーマンス向上のためのインデックスを作成
CREATE INDEX IF NOT EXISTS idx_consultations_staff_id ON public.consultations(staff_id);
CREATE INDEX IF NOT EXISTS idx_support_plans_staff_id ON public.support_plans(staff_id);-- マイグレーション: consultation_eventsテーブルにステータス遷移カラムを追加
-- 作成日: 2025年11月1日
-- 目的: 相談イベントのステータス変更履歴と次回アクション詳細を記録

ALTER TABLE "public"."consultation_events"
ADD COLUMN IF NOT EXISTS "status_from" text,
ADD COLUMN IF NOT EXISTS "status_to" text,
ADD COLUMN IF NOT EXISTS "next_action_memo" text;

-- カラムの説明:
-- status_from: 遷移前のステータス（例: "初回面談"）
-- status_to: 遷移後のステータス（例: "支援検討中"）
-- next_action_memo: 次回アクション内容の詳細メモ
