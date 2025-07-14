export interface User {
  id: string
  uid: string // 正式UID
  name: string
  birth_date?: string
  gender?: 'male' | 'female' | 'other'
  age?: number
  property_address?: string // 物件住所
  property_name?: string // 物件名
  room_number?: string // 部屋番号
  intermediary?: string // 仲介
  deposit?: number // 敷金
  key_money?: number // 礼金
  rent?: number // 家賃
  fire_insurance?: number // 火災保険
  common_fee?: number // 共益費
  landlord_rent?: number // 大家家賃
  landlord_common_fee?: number // 大家共益費
  rent_difference?: number // 家賃差額
  move_in_date?: string // 入居日
  next_renewal_date?: string // 次回更新年月日
  renewal_count?: number // 更新回数
  resident_contact?: string // 入居者連絡先
  line_available?: boolean // LINE
  emergency_contact?: string // 緊急連絡先
  emergency_contact_name?: string // 緊急連絡先氏名
  relationship?: string // 続柄
  monitoring_system?: string // 見守りシステム
  support_medical_institution?: string // 支援機関/医療機関
  notes?: string // 備考
  proxy_payment_eligible?: boolean // 代理納付該当
  welfare_recipient?: boolean // 生活保護受給者
  posthumous_affairs?: boolean // 死後事務委任
  created_at: string
  updated_at: string
}

export interface Consultation {
  id: string
  consultation_date: string
  consultation_route: string[]
  attributes: string[]
  name?: string
  furigana?: string
  gender?: 'male' | 'female' | 'other'
  household_composition?: string[]
  postal_code?: string
  address?: string
  phone_home?: string
  phone_mobile?: string
  birth_date?: string
  age?: number
  
  // 身体状況・利用サービス
  physical_condition?: 'independent' | 'support1' | 'support2' | 'care1' | 'care2' | 'care3' | 'care4' | 'care5'
  disability_certificates?: {
    mental_health?: string
    physical_disability?: string
    rehabilitation?: string
  }
  services_in_use?: string[]
  service_provider?: string
  care_support_office?: string
  care_manager?: string
  medical_history?: string
  
  // 医療・収入
  medical_institutions?: {
    name?: string
    doctor?: string
  }
  income?: {
    salary?: number
    sickness_benefit?: number
    pension?: number
    welfare_recipient?: boolean
    welfare_worker?: string
    savings?: number
  }
  
  // ADL/IADL
  dementia_level?: 'none' | 'mild' | 'moderate' | 'severe' | 'very_severe'
  hospital_medication?: {
    hospital_name?: string
    support_needed?: boolean
    medication_management?: boolean
  }
  mobility?: {
    level?: 'independent' | 'partial_assist' | 'full_assist' | 'other'
    details?: string
    walking_aid?: boolean
    step_capability?: string[]
    assistive_devices?: string
  }
  eating?: {
    level?: 'independent' | 'partial_assist' | 'full_assist' | 'other'
    details?: string
    shopping_support?: string
    cooking_support?: string
  }
  excretion?: {
    level?: 'independent' | 'partial_assist' | 'full_assist' | 'other'
    details?: string
    diaper_use?: boolean
    garbage_disposal?: string
  }
  stairs?: {
    level?: 'independent' | 'partial_assist' | 'full_assist' | 'other'
    details?: string
    second_floor_possible?: boolean
    bed_futon?: 'bed' | 'futon'
  }
  bathing?: {
    level?: 'independent' | 'partial_assist' | 'full_assist' | 'other'
    details?: string
    unit_bath_possible?: boolean
    bathtub_depth?: number
  }
  money_management?: {
    level?: 'independent' | 'partial_assist' | 'full_assist' | 'other'
    details?: string
    supporter?: string
    proxy_payment?: boolean
    rent_payment_method?: 'transfer' | 'collection' | 'automatic'
  }
  other_notes?: string
  
  // 相談内容等
  consultation_content?: string
  relocation_reason?: string
  emergency_contact?: {
    name?: string
    relationship?: string
    postal_code?: string
    address?: string
    phone_home?: string
    phone_mobile?: string
    email?: string
  }
  consultation_result?: string
  
  // 関連付け
  user_id?: string // 利用者マスタと関連付けられている場合
  staff_id?: string
  
  created_at: string
  updated_at: string
}

export interface SupportPlan {
  id: string
  user_id: string
  creation_date: string
  staff_name: string
  name: string
  furigana: string
  birth_date: string
  age: number
  residence: string
  contact_info: {
    mobile_phone?: string
    line?: boolean
  }
  
  // 生活保護・介護保険
  welfare_recipient: boolean
  welfare_worker?: string
  welfare_contact?: string
  care_insurance_level?: string[]
  
  // 医療状況
  medical_care?: {
    outpatient?: boolean
    outpatient_facility?: string
    home_visit?: boolean
    home_visit_facility?: string
    home_oxygen?: boolean
  }
  
  // 障がい状況
  disabilities?: {
    physical?: string
    mental?: string
    rehabilitation?: string
  }
  
  // 年金状況
  pension_types?: string[]
  pension_other_details?: string
  
  // 生活支援サービス
  monitoring_services?: {
    secom?: boolean
    secom_details?: string
    hello_light?: boolean
    hello_light_details?: string
  }
  life_support_services?: string[]
  
  // 支援計画
  goals?: string
  needs_and_responses?: {
    financial?: { issue?: string; self_response?: boolean }
    physical?: { issue?: string; self_response?: boolean }
    mental?: { issue?: string; self_response?: boolean }
    living?: { issue?: string; self_response?: boolean }
    environment?: { issue?: string; self_response?: boolean }
  }
  
  // 個別避難計画
  individual_evacuation_plan?: {
    completed?: boolean
    details?: string
  }
  
  created_at: string
  updated_at: string
}

export interface Staff {
  id: string
  name: string
  email?: string
  role?: string
  created_at: string
  updated_at: string
}