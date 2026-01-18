-- 1. テーブルへのカラム追加
ALTER TABLE "public"."consultations" ADD COLUMN IF NOT EXISTS "age_group" text;
COMMENT ON COLUMN "public"."consultations"."age_group" IS '相談者の年代（生年月日不明時の補完用）';

-- 2. 一覧表示用RPCの更新 (Version 5 をベースに age_group を完全統合)
DROP FUNCTION IF EXISTS public.get_consultations_with_next_action(integer, integer);

CREATE OR REPLACE FUNCTION public.get_consultations_with_next_action(
    page_limit integer,
    page_offset integer
)
RETURNS TABLE (
    id uuid,
    consultation_date date,
    consultation_route_self boolean,
    consultation_route_family boolean,
    consultation_route_care_manager boolean,
    consultation_route_elderly_center boolean,
    consultation_route_disability_center boolean,
    consultation_route_government boolean,
    consultation_route_government_other text,
    consultation_route_other boolean,
    consultation_route_other_text text,
    attribute_elderly boolean,
    attribute_disability boolean,
    attribute_disability_mental boolean,
    attribute_disability_physical boolean,
    attribute_disability_intellectual boolean,
    attribute_childcare boolean,
    attribute_single_parent boolean,
    attribute_dv boolean,
    attribute_foreigner boolean,
    attribute_poverty boolean,
    attribute_low_income boolean,
    attribute_lgbt boolean,
    attribute_welfare boolean,
    name text,
    furigana text,
    gender text,
    household_single boolean,
    household_couple boolean,
    household_common_law boolean,
    household_parent_child boolean,
    household_siblings boolean,
    household_acquaintance boolean,
    household_other boolean,
    household_other_text text,
    postal_code text,
    address text,
    phone_home text,
    phone_mobile text,
    birth_year integer,
    birth_month integer,
    birth_day integer,
    physical_condition text,
    mental_disability_certificate boolean,
    mental_disability_level text,
    physical_disability_certificate boolean,
    physical_disability_level text,
    therapy_certificate boolean,
    therapy_level text,
    service_day_service boolean,
    service_visiting_nurse boolean,
    service_visiting_care boolean,
    service_home_medical boolean,
    service_short_stay boolean,
    service_other boolean,
    service_other_text text,
    service_provider text,
    care_support_office text,
    care_manager text,
    medical_history text,
    medical_institution_name text,
    medical_institution_staff text,
    income_salary numeric,
    income_injury_allowance numeric,
    income_pension numeric,
    welfare_recipient boolean,
    welfare_staff text,
    savings numeric,
    dementia text,
    dementia_hospital text,
    hospital_support_required boolean,
    medication_management_needed boolean,
    mobility_independent boolean,
    mobility_partial_assist boolean,
    mobility_full_assist boolean,
    mobility_other boolean,
    mobility_other_text text,
    eating_independent boolean,
    eating_partial_assist boolean,
    eating_full_assist boolean,
    eating_other boolean,
    eating_other_text text,
    shopping_possible boolean,
    shopping_support_needed boolean,
    shopping_support_text text,
    cooking_possible boolean,
    cooking_support_needed boolean,
    cooking_support_text text,
    excretion_independent boolean,
    excretion_partial_assist boolean,
    excretion_full_assist boolean,
    excretion_other boolean,
    excretion_other_text text,
    diaper_usage boolean,
    garbage_disposal_independent boolean,
    garbage_disposal_support_needed boolean,
    garbage_disposal_support_text text,
    stairs_independent boolean,
    stairs_partial_assist boolean,
    stairs_full_assist boolean,
    stairs_other boolean,
    stairs_other_text text,
    second_floor_possible boolean,
    bed_or_futon text,
    bathing_independent boolean,
    bathing_partial_assist boolean,
    bathing_full_assist boolean,
    bathing_other boolean,
    bathing_other_text text,
    unit_bath_possible boolean,
    money_management text,
    supporter_available boolean,
    supporter_text text,
    proxy_payment boolean,
    rent_payment_method text,
    mobility_aids text,
    money_management_supporter text,
    other_notes text,
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
    next_appointment_scheduled boolean,
    next_appointment_details text,
    user_id uuid,
    staff_id uuid,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    status text,
    is_relocation_to_other_city_desired boolean,
    relocation_admin_opinion text,
    relocation_admin_opinion_details text,
    relocation_cost_bearer text,
    relocation_cost_bearer_details text,
    relocation_notes text,
    rent_arrears_status text,
    rent_arrears_duration text,
    rent_arrears_details text,
    pet_status text,
    pet_details text,
    vehicle_car boolean,
    vehicle_motorcycle boolean,
    vehicle_bicycle boolean,
    vehicle_none boolean,
    current_floor_plan text,
    current_rent integer,
    eviction_date date,
    eviction_date_notes text,
    consultation_route_family_text text,
    consultation_route_care_manager_text text,
    consultation_route_elderly_center_text text,
    consultation_route_disability_center_text text,
    -- ★ ここに age_group を追加
    age_group text, 
    -- 結合フィールド
    staff_name text,
    next_action_date date,
    next_action_memo text
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id, c.consultation_date, c.consultation_route_self, c.consultation_route_family, c.consultation_route_care_manager, c.consultation_route_elderly_center, c.consultation_route_disability_center, c.consultation_route_government, c.consultation_route_government_other, c.consultation_route_other, c.consultation_route_other_text, c.attribute_elderly, c.attribute_disability, c.attribute_disability_mental, c.attribute_disability_physical, c.attribute_disability_intellectual, c.attribute_childcare, c.attribute_single_parent, c.attribute_dv, c.attribute_foreigner, c.attribute_poverty, c.attribute_low_income, c.attribute_lgbt, c.attribute_welfare, c.name, c.furigana, c.gender, c.household_single, c.household_couple, c.household_common_law, c.household_parent_child, c.household_siblings, c.household_acquaintance, c.household_other, c.household_other_text, c.postal_code, c.address, c.phone_home, c.phone_mobile, c.birth_year, c.birth_month, c.birth_day, c.physical_condition, c.mental_disability_certificate, c.mental_disability_level, c.physical_disability_certificate, c.physical_disability_level, c.therapy_certificate, c.therapy_level, c.service_day_service, c.service_visiting_nurse, c.service_visiting_care, c.service_home_medical, c.service_short_stay, c.service_other, c.service_other_text, c.service_provider, c.care_support_office, c.care_manager, c.medical_history, c.medical_institution_name, c.medical_institution_staff, c.income_salary, c.income_injury_allowance, c.income_pension, c.welfare_recipient, c.welfare_staff, c.savings, c.dementia, c.dementia_hospital, c.hospital_support_required, c.medication_management_needed, c.mobility_independent, c.mobility_partial_assist, c.mobility_full_assist, c.mobility_other, c.mobility_other_text, c.eating_independent, c.eating_partial_assist, c.eating_full_assist, c.eating_other, c.eating_other_text, c.shopping_possible, c.shopping_support_needed, c.shopping_support_text, c.cooking_possible, c.cooking_support_needed, c.cooking_support_text, c.excretion_independent, c.excretion_partial_assist, c.excretion_full_assist, c.excretion_other, c.excretion_other_text, c.diaper_usage, c.garbage_disposal_independent, c.garbage_disposal_support_needed, c.garbage_disposal_support_text, c.stairs_independent, c.stairs_partial_assist, c.stairs_full_assist, c.stairs_other, c.stairs_other_text, c.second_floor_possible, c.bed_or_futon, c.bathing_independent, c.bathing_partial_assist, c.bathing_full_assist, c.bathing_other, c.bathing_other_text, c.unit_bath_possible, c.money_management, c.supporter_available, c.supporter_text, c.proxy_payment, c.rent_payment_method, c.mobility_aids, c.money_management_supporter, c.other_notes, c.consultation_content, c.relocation_reason, c.emergency_contact_name, c.emergency_contact_relationship, c.emergency_contact_postal_code, c.emergency_contact_address, c.emergency_contact_phone_home, c.emergency_contact_phone_mobile, c.emergency_contact_email, c.consultation_result, c.next_appointment_scheduled, c.next_appointment_details, c.user_id, c.staff_id, c.created_at, c.updated_at, c.status, c.is_relocation_to_other_city_desired, c.relocation_admin_opinion, c.relocation_admin_opinion_details, c.relocation_cost_bearer, c.relocation_cost_bearer_details, c.relocation_notes, c.rent_arrears_status, c.rent_arrears_duration, c.rent_arrears_details, c.pet_status, c.pet_details, c.vehicle_car, c.vehicle_motorcycle, c.vehicle_bicycle, c.vehicle_none, c.current_floor_plan, c.current_rent, c.eviction_date, c.eviction_date_notes,
        c.consultation_route_family_text, c.consultation_route_care_manager_text, c.consultation_route_elderly_center_text, c.consultation_route_disability_center_text,
        -- ★ c.age_group を追加
        c.age_group, 
        s.name AS staff_name,
        latest_event.next_action_date,
        COALESCE(latest_event.next_action_memo, latest_event.event_note) AS next_action_memo
    FROM
        public.consultations AS c
    LEFT JOIN
        public.staff AS s ON c.staff_id = s.id
    LEFT JOIN LATERAL (
        SELECT
            ce.next_action_date,
            ce.next_action_memo,
            ce.event_note
        FROM
            public.consultation_events AS ce
        WHERE
            ce.consultation_id = c.id
            AND ce.next_action_date IS NOT NULL
        ORDER BY
            ce.created_at DESC
        LIMIT 1
    ) AS latest_event ON true
    ORDER BY
        c.consultation_date DESC, c.created_at DESC
    LIMIT
        page_limit
    OFFSET
        page_offset;
END;
$$;