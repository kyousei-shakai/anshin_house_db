-- supabase/migrations/【先ほど作成したタイムスタンプ】_create_get_consultations_with_next_action_function.sql

-- Drop the function if it already exists to ensure a clean re-creation
DROP FUNCTION IF EXISTS public.get_consultations_with_next_action(integer, integer);

-- Create the RPC function (Version 2: More robust memo handling)
CREATE OR REPLACE FUNCTION public.get_consultations_with_next_action(
    page_limit integer,
    page_offset integer
)
RETURNS TABLE (
    -- Select all columns from the 'consultations' table
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
    income_salary numeric(10,2),
    income_injury_allowance numeric(10,2),
    income_pension numeric(10,2),
    welfare_recipient boolean,
    welfare_staff text,
    savings numeric(10,2),
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

    -- Additional columns from JOINs
    staff_name text,
    next_action_date date,
    next_action_memo text -- The column name for the return type remains the same
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.*, -- Select all columns from consultations table
        s.name AS staff_name,
        latest_event.next_action_date,
        -- ▼▼▼【最重要修正点】▼▼▼
        -- next_action_memo が NULL の場合、event_note を使用する
        COALESCE(latest_event.next_action_memo, latest_event.event_note) AS next_action_memo
        -- ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
    FROM
        public.consultations AS c
    LEFT JOIN
        public.staff AS s ON c.staff_id = s.id
    LEFT JOIN LATERAL (
        SELECT
            ce.next_action_date,
            ce.next_action_memo,
            ce.event_note -- event_noteもSELECTに含める
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
        c.consultation_date DESC
    LIMIT
        page_limit
    OFFSET
        page_offset;
END;
$$;