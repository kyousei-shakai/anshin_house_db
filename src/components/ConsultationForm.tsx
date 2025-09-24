'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { consultationsApi } from '@/lib/api'
import { Database } from '@/types/database'

// 型エイリアス
type ConsultationInsert = Database['public']['Tables']['consultations']['Insert']
type ConsultationUpdate = Partial<Database['public']['Tables']['consultations']['Update']>

// propsの型定義
interface ConsultationFormProps {
  editMode?: boolean
  consultationId?: string
}

// フォームで扱うデータの型定義
type ConsultationFormData = {
  consultation_date: string
  staff_name: string
  consultation_route_self: boolean
  consultation_route_family: boolean
  consultation_route_care_manager: boolean
  consultation_route_elderly_center: boolean
  consultation_route_disability_center: boolean
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
  
  // --- 他市区町村への転居 ---
  is_relocation_to_other_city_desired: 'yes' | 'no' | '',
  relocation_admin_opinion: 'possible' | 'impossible' | 'pending' | 'other' | '',
  relocation_admin_opinion_details: string,
  relocation_cost_bearer: 'previous_city' | 'next_city' | 'self' | 'pending' | 'other' | '',
  relocation_cost_bearer_details: string,
  relocation_notes: string,
  
  // --- 現在の住まい ---
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
  next_appointment_scheduled: boolean
  next_appointment_details: string
}

