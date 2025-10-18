-- 既存のテーブルを削除
DROP TABLE IF EXISTS support_plans;
DROP TABLE IF EXISTS consultations;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS staff;

-- Staffテーブルを作成
CREATE TABLE staff (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text,
  role text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Usersテーブルを作成 (修正済みで問題なし)
CREATE TABLE users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  uid text UNIQUE NOT NULL,
  name text NOT NULL,
  birth_date date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  property_address text,
  property_name text,
  room_number text,
  intermediary text,
  deposit decimal(10,2),
  key_money decimal(10,2),
  rent decimal(10,2),
  fire_insurance decimal(10,2),
  common_fee decimal(10,2),
  landlord_rent decimal(10,2),
  landlord_common_fee decimal(10,2),
  rent_difference decimal(10,2),
  move_in_date date,
  next_renewal_date date,
  renewal_count integer DEFAULT 0,
  resident_contact text,
  line_available boolean DEFAULT false,
  emergency_contact text,
  emergency_contact_name text,
  relationship text,
  monitoring_system text,
  support_medical_institution text,
  notes text,
  proxy_payment_eligible boolean DEFAULT false,
  welfare_recipient boolean DEFAULT false,
  posthumous_affairs boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Consultationsテーブルを作成（★★ 修正 ★★）
CREATE TABLE consultations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 1. 基本情報
  consultation_date date NOT NULL,
  staff_name text NOT NULL,
  consultation_route_self boolean DEFAULT false,
  consultation_route_family boolean DEFAULT false,
  consultation_route_care_manager boolean DEFAULT false,
  consultation_route_elderly_center boolean DEFAULT false,
  consultation_route_disability_center boolean DEFAULT false,
  consultation_route_government boolean DEFAULT false,
  consultation_route_government_other text,
  consultation_route_other boolean DEFAULT false,
  consultation_route_other_text text,
  
  attribute_elderly boolean DEFAULT false,
  attribute_disability boolean DEFAULT false,
  attribute_disability_mental boolean DEFAULT false,
  attribute_disability_physical boolean DEFAULT false,
  attribute_disability_intellectual boolean DEFAULT false,
  attribute_childcare boolean DEFAULT false,
  attribute_single_parent boolean DEFAULT false,
  attribute_dv boolean DEFAULT false,
  attribute_foreigner boolean DEFAULT false,
  attribute_poverty boolean DEFAULT false,
  attribute_low_income boolean DEFAULT false,
  attribute_lgbt boolean DEFAULT false,
  attribute_welfare boolean DEFAULT false,
  
  name text,
  furigana text,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  household_single boolean DEFAULT false,
  household_couple boolean DEFAULT false,
  household_common_law boolean DEFAULT false,
  household_parent_child boolean DEFAULT false,
  household_siblings boolean DEFAULT false,
  household_acquaintance boolean DEFAULT false,
  household_other boolean DEFAULT false,
  household_other_text text,
  
  postal_code text,
  address text,
  phone_home text,
  phone_mobile text,
  birth_year integer,
  birth_month integer,
  birth_day integer,
  -- age integer, -- ★★ ageカラムを削除 ★★
  
  -- 2. 身体状況・利用サービス
  physical_condition text CHECK (physical_condition IN ('independent', 'support1', 'support2', 'care1', 'care2', 'care3', 'care4', 'care5')),
  
  mental_disability_certificate boolean DEFAULT false,
  mental_disability_level text,
  physical_disability_certificate boolean DEFAULT false,
  physical_disability_level text,
  therapy_certificate boolean DEFAULT false,
  therapy_level text,
  
  service_day_service boolean DEFAULT false,
  service_visiting_nurse boolean DEFAULT false,
  service_visiting_care boolean DEFAULT false,
  service_home_medical boolean DEFAULT false,
  service_short_stay boolean DEFAULT false,
  service_other boolean DEFAULT false,
  service_other_text text,
  
  service_provider text,
  care_support_office text,
  care_manager text,
  medical_history text,
  
  -- 3. 医療・収入
  medical_institution_name text,
  medical_institution_staff text,
  
  income_salary decimal(10,2),
  income_injury_allowance decimal(10,2),
  income_pension decimal(10,2),
  welfare_recipient boolean DEFAULT false,
  welfare_staff text,
  savings decimal(10,2),
  
  -- 4. ADL/IADL
  dementia text,
  dementia_hospital text,
  hospital_support_required boolean DEFAULT false,
  medication_management_needed boolean DEFAULT false,
  
  mobility_independent boolean DEFAULT false,
  mobility_partial_assist boolean DEFAULT false,
  mobility_full_assist boolean DEFAULT false,
  mobility_other boolean DEFAULT false,
  mobility_other_text text,
  
  eating_independent boolean DEFAULT false,
  eating_partial_assist boolean DEFAULT false,
  eating_full_assist boolean DEFAULT false,
  eating_other boolean DEFAULT false,
  eating_other_text text,
  
  shopping_possible boolean DEFAULT false,
  shopping_support_needed boolean DEFAULT false,
  shopping_support_text text,
  cooking_possible boolean DEFAULT false,
  cooking_support_needed boolean DEFAULT false,
  cooking_support_text text,
  
  excretion_independent boolean DEFAULT false,
  excretion_partial_assist boolean DEFAULT false,
  excretion_full_assist boolean DEFAULT false,
  excretion_other boolean DEFAULT false,
  excretion_other_text text,
  
  diaper_usage boolean DEFAULT false,
  garbage_disposal_independent boolean DEFAULT false,
  garbage_disposal_support_needed boolean DEFAULT false,
  garbage_disposal_support_text text,
  
  stairs_independent boolean DEFAULT false,
  stairs_partial_assist boolean DEFAULT false,
  stairs_full_assist boolean DEFAULT false,
  stairs_other boolean DEFAULT false,
  stairs_other_text text,
  
  second_floor_possible boolean DEFAULT false,
  bed_or_futon text CHECK (bed_or_futon IN ('bed', 'futon')),
  
  bathing_independent boolean DEFAULT false,
  bathing_partial_assist boolean DEFAULT false,
  bathing_full_assist boolean DEFAULT false,
  bathing_other boolean DEFAULT false,
  bathing_other_text text,
  
  unit_bath_possible boolean DEFAULT false,
  
  money_management text,
  supporter_available boolean DEFAULT false,
  supporter_text text,
  proxy_payment boolean DEFAULT false,
  rent_payment_method text CHECK (rent_payment_method IN ('transfer', 'collection', 'automatic')),
  
  other_notes text,
  
  -- 5. 相談内容等
  consultation_content text,
  relocation_reason text,
  
  emergency_contact_name text,
  emergency_contact_relationship text,
  emergency_contact_postal_code text,
  emergency_contact_address text,
  emergency_contact_phone_home text,
  emergency_contact_phone_mobile text,
  emergency_contact_email text,
  
  consultation_result text,
  next_appointment_scheduled boolean DEFAULT false,
  next_appointment_details text,
  
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Support Plansテーブルを作成（★★ 修正 ★★）
CREATE TABLE support_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 1. 基本情報
  creation_date date NOT NULL,
  staff_name text NOT NULL,
  name text NOT NULL,
  furigana text NOT NULL,
  birth_date date NOT NULL,
  -- age integer NOT NULL, -- ★★ ageカラムを削除 ★★
  residence text NOT NULL,
  phone_mobile text,
  line_available boolean DEFAULT false,
  
  -- ... (以降の定義は変更なし) ...
  
  welfare_recipient boolean DEFAULT false,
  welfare_worker text,
  welfare_contact text,
  care_level_independent boolean DEFAULT false,
  care_level_support1 boolean DEFAULT false,
  care_level_support2 boolean DEFAULT false,
  care_level_care1 boolean DEFAULT false,
  care_level_care2 boolean DEFAULT false,
  care_level_care3 boolean DEFAULT false,
  care_level_care4 boolean DEFAULT false,
  care_level_care5 boolean DEFAULT false,
  outpatient_care boolean DEFAULT false,
  outpatient_institution text,
  visiting_medical boolean DEFAULT false,
  visiting_medical_institution text,
  home_oxygen boolean DEFAULT false,
  physical_disability_level text,
  mental_disability_level text,
  therapy_certificate_level text,
  pension_national boolean DEFAULT false,
  pension_employee boolean DEFAULT false,
  pension_disability boolean DEFAULT false,
  pension_survivor boolean DEFAULT false,
  pension_corporate boolean DEFAULT false,
  pension_other boolean DEFAULT false,
  pension_other_details text,
  monitoring_secom boolean DEFAULT false,
  monitoring_secom_details text,
  monitoring_hello_light boolean DEFAULT false,
  monitoring_hello_light_details text,
  support_shopping boolean DEFAULT false,
  support_bank_visit boolean DEFAULT false,
  support_cleaning boolean DEFAULT false,
  support_bulb_change boolean DEFAULT false,
  support_garbage_disposal boolean DEFAULT false,
  goals text,
  needs_financial text,
  needs_physical text,
  needs_mental text,
  needs_lifestyle text,
  needs_environment text,
  evacuation_plan_completed boolean DEFAULT false,
  evacuation_plan_other_details text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) を有効化
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_plans ENABLE ROW LEVEL SECURITY;

-- すべてのユーザーが読み書きできるポリシーを作成（開発用）
CREATE POLICY "Enable all operations for all users" ON staff FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON users FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON consultations FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON support_plans FOR ALL USING (true);

-- updated_at を自動更新するトリガー関数を作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルにトリガーを作成
CREATE TRIGGER update_staff_updated_at 
    BEFORE UPDATE ON staff 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at 
    BEFORE UPDATE ON consultations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_plans_updated_at 
    BEFORE UPDATE ON support_plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ★★ 年齢自動計算・更新関連の関数とトリガーはすべて不要なため削除 ★★