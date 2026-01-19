// ConsultationFormで使用されるフォームデータの型定義
export type ConsultationFormData = {
  consultation_date: string
  staff_id: string
  consultation_route_self: boolean
  consultation_route_family: boolean
  consultation_route_family_text: string // ★ 追加
  consultation_route_care_manager: boolean
  consultation_route_care_manager_text: string // ★ 追加
  consultation_route_elderly_center: boolean
  consultation_route_elderly_center_text: string // ★ 追加
  consultation_route_disability_center: boolean
  consultation_route_disability_center_text: string // ★ 追加
  consultation_route_government: boolean
  consultation_route_government_other: string
  consultation_route_other: boolean
  consultation_route_other_text: string
  attribute_elderly: boolean
  attribute_disability: boolean
  attribute_disability_mental: boolean
  attribute_disability_physical: boolean
  attribute_disability_intellectual: boolean
  attribute_childcare: boolean
  attribute_single_parent: boolean
  attribute_dv: boolean
  attribute_foreigner: boolean
  attribute_poverty: boolean
  attribute_low_income: boolean
  attribute_lgbt: boolean
  attribute_welfare: boolean
  name: string
  furigana: string
  gender: 'male' | 'female' | 'other' | ''
  household_single: boolean
  household_couple: boolean
  household_common_law: boolean
  household_parent_child: boolean
  household_siblings: boolean
  household_acquaintance: boolean
  household_other: boolean
  household_other_text: string
  postal_code: string
  address: string
  phone_home: string
  phone_mobile: string
  birth_year: string | number
  birth_month: string | number
  birth_day: string | number
  age_group: string; // ★ここに追加（既存データとの整合性のためstring型）
  physical_condition: 'independent' | 'support1' | 'support2' | 'care1' | 'care2' | 'care3' | 'care4' | 'care5' | ''
  mental_disability_certificate: boolean
  mental_disability_level: string
  physical_disability_certificate: boolean
  physical_disability_level: string
  therapy_certificate: boolean
  therapy_level: string
  service_day_service: boolean
  service_visiting_nurse: boolean
  service_visiting_care: boolean
  service_home_medical: boolean
  service_short_stay: boolean
  service_other: boolean
  service_other_text: string
  service_provider: string
  care_support_office: string
  care_manager: string
  medical_history: string
  medical_institution_name: string
  medical_institution_staff: string
  income_salary: string | number
  income_injury_allowance: string | number
  income_pension: string | number
  welfare_recipient: boolean
  welfare_staff: string
  savings: string | number
  dementia: string
  dementia_hospital: string
  hospital_support_required: boolean
  medication_management_needed: boolean
  mobility_status: 'independent' | 'partial_assist' | 'full_assist' | 'other' | ''
  mobility_other_text: string
  mobility_aids: string
  eating_status: 'independent' | 'partial_assist' | 'full_assist' | 'other' | ''
  eating_other_text: string
  shopping_status: 'possible' | 'support_needed' | ''
  shopping_support_text: string
  garbage_disposal_status: 'independent' | 'support_needed' | ''
  garbage_disposal_support_text: string
  excretion_status: 'independent' | 'partial_assist' | 'full_assist' | 'other' | ''
  excretion_other_text: string
  second_floor_possible: 'possible' | 'impossible' | ''
  bathing_status: 'independent' | 'partial_assist' | 'full_assist' | 'other' | ''
  bathing_other_text: string
  money_management_supporter: string
  uses_proxy_payment_service: 'yes' | 'no' | ''
  rent_payment_method: 'transfer' | 'collection' | 'automatic' | ''
  is_relocation_to_other_city_desired: 'yes' | 'no' | '',
  relocation_admin_opinion: 'possible' | 'impossible' | 'pending' | 'other' | '',
  relocation_admin_opinion_details: string,
  relocation_cost_bearer: 'previous_city' | 'next_city' | 'self' | 'pending' | 'other' | '',
  relocation_cost_bearer_details: string,
  relocation_notes: string,
  rent_arrears_status: 'yes' | 'no' | '',
  rent_arrears_duration: '1_month' | '2_to_3_months' | 'half_year_or_more' | 'other' | '',
  rent_arrears_details: string,
  pet_status: 'yes' | 'no' | '',
  pet_details: string,
  vehicle_car: boolean,
  vehicle_motorcycle: boolean,
  vehicle_bicycle: boolean,
  vehicle_none: boolean,
  current_floor_plan: string,
  current_rent: string | number,
  eviction_date: string,
  eviction_date_notes: string,
  other_notes: string
  consultation_content: string
  relocation_reason: string
  emergency_contact_name: string
  emergency_contact_relationship: string
  emergency_contact_postal_code: string
  emergency_contact_address: string
  emergency_contact_phone_home: string
  emergency_contact_phone_mobile: string
  emergency_contact_email: string
  consultation_result: string
}