const ConsultationForm: React.FC<ConsultationFormProps> = ({ editMode = false, consultationId }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const initialFormData: ConsultationFormData = {
    consultation_date: new Date().toISOString().split('T')[0],
    staff_name: '',
    consultation_route_self: false,
    consultation_route_family: false,
    consultation_route_care_manager: false,
    consultation_route_elderly_center: false,
    consultation_route_disability_center: false,
    consultation_route_government: false,
    consultation_route_government_other: '',
    consultation_route_other: false,
    consultation_route_other_text: '',
    attribute_elderly: false,
    attribute_disability: false,
    attribute_disability_mental: false,
    attribute_disability_physical: false,
    attribute_disability_intellectual: false,
    attribute_childcare: false,
    attribute_single_parent: false,
    attribute_dv: false,
    attribute_foreigner: false,
    attribute_poverty: false,
    attribute_low_income: false,
    attribute_lgbt: false,
    attribute_welfare: false,
    name: '',
    furigana: '',
    gender: '',
    household_single: false,
    household_couple: false,
    household_common_law: false,
    household_parent_child: false,
    household_siblings: false,
    household_acquaintance: false,
    household_other: false,
    household_other_text: '',
    postal_code: '',
    address: '',
    phone_home: '',
    phone_mobile: '',
    birth_year: '',
    birth_month: '',
    birth_day: '',
    physical_condition: '',
    mental_disability_certificate: false,
    mental_disability_level: '',
    physical_disability_certificate: false,
    physical_disability_level: '',
    therapy_certificate: false,
    therapy_level: '',
    service_day_service: false,
    service_visiting_nurse: false,
    service_visiting_care: false,
    service_home_medical: false,
    service_short_stay: false,
    service_other: false,
    service_other_text: '',
    service_provider: '',
    care_support_office: '',
    care_manager: '',
    medical_history: '',
    medical_institution_name: '',
    medical_institution_staff: '',
    income_salary: '',
    income_injury_allowance: '',
    income_pension: '',
    welfare_recipient: false,
    welfare_staff: '',
    savings: '',
    dementia: '',
    dementia_hospital: '',
    hospital_support_required: false,
    medication_management_needed: false,
    mobility_status: '',
    mobility_other_text: '',
    mobility_aids: '',
    eating_status: '',
    eating_other_text: '',
    shopping_status: '',
    shopping_support_text: '',
    garbage_disposal_status: '',
    garbage_disposal_support_text: '',
    excretion_status: '',
    excretion_other_text: '',
    second_floor_possible: '',
    bathing_status: '',
    bathing_other_text: '',
    money_management_supporter: '',
    uses_proxy_payment_service: '',
    rent_payment_method: '',
    is_relocation_to_other_city_desired: '',
    relocation_admin_opinion: '',
    relocation_admin_opinion_details: '',
    relocation_cost_bearer: '',
    relocation_cost_bearer_details: '',
    relocation_notes: '',
    rent_arrears_status: '',
    rent_arrears_duration: '',
    rent_arrears_details: '',
    pet_status: '',
    pet_details: '',
    vehicle_car: false,
    vehicle_motorcycle: false,
    vehicle_bicycle: false,
    vehicle_none: false,
    current_floor_plan: '',
    current_rent: '',
    eviction_date: '',
    eviction_date_notes: '',
    other_notes: '',
    consultation_content: '',
    relocation_reason: '',
    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_contact_postal_code: '',
    emergency_contact_address: '',
    emergency_contact_phone_home: '',
    emergency_contact_phone_mobile: '',
    emergency_contact_email: '',
    consultation_result: '',
    next_appointment_scheduled: false,
    next_appointment_details: ''
  };

  const [formData, setFormData] = useState<ConsultationFormData>(initialFormData);

  useEffect(() => {
    // デバッグ用のconsole.logは不要になったので削除
    const fetchConsultation = async () => {
      if (editMode && consultationId) {
        try {
          const data = await consultationsApi.getById(consultationId);
          if (data) {
            const getStatus = (independent: boolean | null, partial: boolean | null, full: boolean | null, other: boolean | null) => {
              if (independent) return 'independent';
              if (partial) return 'partial_assist';
              if (full) return 'full_assist';
              if (other) return 'other';
              return '';
            };

            setFormData({
              consultation_date: data.consultation_date ? data.consultation_date.split('T')[0] : '',
              staff_name: data.staff_name || '',
              consultation_route_self: data.consultation_route_self || false,
              consultation_route_family: data.consultation_route_family || false,
              consultation_route_care_manager: data.consultation_route_care_manager || false,
              consultation_route_elderly_center: data.consultation_route_elderly_center || false,
              consultation_route_disability_center: data.consultation_route_disability_center || false,
              consultation_route_government: data.consultation_route_government || false,
              consultation_route_government_other: data.consultation_route_government_other || '',
              consultation_route_other: data.consultation_route_other || false,
              consultation_route_other_text: data.consultation_route_other_text || '',
              attribute_elderly: data.attribute_elderly || false,
              attribute_disability: data.attribute_disability || false,
              attribute_disability_mental: data.attribute_disability_mental || false,
              attribute_disability_physical: data.attribute_disability_physical || false,
              attribute_disability_intellectual: data.attribute_disability_intellectual || false,
              attribute_childcare: data.attribute_childcare || false,
              attribute_single_parent: data.attribute_single_parent || false,
              attribute_dv: data.attribute_dv || false,
              attribute_foreigner: data.attribute_foreigner || false,
              attribute_poverty: data.attribute_poverty || false,
              attribute_low_income: data.attribute_low_income || false,
              attribute_lgbt: data.attribute_lgbt || false,
              attribute_welfare: data.attribute_welfare || false,
              name: data.name || '',
              furigana: data.furigana || '',
              gender: data.gender as 'male' | 'female' | 'other' | '' || '',
              household_single: data.household_single || false,
              household_couple: data.household_couple || false,
              household_common_law: data.household_common_law || false,
              household_parent_child: data.household_parent_child || false,
              household_siblings: data.household_siblings || false,
              household_acquaintance: data.household_acquaintance || false,
              household_other: data.household_other || false,
              household_other_text: data.household_other_text || '',
              postal_code: data.postal_code || '',
              address: data.address || '',
              phone_home: data.phone_home || '',
              phone_mobile: data.phone_mobile || '',
              birth_year: data.birth_year || '',
              birth_month: data.birth_month || '',
              birth_day: data.birth_day || '',
              physical_condition: data.physical_condition as ConsultationFormData['physical_condition'] || '',
              mental_disability_certificate: data.mental_disability_certificate || false,
              mental_disability_level: data.mental_disability_level || '',
              physical_disability_certificate: data.physical_disability_certificate || false,
              physical_disability_level: data.physical_disability_level || '',
              therapy_certificate: data.therapy_certificate || false,
              therapy_level: data.therapy_level || '',
              service_day_service: data.service_day_service || false,
              service_visiting_nurse: data.service_visiting_nurse || false,
              service_visiting_care: data.service_visiting_care || false,
              service_home_medical: data.service_home_medical || false,
              service_short_stay: data.service_short_stay || false,
              service_other: data.service_other || false,
              service_other_text: data.service_other_text || '',
              service_provider: data.service_provider || '',
              care_support_office: data.care_support_office || '',
              care_manager: data.care_manager || '',
              medical_history: data.medical_history || '',
              medical_institution_name: data.medical_institution_name || '',
              medical_institution_staff: data.medical_institution_staff || '',
              income_salary: data.income_salary || '',
              income_injury_allowance: data.income_injury_allowance || '',
              income_pension: data.income_pension || '',
              welfare_recipient: data.welfare_recipient || false,
              welfare_staff: data.welfare_staff || '',
              savings: data.savings || '',
              dementia: data.dementia || '',
              dementia_hospital: data.dementia_hospital || '',
              hospital_support_required: data.hospital_support_required === true,
              medication_management_needed: data.medication_management_needed === true,
              mobility_status: getStatus(data.mobility_independent, data.mobility_partial_assist, data.mobility_full_assist, data.mobility_other),
              mobility_other_text: data.mobility_other_text || '',
              mobility_aids: data.mobility_aids || '',
              eating_status: getStatus(data.eating_independent, data.eating_partial_assist, data.eating_full_assist, data.eating_other),
              eating_other_text: data.eating_other_text || '',
              shopping_status: data.shopping_possible ? 'possible' : data.shopping_support_needed ? 'support_needed' : '',
              shopping_support_text: data.shopping_support_text || '',
              garbage_disposal_status: data.garbage_disposal_independent ? 'independent' : data.garbage_disposal_support_needed ? 'support_needed' : '',
              garbage_disposal_support_text: data.garbage_disposal_support_text || '',
              excretion_status: getStatus(data.excretion_independent, data.excretion_partial_assist, data.excretion_full_assist, data.excretion_other),
              excretion_other_text: data.excretion_other_text || '',
              second_floor_possible: data.second_floor_possible === true ? 'possible' : data.second_floor_possible === false ? 'impossible' : '',
              bathing_status: getStatus(data.bathing_independent, data.bathing_partial_assist, data.bathing_full_assist, data.bathing_other),
              bathing_other_text: data.bathing_other_text || '',
              money_management_supporter: data.money_management_supporter || '',
              uses_proxy_payment_service: data.proxy_payment === true ? 'yes' : data.proxy_payment === false ? 'no' : '',
              rent_payment_method: data.rent_payment_method as ConsultationFormData['rent_payment_method'] || '',
              
              // --- 他市区町村への転居 ---
              is_relocation_to_other_city_desired: data.is_relocation_to_other_city_desired === true ? 'yes' : data.is_relocation_to_other_city_desired === false ? 'no' : '',
              relocation_admin_opinion: data.relocation_admin_opinion as ConsultationFormData['relocation_admin_opinion'] || '',
              relocation_admin_opinion_details: data.relocation_admin_opinion_details || '',
              relocation_cost_bearer: data.relocation_cost_bearer as ConsultationFormData['relocation_cost_bearer'] || '',
              relocation_cost_bearer_details: data.relocation_cost_bearer_details || '',
              relocation_notes: data.relocation_notes || '',

              // --- 現在の住まい ---
              rent_arrears_status: data.rent_arrears_status as ConsultationFormData['rent_arrears_status'] || '',
              rent_arrears_duration: data.rent_arrears_duration as ConsultationFormData['rent_arrears_duration'] || '',
              rent_arrears_details: data.rent_arrears_details || '',
              pet_status: data.pet_status as ConsultationFormData['pet_status'] || '',
              pet_details: data.pet_details || '',
              vehicle_car: data.vehicle_car || false,
              vehicle_motorcycle: data.vehicle_motorcycle || false,
              vehicle_bicycle: data.vehicle_bicycle || false,
              vehicle_none: data.vehicle_none || false,
              current_floor_plan: data.current_floor_plan || '',
              current_rent: data.current_rent || '',
              eviction_date: data.eviction_date || '',
              eviction_date_notes: data.eviction_date_notes || '',
              
              other_notes: data.other_notes || '',
              consultation_content: data.consultation_content || '',
              relocation_reason: data.relocation_reason || '',
              emergency_contact_name: data.emergency_contact_name || '',
              emergency_contact_relationship: data.emergency_contact_relationship || '',
              emergency_contact_postal_code: data.emergency_contact_postal_code || '',
              emergency_contact_address: data.emergency_contact_address || '',
              emergency_contact_phone_home: data.emergency_contact_phone_home || '',
              emergency_contact_phone_mobile: data.emergency_contact_phone_mobile || '',
              emergency_contact_email: data.emergency_contact_email || '',
              consultation_result: data.consultation_result || '',
              next_appointment_scheduled: data.next_appointment_scheduled || false,
              next_appointment_details: data.next_appointment_details || '',
            });
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'データの読み込みに失敗しました。');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchConsultation();
  }, [editMode, consultationId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    setFormData(prev => ({ ...prev, [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleRadioChange = (name: keyof ConsultationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const dataToSubmit: ConsultationUpdate = {
        consultation_date: formData.consultation_date,
        staff_name: formData.staff_name,
        consultation_route_self: formData.consultation_route_self,
        consultation_route_family: formData.consultation_route_family,
        consultation_route_care_manager: formData.consultation_route_care_manager,
        consultation_route_elderly_center: formData.consultation_route_elderly_center,
        consultation_route_disability_center: formData.consultation_route_disability_center,
        consultation_route_government: formData.consultation_route_government,
        consultation_route_government_other: formData.consultation_route_government_other || null,
        consultation_route_other: formData.consultation_route_other,
        consultation_route_other_text: formData.consultation_route_other_text || null,
        attribute_elderly: formData.attribute_elderly,
        attribute_disability: formData.attribute_disability,
        attribute_disability_mental: formData.attribute_disability_mental,
        attribute_disability_physical: formData.attribute_disability_physical,
        attribute_disability_intellectual: formData.attribute_disability_intellectual,
        attribute_childcare: formData.attribute_childcare,
        attribute_single_parent: formData.attribute_single_parent,
        attribute_dv: formData.attribute_dv,
        attribute_foreigner: formData.attribute_foreigner,
        attribute_poverty: formData.attribute_poverty,
        attribute_low_income: formData.attribute_low_income,
        attribute_lgbt: formData.attribute_lgbt,
        attribute_welfare: formData.attribute_welfare,
        name: formData.name || null,
        furigana: formData.furigana || null,
        gender: formData.gender || null,
        household_single: formData.household_single,
        household_couple: formData.household_couple,
        household_common_law: formData.household_common_law,
        household_parent_child: formData.household_parent_child,
        household_siblings: formData.household_siblings,
        household_acquaintance: formData.household_acquaintance,
        household_other: formData.household_other,
        household_other_text: formData.household_other_text || null,
        postal_code: formData.postal_code || null,
        address: formData.address || null,
        phone_home: formData.phone_home || null,
        phone_mobile: formData.phone_mobile || null,
        birth_year: formData.birth_year ? Number(formData.birth_year) : null,
        birth_month: formData.birth_month ? Number(formData.birth_month) : null,
        birth_day: formData.birth_day ? Number(formData.birth_day) : null,
        physical_condition: formData.physical_condition || null,
        mental_disability_certificate: formData.mental_disability_certificate,
        mental_disability_level: formData.mental_disability_level || null,
        physical_disability_certificate: formData.physical_disability_certificate,
        physical_disability_level: formData.physical_disability_level || null,
        therapy_certificate: formData.therapy_certificate,
        therapy_level: formData.therapy_level || null,
        service_day_service: formData.service_day_service,
        service_visiting_nurse: formData.service_visiting_nurse,
        service_visiting_care: formData.service_visiting_care,
        service_home_medical: formData.service_home_medical,
        service_short_stay: formData.service_short_stay,
        service_other: formData.service_other,
        service_other_text: formData.service_other_text || null,
        service_provider: formData.service_provider || null,
        care_support_office: formData.care_support_office || null,
        care_manager: formData.care_manager || null,
        medical_history: formData.medical_history || null,
        medical_institution_name: formData.medical_institution_name || null,
        medical_institution_staff: formData.medical_institution_staff || null,
        income_salary: formData.income_salary ? Number(formData.income_salary) : null,
        income_injury_allowance: formData.income_injury_allowance ? Number(formData.income_injury_allowance) : null,
        income_pension: formData.income_pension ? Number(formData.income_pension) : null,
        welfare_recipient: formData.welfare_recipient,
        welfare_staff: formData.welfare_staff || null,
        savings: formData.savings ? Number(formData.savings) : null,
        dementia: formData.dementia || null,
        dementia_hospital: formData.dementia_hospital || null,
        hospital_support_required: formData.hospital_support_required,
        medication_management_needed: formData.medication_management_needed,
        mobility_independent: formData.mobility_status === 'independent',
        mobility_partial_assist: formData.mobility_status === 'partial_assist',
        mobility_full_assist: formData.mobility_status === 'full_assist',
        mobility_other: formData.mobility_status === 'other',
        mobility_other_text: formData.mobility_status === 'other' ? formData.mobility_other_text || null : null,
        mobility_aids: formData.mobility_aids || null,
        eating_independent: formData.eating_status === 'independent',
        eating_partial_assist: formData.eating_status === 'partial_assist',
        eating_full_assist: formData.eating_status === 'full_assist',
        eating_other: formData.eating_status === 'other',
        eating_other_text: formData.eating_status === 'other' ? formData.eating_other_text || null : null,
        shopping_possible: formData.shopping_status === 'possible',
        shopping_support_needed: formData.shopping_status === 'support_needed',
        shopping_support_text: formData.shopping_status === 'support_needed' ? formData.shopping_support_text || null : null,
        garbage_disposal_independent: formData.garbage_disposal_status === 'independent',
        garbage_disposal_support_needed: formData.garbage_disposal_status === 'support_needed',
        garbage_disposal_support_text: formData.garbage_disposal_status === 'support_needed' ? formData.garbage_disposal_support_text || null : null,
        excretion_independent: formData.excretion_status === 'independent',
        excretion_partial_assist: formData.excretion_status === 'partial_assist',
        excretion_full_assist: formData.excretion_status === 'full_assist',
        excretion_other: formData.excretion_status === 'other',
        excretion_other_text: formData.excretion_status === 'other' ? formData.excretion_other_text || null : null,
        second_floor_possible: formData.second_floor_possible === 'possible' ? true : formData.second_floor_possible === 'impossible' ? false : null,
        bathing_independent: formData.bathing_status === 'independent',
        bathing_partial_assist: formData.bathing_status === 'partial_assist',
        bathing_full_assist: formData.bathing_status === 'full_assist',
        bathing_other: formData.bathing_status === 'other',
        bathing_other_text: formData.bathing_status === 'other' ? formData.bathing_other_text || null : null,
        money_management_supporter: formData.money_management_supporter || null,
        proxy_payment: formData.uses_proxy_payment_service === 'yes' ? true : formData.uses_proxy_payment_service === 'no' ? false : null,
        rent_payment_method: formData.rent_payment_method || null,
        
        // --- 他市区町村への転居 ---
        is_relocation_to_other_city_desired: formData.is_relocation_to_other_city_desired === 'yes' ? true : formData.is_relocation_to_other_city_desired === 'no' ? false : null,
        relocation_admin_opinion: formData.is_relocation_to_other_city_desired === 'yes' ? formData.relocation_admin_opinion || null : null,
        relocation_admin_opinion_details: formData.is_relocation_to_other_city_desired === 'yes' && formData.relocation_admin_opinion === 'other' ? formData.relocation_admin_opinion_details || null : null,
        relocation_cost_bearer: formData.is_relocation_to_other_city_desired === 'yes' ? formData.relocation_cost_bearer || null : null,
        relocation_cost_bearer_details: formData.is_relocation_to_other_city_desired === 'yes' && formData.relocation_cost_bearer === 'other' ? formData.relocation_cost_bearer_details || null : null,
        relocation_notes: formData.is_relocation_to_other_city_desired === 'yes' ? formData.relocation_notes || null : null,
        
        // --- 現在の住まい ---
        rent_arrears_status: formData.rent_arrears_status || null,
        rent_arrears_duration: formData.rent_arrears_status === 'yes' ? formData.rent_arrears_duration || null : null,
        rent_arrears_details: formData.rent_arrears_status === 'yes' ? formData.rent_arrears_details || null : null,
        pet_status: formData.pet_status || null,
        pet_details: formData.pet_status === 'yes' ? formData.pet_details || null : null,
        vehicle_car: formData.vehicle_car,
        vehicle_motorcycle: formData.vehicle_motorcycle,
        vehicle_bicycle: formData.vehicle_bicycle,
        vehicle_none: formData.vehicle_none,
        current_floor_plan: formData.current_floor_plan || null,
        current_rent: formData.current_rent ? Number(formData.current_rent) : null,
        eviction_date: formData.eviction_date || null,
        eviction_date_notes: formData.eviction_date_notes || null,
        
        other_notes: formData.other_notes || null,
        consultation_content: formData.consultation_content || null,
        relocation_reason: formData.relocation_reason || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_relationship: formData.emergency_contact_relationship || null,
        emergency_contact_postal_code: formData.emergency_contact_postal_code || null,
        emergency_contact_address: formData.emergency_contact_address || null,
        emergency_contact_phone_home: formData.emergency_contact_phone_home || null,
        emergency_contact_phone_mobile: formData.emergency_contact_phone_mobile || null,
        emergency_contact_email: formData.emergency_contact_email || null,
        consultation_result: formData.consultation_result || null,
        next_appointment_scheduled: formData.next_appointment_scheduled,
        next_appointment_details: formData.next_appointment_details || null,
      };

      if (editMode && consultationId) {
        await consultationsApi.update(consultationId, dataToSubmit);
        router.push(`/consultations/${consultationId}`);
      } else {
        await consultationsApi.create(dataToSubmit as ConsultationInsert);
        router.push('/consultations');
      }
      router.refresh();
    } catch (err) {
      console.error('Submit Error Details:', err);
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました。コンソールを確認してください。');
    } finally {
      setLoading(false);
    }
  };

    const calculateAge = () => {
      if (formData.birth_year && formData.birth_month && formData.birth_day) {
        const birthDate = new Date(Number(formData.birth_year), Number(formData.birth_month) - 1, Number(formData.birth_day));
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      }
      return null;
    };

    const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i)
    const months = Array.from({ length: 12 }, (_, i) => i + 1)
    const days = Array.from({ length: 31 }, (_, i) => i + 1)

    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-500 text-sm">{error}</div>
          </div>
        )}

        {/* 1. 基本情報 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">1. 基本情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">相談日 <span className="text-red-500">*</span></label>
              <input type="date" name="consultation_date" value={formData.consultation_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white" required />
            </div>
            <div>
              <label htmlFor="staff_name" className="block text-sm font-medium text-gray-700 mb-1">担当スタッフ <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="staff_name"
                name="staff_name"
                value={formData.staff_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">相談ルート</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <label className="flex items-center"><input type="checkbox" name="consultation_route_self" checked={formData.consultation_route_self} onChange={handleChange} className="mr-2" /><span className="text-gray-800">本人</span></label>
              <label className="flex items-center"><input type="checkbox" name="consultation_route_family" checked={formData.consultation_route_family} onChange={handleChange} className="mr-2" /><span className="text-gray-800">家族</span></label>
              <label className="flex items-center"><input type="checkbox" name="consultation_route_care_manager" checked={formData.consultation_route_care_manager} onChange={handleChange} className="mr-2" /><span className="text-gray-800">ケアマネ</span></label>
              <label className="flex items-center"><input type="checkbox" name="consultation_route_elderly_center" checked={formData.consultation_route_elderly_center} onChange={handleChange} className="mr-2" /><span className="text-gray-800">支援センター（高齢者）</span></label>
              <label className="flex items-center"><input type="checkbox" name="consultation_route_disability_center" checked={formData.consultation_route_disability_center} onChange={handleChange} className="mr-2" /><span className="text-gray-800">支援センター（障害者）</span></label>
            </div>
            <div className="mt-2 space-y-2">
              <div><label className="flex items-center"><input type="checkbox" name="consultation_route_government" checked={formData.consultation_route_government} onChange={handleChange} className="mr-2" /><span className="text-gray-800 mr-2">行政機関</span>{formData.consultation_route_government && (<input type="text" name="consultation_route_government_other" value={formData.consultation_route_government_other} onChange={handleChange} placeholder="詳細を入力" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-gray-700" />)}</label></div>
              <div><label className="flex items-center"><input type="checkbox" name="consultation_route_other" checked={formData.consultation_route_other} onChange={handleChange} className="mr-2" /><span className="text-gray-800 mr-2">その他</span>{formData.consultation_route_other && (<input type="text" name="consultation_route_other_text" value={formData.consultation_route_other_text} onChange={handleChange} placeholder="詳細を入力" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-gray-700" />)}</label></div>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">属性</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <label className="flex items-center"><input type="checkbox" name="attribute_elderly" checked={formData.attribute_elderly} onChange={handleChange} className="mr-2" /><span className="text-gray-800">高齢</span></label>
              <div>
                <label className="flex items-center"><input type="checkbox" name="attribute_disability" checked={formData.attribute_disability} onChange={handleChange} className="mr-2" /><span className="text-gray-800">障がい</span></label>
                {formData.attribute_disability && (
                  <div className="ml-6 mt-1 space-y-1">
                    <label className="flex items-center text-sm"><input type="checkbox" name="attribute_disability_mental" checked={formData.attribute_disability_mental} onChange={handleChange} className="mr-1" /><span className="text-gray-800">精神</span></label>
                    <label className="flex items-center text-sm"><input type="checkbox" name="attribute_disability_physical" checked={formData.attribute_disability_physical} onChange={handleChange} className="mr-1" /><span className="text-gray-800">身体</span></label>
                    <label className="flex items-center text-sm"><input type="checkbox" name="attribute_disability_intellectual" checked={formData.attribute_disability_intellectual} onChange={handleChange} className="mr-1" /><span className="text-gray-800">知的</span></label>
                  </div>
                )}
              </div>
              <label className="flex items-center"><input type="checkbox" name="attribute_childcare" checked={formData.attribute_childcare} onChange={handleChange} className="mr-2" /><span className="text-gray-800">子育て</span></label>
              <label className="flex items-center"><input type="checkbox" name="attribute_single_parent" checked={formData.attribute_single_parent} onChange={handleChange} className="mr-2" /><span className="text-gray-800">ひとり親</span></label>
              <label className="flex items-center"><input type="checkbox" name="attribute_dv" checked={formData.attribute_dv} onChange={handleChange} className="mr-2" /><span className="text-gray-800">DV</span></label>
              <label className="flex items-center"><input type="checkbox" name="attribute_foreigner" checked={formData.attribute_foreigner} onChange={handleChange} className="mr-2" /><span className="text-gray-800">外国人</span></label>
              <label className="flex items-center"><input type="checkbox" name="attribute_poverty" checked={formData.attribute_poverty} onChange={handleChange} className="mr-2" /><span className="text-gray-800">生活困窮</span></label>
              <label className="flex items-center"><input type="checkbox" name="attribute_low_income" checked={formData.attribute_low_income} onChange={handleChange} className="mr-2" /><span className="text-gray-800">低所得者</span></label>
              <label className="flex items-center"><input type="checkbox" name="attribute_lgbt" checked={formData.attribute_lgbt} onChange={handleChange} className="mr-2" /><span className="text-gray-800">LGBT</span></label>
              <label className="flex items-center"><input type="checkbox" name="attribute_welfare" checked={formData.attribute_welfare} onChange={handleChange} className="mr-2" /><span className="text-gray-800">生保</span></label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">お名前</label><div className="flex items-center"><input type="text" name="name" value={formData.name} onChange={handleChange} className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white" placeholder="匿名の場合は空欄" /><span className="ml-2 text-gray-600">様</span></div></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">フリガナ</label><input type="text" name="furigana" value={formData.furigana} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white" /></div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
              <div className="flex space-x-4">
                <label className="flex items-center"><input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} className="mr-1" /><span className="text-gray-800">男</span></label>
                <label className="flex items-center"><input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} className="mr-1" /><span className="text-gray-800">女</span></label>
                <label className="flex items-center"><input type="radio" name="gender" value="other" checked={formData.gender === 'other'} onChange={handleChange} className="mr-1" /><span className="text-gray-800">その他</span></label>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">世帯構成</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <label className="flex items-center"><input type="checkbox" name="household_single" checked={formData.household_single} onChange={handleChange} className="mr-2" /><span className="text-gray-800">独居</span></label>
              <label className="flex items-center"><input type="checkbox" name="household_couple" checked={formData.household_couple} onChange={handleChange} className="mr-2" /><span className="text-gray-800">夫婦</span></label>
              <label className="flex items-center"><input type="checkbox" name="household_common_law" checked={formData.household_common_law} onChange={handleChange} className="mr-2" /><span className="text-gray-800">内縁夫婦</span></label>
              <label className="flex items-center"><input type="checkbox" name="household_parent_child" checked={formData.household_parent_child} onChange={handleChange} className="mr-2" /><span className="text-gray-800">親子</span></label>
              <label className="flex items-center"><input type="checkbox" name="household_siblings" checked={formData.household_siblings} onChange={handleChange} className="mr-2" /><span className="text-gray-800">兄弟姉妹</span></label>
              <label className="flex items-center"><input type="checkbox" name="household_acquaintance" checked={formData.household_acquaintance} onChange={handleChange} className="mr-2" /><span className="text-gray-800">知人</span></label>
              <div><label className="flex items-center"><input type="checkbox" name="household_other" checked={formData.household_other} onChange={handleChange} className="mr-2" /><span className="text-gray-800">その他</span></label>{formData.household_other && (<input type="text" name="household_other_text" value={formData.household_other_text} onChange={handleChange} placeholder="詳細を入力" className="mt-1 w-full px-2 py-1 border border-gray-300 rounded text-sm" />)}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">郵便番号</label><input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800" placeholder="123-4567" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">都道府県・市区町村・番地等</label><input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">自宅電話番号</label><input type="tel" name="phone_home" value={formData.phone_home} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">携帯電話番号</label><input type="tel" name="phone_mobile" value={formData.phone_mobile} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800" /></div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">生年月日</label>
            <div className="flex space-x-2 items-center">
              <select name="birth_year" value={formData.birth_year} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-md text-gray-800"><option value="">年</option>{years.map(year => (<option key={year} value={year}>{year}</option>))}</select><span className="text-gray-700">年</span>
              <select name="birth_month" value={formData.birth_month} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-md text-gray-800"><option value="">月</option>{months.map(month => (<option key={month} value={month}>{month}</option>))}</select><span className="text-gray-700">月</span>
              <select name="birth_day" value={formData.birth_day} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-md text-gray-800"><option value="">日</option>{days.map(day => (<option key={day} value={day}>{day}</option>))}</select><span className="text-gray-700">日</span>
              {calculateAge() !== null && (<span className="text-gray-600">（満{calculateAge()}歳）</span>)}
            </div>
          </div>
        </div>

        {/* 2. 身体状況・利用サービス */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">2. 身体状況・利用サービス</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">身体状況</label>
              <div className="space-y-1">
                {[{ value: 'independent', label: '自立' }, { value: 'support1', label: '要支援１' }, { value: 'support2', label: '要支援２' }, { value: 'care1', label: '要介護１' }, { value: 'care2', label: '要介護２' }, { value: 'care3', label: '要介護３' }, { value: 'care4', label: '要介護４' }, { value: 'care5', label: '要介護５' }].map(option => (<label key={option.value} className="flex items-center"><input type="radio" name="physical_condition" value={option.value} checked={formData.physical_condition === option.value} onChange={handleChange} className="mr-2" /><span className="text-gray-700">{option.label}</span></label>))}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">手帳</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2"><input type="checkbox" name="mental_disability_certificate" checked={formData.mental_disability_certificate} onChange={handleChange} className="mr-2" /><span className="text-gray-700">精神障害者保健福祉手帳</span>{formData.mental_disability_certificate && (<input type="text" name="mental_disability_level" value={formData.mental_disability_level} onChange={handleChange} placeholder="等級" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-gray-700" />)}</div>
              <div className="flex items-center space-x-2"><input type="checkbox" name="physical_disability_certificate" checked={formData.physical_disability_certificate} onChange={handleChange} className="mr-2" /><span className="text-gray-700">身体障害者手帳</span>{formData.physical_disability_certificate && (<input type="text" name="physical_disability_level" value={formData.physical_disability_level} onChange={handleChange} placeholder="等級" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-gray-700" />)}</div>
              <div className="flex items-center space-x-2"><input type="checkbox" name="therapy_certificate" checked={formData.therapy_certificate} onChange={handleChange} className="mr-2" /><span className="text-gray-700">療育手帳</span>{formData.therapy_certificate && (<input type="text" name="therapy_level" value={formData.therapy_level} onChange={handleChange} placeholder="区分" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-gray-700" />)}</div>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">利用中の支援サービス</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <label className="flex items-center"><input type="checkbox" name="service_day_service" checked={formData.service_day_service} onChange={handleChange} className="mr-2" /><span className="text-gray-700">デイサービス</span></label>
              <label className="flex items-center"><input type="checkbox" name="service_visiting_nurse" checked={formData.service_visiting_nurse} onChange={handleChange} className="mr-2" /><span className="text-gray-700">訪問看護</span></label>
              <label className="flex items-center"><input type="checkbox" name="service_visiting_care" checked={formData.service_visiting_care} onChange={handleChange} className="mr-2" /><span className="text-gray-700">訪問介護</span></label>
              <label className="flex items-center"><input type="checkbox" name="service_home_medical" checked={formData.service_home_medical} onChange={handleChange} className="mr-2" /><span className="text-gray-800">在宅診療</span></label>
              <label className="flex items-center"><input type="checkbox" name="service_short_stay" checked={formData.service_short_stay} onChange={handleChange} className="mr-2" /><span className="text-gray-800">短期入所施設</span></label>
              <div>
                <label className="flex items-center"><input type="checkbox" name="service_other" checked={formData.service_other} onChange={handleChange} className="mr-2" /><span className="text-gray-800">その他</span></label>
                {formData.service_other && (<input type="text" name="service_other_text" value={formData.service_other_text} onChange={handleChange} placeholder="詳細" className="mt-1 w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-700" />)}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">サービス提供事業所</label><input type="text" name="service_provider" value={formData.service_provider} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">居宅介護支援事業所</label><input type="text" name="care_support_office" value={formData.care_support_office} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">担当</label><input type="text" name="care_manager" value={formData.care_manager} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
          </div>
          <div className="mt-4"><label className="block text-sm font-medium text-gray-700 mb-1">既往症及び病歴</label><textarea name="medical_history" value={formData.medical_history} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
        </div>

        {/* 3. 医療・収入 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">3. 医療・収入</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">かかりつけ医療機関 - 名称</label><input type="text" name="medical_institution_name" value={formData.medical_institution_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">かかりつけ医療機関 - 担当</label><input type="text" name="medical_institution_staff" value={formData.medical_institution_staff} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">収入</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="block text-sm text-gray-600 mb-1">給与</label><input type="number" name="income_salary" value={formData.income_salary} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" placeholder="円" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">傷病手当</label><input type="number" name="income_injury_allowance" value={formData.income_injury_allowance} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" placeholder="円" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">年金振込額</label><input type="number" name="income_pension" value={formData.income_pension} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" placeholder="円" /></div>
            </div>
            <div className="mt-2 flex items-center space-x-4">
              <label className="flex items-center"><input type="checkbox" name="welfare_recipient" checked={formData.welfare_recipient} onChange={handleChange} className="mr-2" /><span className="text-gray-700">生活保護受給</span></label>
              {formData.welfare_recipient && (<input type="text" name="welfare_staff" value={formData.welfare_staff} onChange={handleChange} placeholder="生保担当者" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-gray-700" />)}
            </div>
            <div className="mt-2"><label className="block text-sm text-gray-600 mb-1">預金</label><input type="number" name="savings" value={formData.savings} onChange={handleChange} className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md text-gray-700" placeholder="円" /></div>
          </div>
        </div>

        {/* 3.5. 他市区町村への転居 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">4. 他市区町村への転居</h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">現在の住所以外の市区町村への転居を希望されていますか？</label>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <label className="flex items-center">
                <input type="radio" name="is_relocation_to_other_city_desired" value="yes" checked={formData.is_relocation_to_other_city_desired === 'yes'} onChange={(e) => handleRadioChange('is_relocation_to_other_city_desired', e.target.value)} className="mr-1" />
                <span className="text-gray-700">はい</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="is_relocation_to_other_city_desired" value="no" checked={formData.is_relocation_to_other_city_desired === 'no'} onChange={(e) => handleRadioChange('is_relocation_to_other_city_desired', e.target.value)} className="mr-1" />
                <span className="text-gray-700">いいえ</span>
              </label>
            </div>
          </div>

          {formData.is_relocation_to_other_city_desired === 'yes' && (
            <div className="mt-6 border-t pt-6 space-y-6">

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">引越しの実現可能性について、行政からの見解</label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <label className="flex items-center">
                    <input type="radio" name="relocation_admin_opinion" value="possible" checked={formData.relocation_admin_opinion === 'possible'} onChange={(e) => handleRadioChange('relocation_admin_opinion', e.target.value)} className="mr-1" />
                    <span className="text-gray-700">可</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="relocation_admin_opinion" value="impossible" checked={formData.relocation_admin_opinion === 'impossible'} onChange={(e) => handleRadioChange('relocation_admin_opinion', e.target.value)} className="mr-1" />
                    <span className="text-gray-700">否</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="relocation_admin_opinion" value="pending" checked={formData.relocation_admin_opinion === 'pending'} onChange={(e) => handleRadioChange('relocation_admin_opinion', e.target.value)} className="mr-1" />
                    <span className="text-gray-700">確認中</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="relocation_admin_opinion" value="other" checked={formData.relocation_admin_opinion === 'other'} onChange={(e) => handleRadioChange('relocation_admin_opinion', e.target.value)} className="mr-1" />
                    <span className="text-gray-700">その他</span>
                  </label>
                </div>
                {formData.relocation_admin_opinion === 'other' && (
                  <textarea name="relocation_admin_opinion_details" value={formData.relocation_admin_opinion_details} onChange={handleChange} rows={3} className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm" placeholder="その他の詳細" />
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">転居に伴う費用負担</label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <label className="flex items-center">
                    <input type="radio" name="relocation_cost_bearer" value="previous_city" checked={formData.relocation_cost_bearer === 'previous_city'} onChange={(e) => handleRadioChange('relocation_cost_bearer', e.target.value)} className="mr-1" />
                    <span className="text-gray-700">転居前の市区町村が負担</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="relocation_cost_bearer" value="next_city" checked={formData.relocation_cost_bearer === 'next_city'} onChange={(e) => handleRadioChange('relocation_cost_bearer', e.target.value)} className="mr-1" />
                    <span className="text-gray-700">転居先の市区町村が負担</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="relocation_cost_bearer" value="self" checked={formData.relocation_cost_bearer === 'self'} onChange={(e) => handleRadioChange('relocation_cost_bearer', e.target.value)} className="mr-1" />
                    <span className="text-gray-700">利用者本人の負担</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="relocation_cost_bearer" value="pending" checked={formData.relocation_cost_bearer === 'pending'} onChange={(e) => handleRadioChange('relocation_cost_bearer', e.target.value)} className="mr-1" />
                    <span className="text-gray-700">確認中</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="relocation_cost_bearer" value="other" checked={formData.relocation_cost_bearer === 'other'} onChange={(e) => handleRadioChange('relocation_cost_bearer', e.target.value)} className="mr-1" />
                    <span className="text-gray-700">その他</span>
                  </label>
                </div>
                {formData.relocation_cost_bearer === 'other' && (
                 <textarea name="relocation_cost_bearer_details" value={formData.relocation_cost_bearer_details} onChange={handleChange} rows={3} className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm" placeholder="その他の詳細" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">その他の特記事項、今後の課題など</label>
                <textarea name="relocation_notes" value={formData.relocation_notes} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" placeholder="例：〇〇市△△課の□□様へ確認。生活保護の移管手続きについて、来週再度連絡予定。" />
              </div>

            </div>
          )}
        </div>


        {/* 4. ADL/IADL (★★ 修正 ★★) */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">5. ADL/IADL</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">認知症</label><input type="text" name="dementia" value={formData.dementia} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">病院名</label><input type="text" name="dementia_hospital" value={formData.dementia_hospital} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">通院支援</label>
              <div className="flex space-x-4">
                <label className="flex items-center"><input type="radio" name="hospital_support_required" checked={formData.hospital_support_required === true} onChange={() => setFormData(prev => ({ ...prev, hospital_support_required: true }))} className="mr-1" /><span className="text-gray-700">要</span></label>
                <label className="flex items-center"><input type="radio" name="hospital_support_required" checked={formData.hospital_support_required === false} onChange={() => setFormData(prev => ({ ...prev, hospital_support_required: false }))} className="mr-1" /><span className="text-gray-700">不要</span></label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">内服管理の必要性</label>
              <div className="flex space-x-4">
                <label className="flex items-center"><input type="radio" name="medication_management_needed" checked={formData.medication_management_needed === true} onChange={() => setFormData(prev => ({ ...prev, medication_management_needed: true }))} className="mr-1" /><span className="text-gray-700">有</span></label>
                <label className="flex items-center"><input type="radio" name="medication_management_needed" checked={formData.medication_management_needed === false} onChange={() => setFormData(prev => ({ ...prev, medication_management_needed: false }))} className="mr-1" /><span className="text-gray-700">無</span></label>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t pt-6 space-y-4">
            {/* 移動 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">移動</label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex items-center"><input type="radio" name="mobility_status" value="independent" checked={formData.mobility_status === 'independent'} onChange={(e) => handleRadioChange('mobility_status', e.target.value)} className="mr-1" /><span className="text-gray-700">自立</span></label>
                <label className="flex items-center"><input type="radio" name="mobility_status" value="partial_assist" checked={formData.mobility_status === 'partial_assist'} onChange={(e) => handleRadioChange('mobility_status', e.target.value)} className="mr-1" /><span className="text-gray-700">一部介助</span></label>
                <label className="flex items-center"><input type="radio" name="mobility_status" value="full_assist" checked={formData.mobility_status === 'full_assist'} onChange={(e) => handleRadioChange('mobility_status', e.target.value)} className="mr-1" /><span className="text-gray-700">全介助</span></label>
                <label className="flex items-center"><input type="radio" name="mobility_status" value="other" checked={formData.mobility_status === 'other'} onChange={(e) => handleRadioChange('mobility_status', e.target.value)} className="mr-1" /><span className="text-gray-700">その他</span></label>
              </div>
              {formData.mobility_status === 'other' && (
                <input type="text" name="mobility_other_text" value={formData.mobility_other_text} onChange={handleChange} placeholder="その他の詳細" className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm" />
              )}
            </div>

            {/* 移動補助具・福祉用具 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">移動補助具・福祉用具</label>
              <input type="text" name="mobility_aids" value={formData.mobility_aids} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" />
            </div>

            {/* 食事 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">食事</label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex items-center"><input type="radio" name="eating_status" value="independent" checked={formData.eating_status === 'independent'} onChange={(e) => handleRadioChange('eating_status', e.target.value)} className="mr-1" /><span className="text-gray-700">自立</span></label>
                <label className="flex items-center"><input type="radio" name="eating_status" value="partial_assist" checked={formData.eating_status === 'partial_assist'} onChange={(e) => handleRadioChange('eating_status', e.target.value)} className="mr-1" /><span className="text-gray-700">一部介助</span></label>
                <label className="flex items-center"><input type="radio" name="eating_status" value="full_assist" checked={formData.eating_status === 'full_assist'} onChange={(e) => handleRadioChange('eating_status', e.target.value)} className="mr-1" /><span className="text-gray-700">全介助</span></label>
                <label className="flex items-center"><input type="radio" name="eating_status" value="other" checked={formData.eating_status === 'other'} onChange={(e) => handleRadioChange('eating_status', e.target.value)} className="mr-1" /><span className="text-gray-700">その他</span></label>
              </div>
              {formData.eating_status === 'other' && (
                <input type="text" name="eating_other_text" value={formData.eating_other_text} onChange={handleChange} placeholder="その他の詳細" className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm" />
              )}
            </div>

            {/* 買物 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">買物</label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex items-center"><input type="radio" name="shopping_status" value="possible" checked={formData.shopping_status === 'possible'} onChange={(e) => handleRadioChange('shopping_status', e.target.value)} className="mr-1" /><span className="text-gray-700">可</span></label>
                <label className="flex items-center"><input type="radio" name="shopping_status" value="support_needed" checked={formData.shopping_status === 'support_needed'} onChange={(e) => handleRadioChange('shopping_status', e.target.value)} className="mr-1" /><span className="text-gray-700">支援必要</span></label>
              </div>
              {formData.shopping_status === 'support_needed' && (
                <input type="text" name="shopping_support_text" value={formData.shopping_support_text} onChange={handleChange} placeholder="支援内容の詳細" className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm" />
              )}
            </div>

            {/* ゴミ出し */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ゴミ出し</label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex items-center"><input type="radio" name="garbage_disposal_status" value="independent" checked={formData.garbage_disposal_status === 'independent'} onChange={(e) => handleRadioChange('garbage_disposal_status', e.target.value)} className="mr-1" /><span className="text-gray-700">自立</span></label>
                <label className="flex items-center"><input type="radio" name="garbage_disposal_status" value="support_needed" checked={formData.garbage_disposal_status === 'support_needed'} onChange={(e) => handleRadioChange('garbage_disposal_status', e.target.value)} className="mr-1" /><span className="text-gray-700">支援必要</span></label>
              </div>
              {formData.garbage_disposal_status === 'support_needed' && (
                <input type="text" name="garbage_disposal_support_text" value={formData.garbage_disposal_support_text} onChange={handleChange} placeholder="支援内容の詳細" className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm" />
              )}
            </div>

            {/* 排泄 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">排泄</label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex items-center"><input type="radio" name="excretion_status" value="independent" checked={formData.excretion_status === 'independent'} onChange={(e) => handleRadioChange('excretion_status', e.target.value)} className="mr-1" /><span className="text-gray-700">自立</span></label>
                <label className="flex items-center"><input type="radio" name="excretion_status" value="partial_assist" checked={formData.excretion_status === 'partial_assist'} onChange={(e) => handleRadioChange('excretion_status', e.target.value)} className="mr-1" /><span className="text-gray-700">一部介助</span></label>
                <label className="flex items-center"><input type="radio" name="excretion_status" value="full_assist" checked={formData.excretion_status === 'full_assist'} onChange={(e) => handleRadioChange('excretion_status', e.target.value)} className="mr-1" /><span className="text-gray-700">全介助</span></label>
                <label className="flex items-center"><input type="radio" name="excretion_status" value="other" checked={formData.excretion_status === 'other'} onChange={(e) => handleRadioChange('excretion_status', e.target.value)} className="mr-1" /><span className="text-gray-700">その他</span></label>
              </div>
              {formData.excretion_status === 'other' && (
                <input type="text" name="excretion_other_text" value={formData.excretion_other_text} onChange={handleChange} placeholder="その他の詳細" className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm" />
              )}
            </div>

            {/* 2階への移動 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">2階への移動</label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex items-center"><input type="radio" name="second_floor_possible" value="possible" checked={formData.second_floor_possible === 'possible'} onChange={(e) => handleRadioChange('second_floor_possible', e.target.value)} className="mr-1" /><span className="text-gray-700">可</span></label>
                <label className="flex items-center"><input type="radio" name="second_floor_possible" value="impossible" checked={formData.second_floor_possible === 'impossible'} onChange={(e) => handleRadioChange('second_floor_possible', e.target.value)} className="mr-1" /><span className="text-gray-700">不可</span></label>
              </div>
            </div>

            {/* 入浴 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">入浴</label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex items-center"><input type="radio" name="bathing_status" value="independent" checked={formData.bathing_status === 'independent'} onChange={(e) => handleRadioChange('bathing_status', e.target.value)} className="mr-1" /><span className="text-gray-700">自立</span></label>
                <label className="flex items-center"><input type="radio" name="bathing_status" value="partial_assist" checked={formData.bathing_status === 'partial_assist'} onChange={(e) => handleRadioChange('bathing_status', e.target.value)} className="mr-1" /><span className="text-gray-700">一部介助</span></label>
                <label className="flex items-center"><input type="radio" name="bathing_status" value="full_assist" checked={formData.bathing_status === 'full_assist'} onChange={(e) => handleRadioChange('bathing_status', e.target.value)} className="mr-1" /><span className="text-gray-700">全介助</span></label>
                <label className="flex items-center"><input type="radio" name="bathing_status" value="other" checked={formData.bathing_status === 'other'} onChange={(e) => handleRadioChange('bathing_status', e.target.value)} className="mr-1" /><span className="text-gray-700">その他</span></label>
              </div>
              {formData.bathing_status === 'other' && (
                <input type="text" name="bathing_other_text" value={formData.bathing_other_text} onChange={handleChange} placeholder="その他の詳細" className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm" />
              )}
            </div>

            {/* 金銭管理支援者 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">金銭管理支援者</label>
              <input type="text" name="money_management_supporter" value={formData.money_management_supporter} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" />
            </div>

            {/* 代理納付サービスの利用 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">代理納付サービスの利用</label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex items-center"><input type="radio" name="uses_proxy_payment_service" value="yes" checked={formData.uses_proxy_payment_service === 'yes'} onChange={(e) => handleRadioChange('uses_proxy_payment_service', e.target.value)} className="mr-1" /><span className="text-gray-700">有</span></label>
                <label className="flex items-center"><input type="radio" name="uses_proxy_payment_service" value="no" checked={formData.uses_proxy_payment_service === 'no'} onChange={(e) => handleRadioChange('uses_proxy_payment_service', e.target.value)} className="mr-1" /><span className="text-gray-700">無</span></label>
              </div>
            </div>

            {/* 家賃納入方法 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">家賃納入方法</label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex items-center"><input type="radio" name="rent_payment_method" value="transfer" checked={formData.rent_payment_method === 'transfer'} onChange={(e) => handleRadioChange('rent_payment_method', e.target.value)} className="mr-1" /><span className="text-gray-700">振込</span></label>
                <label className="flex items-center"><input type="radio" name="rent_payment_method" value="collection" checked={formData.rent_payment_method === 'collection'} onChange={(e) => handleRadioChange('rent_payment_method', e.target.value)} className="mr-1" /><span className="text-gray-700">集金</span></label>
                <label className="flex items-center"><input type="radio" name="rent_payment_method" value="automatic" checked={formData.rent_payment_method === 'automatic'} onChange={(e) => handleRadioChange('rent_payment_method', e.target.value)} className="mr-1" /><span className="text-gray-700">口座振替</span></label>
              </div>
            </div>
          </div>

          <div className="mt-4"><label className="block text-sm font-medium text-gray-700 mb-1">その他特記事項</label><textarea name="other_notes" value={formData.other_notes} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" placeholder="例：聴力、視力、喫煙" /></div>
        </div>

        {/* 4.5. 現在の住まい */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">6. 現在の住まい</h2>
          <div className="space-y-6">

            {/* 家賃滞納 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">家賃滞納</label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex items-center">
                  <input type="radio" name="rent_arrears_status" value="yes" checked={formData.rent_arrears_status === 'yes'} onChange={(e) => handleRadioChange('rent_arrears_status', e.target.value)} className="mr-1" />
                  <span className="text-gray-700">有</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="rent_arrears_status" value="no" checked={formData.rent_arrears_status === 'no'} onChange={(e) => handleRadioChange('rent_arrears_status', e.target.value)} className="mr-1" />
                  <span className="text-gray-700">無</span>
                </label>
              </div>
              {formData.rent_arrears_status === 'yes' && (
                <div className="mt-4 pl-6 border-l-2 border-gray-200 space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">滞納期間</label>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      <label className="flex items-center">
                        <input type="radio" name="rent_arrears_duration" value="1_month" checked={formData.rent_arrears_duration === '1_month'} onChange={(e) => handleRadioChange('rent_arrears_duration', e.target.value)} className="mr-1" />
                        <span className="text-gray-700">1ヶ月</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="rent_arrears_duration" value="2_to_3_months" checked={formData.rent_arrears_duration === '2_to_3_months'} onChange={(e) => handleRadioChange('rent_arrears_duration', e.target.value)} className="mr-1" />
                        <span className="text-gray-700">2〜3ヶ月</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="rent_arrears_duration" value="half_year_or_more" checked={formData.rent_arrears_duration === 'half_year_or_more'} onChange={(e) => handleRadioChange('rent_arrears_duration', e.target.value)} className="mr-1" />
                        <span className="text-gray-700">半年以上</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="rent_arrears_duration" value="other" checked={formData.rent_arrears_duration === 'other'} onChange={(e) => handleRadioChange('rent_arrears_duration', e.target.value)} className="mr-1" />
                        <span className="text-gray-700">その他</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">滞納の理由や状況</label>
                    <textarea name="rent_arrears_details" value={formData.rent_arrears_details} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" />
                  </div>
                </div>
              )}
            </div>

            {/* ペット */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">ペット</label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex items-center">
                  <input type="radio" name="pet_status" value="yes" checked={formData.pet_status === 'yes'} onChange={(e) => handleRadioChange('pet_status', e.target.value)} className="mr-1" />
                  <span className="text-gray-700">有</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="pet_status" value="no" checked={formData.pet_status === 'no'} onChange={(e) => handleRadioChange('pet_status', e.target.value)} className="mr-1" />
                  <span className="text-gray-700">無</span>
                </label>
              </div>
              {formData.pet_status === 'yes' && (
                <div className="mt-2">
                  <input type="text" name="pet_details" value={formData.pet_details} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm" placeholder="例：小型犬（チワワ）1匹、猫2匹" />
                </div>
              )}
            </div>

            {/* 車両 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">車両</label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex items-center">
                  <input type="checkbox" name="vehicle_car" checked={formData.vehicle_car} onChange={handleChange} className="mr-2" />
                  <span className="text-gray-700">車</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" name="vehicle_motorcycle" checked={formData.vehicle_motorcycle} onChange={handleChange} className="mr-2" />
                  <span className="text-gray-700">バイク</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" name="vehicle_bicycle" checked={formData.vehicle_bicycle} onChange={handleChange} className="mr-2" />
                  <span className="text-gray-700">自転車</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" name="vehicle_none" checked={formData.vehicle_none} onChange={handleChange} className="mr-2" />
                  <span className="text-gray-700">なし</span>
                </label>
              </div>
            </div>

            {/* 間取り・家賃 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">現在の間取り</label>
                <input type="text" name="current_floor_plan" value={formData.current_floor_plan} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">現在の家賃</label>
                <input type="number" name="current_rent" value={formData.current_rent} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" placeholder="円" />
              </div>
            </div>

            {/* 退去期限 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">退去期限</label>
              <input type="date" name="eviction_date" value={formData.eviction_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white" />
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">補足</label>
                <input type="text" name="eviction_date_notes" value={formData.eviction_date_notes} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm" />
              </div>
            </div>

          </div>
        </div>
        {/* ▲▲▲ 追加 ▲▲▲ ここまで */}

        {/* 5. 相談内容等 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">7. 相談内容等</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">相談内容（困りごと、何が大変でどうしたいか、等）</label><textarea name="consultation_content" value={formData.consultation_content} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">転居理由</label><textarea name="relocation_reason" value={formData.relocation_reason} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
          </div>
          <div className="mt-4">
            <h3 className="text-md font-medium text-gray-800 mb-2">緊急連絡先</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">氏名</label><input type="text" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">当事者との関係</label><input type="text" name="emergency_contact_relationship" value={formData.emergency_contact_relationship} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">郵便番号</label><input type="text" name="emergency_contact_postal_code" value={formData.emergency_contact_postal_code} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">住所</label><input type="text" name="emergency_contact_address" value={formData.emergency_contact_address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">自宅電話</label><input type="tel" name="emergency_contact_phone_home" value={formData.emergency_contact_phone_home} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">携帯電話</label><input type="tel" name="emergency_contact_phone_mobile" value={formData.emergency_contact_phone_mobile} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Mail</label><input type="email" name="emergency_contact_email" value={formData.emergency_contact_email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
            </div>
          </div>
          <div className="mt-4"><label className="block text-sm font-medium text-gray-700 mb-1">相談結果</label><textarea name="consultation_result" value={formData.consultation_result} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">次回予定</label>
            <div className="space-y-2">
              <div className="flex space-x-4">
                <label className="flex items-center"><input type="radio" name="next_appointment_scheduled" checked={formData.next_appointment_scheduled === true} onChange={() => setFormData(prev => ({ ...prev, next_appointment_scheduled: true }))} className="mr-1" /><span className="text-gray-700">あり</span></label>
                <label className="flex items-center"><input type="radio" name="next_appointment_scheduled" checked={formData.next_appointment_scheduled === false} onChange={() => setFormData(prev => ({ ...prev, next_appointment_scheduled: false }))} className="mr-1" /><span className="text-gray-700">なし</span></label>
              </div>
              {formData.next_appointment_scheduled && (<textarea
                name="next_appointment_details"
                value={formData.next_appointment_details}
                onChange={handleChange}
                placeholder="次回予定の詳細"
                rows={4} // 高さを4行分に設定
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
              />)}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => router.back()} className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">キャンセル</button>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
            {loading ? (editMode ? '更新中...' : '保存中...') : (editMode ? '更新' : '保存')}
          </button>
        </div>
      </form>
    )
  }

  export default ConsultationForm