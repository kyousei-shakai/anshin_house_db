//src/components/ConsultationForm/index.tsx
'use client'

import React, { useState, useEffect, forwardRef } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database'
import { createConsultation, updateConsultation } from '@/app/actions/consultations'
import { getStaffForSelection } from '@/app/actions/staff'
import { ConsultationFormData } from './types'
import Section1_BasicInfo from './Section1_BasicInfo'
import Section2_PhysicalStatus from './Section2_PhysicalStatus'
import Section3_MedicalIncome from './Section3_MedicalIncome'
import Section4_Relocation from './Section4_Relocation'
import Section5_ADL from './Section5_ADL'
import Section6_CurrentHouse from './Section6_CurrentHouse'
import Section7_ConsultationContent from './Section7_ConsultationContent'

// 型エイリアス
type Consultation = Database['public']['Tables']['consultations']['Row']
type ConsultationInsert = Database['public']['Tables']['consultations']['Insert']
type ConsultationUpdate = Database['public']['Tables']['consultations']['Update']
type Staff = { id: string; name: string | null }

// propsの型定義
interface ConsultationFormProps {
  editMode?: boolean
  initialData?: Consultation
}

const ConsultationForm = forwardRef<HTMLFormElement, ConsultationFormProps>(
  ({ editMode = false, initialData }, ref) => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [staffList, setStaffList] = useState<Staff[]>([])

    useEffect(() => {
      const fetchStaff = async () => {
        const result = await getStaffForSelection();

        if (result.success && result.data) {
          if (result.data.length === 0) {
            setError('担当者が登録されていません。');
          } else {
            setStaffList(result.data);
          }
        } else {
          console.error('Failed to fetch staff list:', result.error);
          setError('担当者リストの読み込み中にエラーが発生しました。');
        }
      };
      fetchStaff();
    }, []);

    const initializeFormData = (data: Consultation | undefined): ConsultationFormData => {
      if (!data) {
        return {
          consultation_date: new Date().toISOString().split('T')[0],
          staff_id: '',
          consultation_route_self: false,
          consultation_route_family: false,
          consultation_route_family_text: '', // ★ 変更点
          consultation_route_care_manager: false,
          consultation_route_care_manager_text: '', // ★ 変更点
          consultation_route_elderly_center: false,
          consultation_route_elderly_center_text: '', // ★ 変更点
          consultation_route_disability_center: false,
          consultation_route_disability_center_text: '', // ★ 変更点
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
          consultation_result: ''
        };
      }
      
      const getStatus = (independent: boolean | null, partial: boolean | null, full: boolean | null, other: boolean | null) => {
        if (independent) return 'independent';
        if (partial) return 'partial_assist';
        if (full) return 'full_assist';
        if (other) return 'other';
        return '';
      };
      
      return {
        consultation_date: data.consultation_date ? data.consultation_date.split('T')[0] : '',
        staff_id: data.staff_id || '',
        consultation_route_self: data.consultation_route_self || false,
        consultation_route_family: data.consultation_route_family || false,
        consultation_route_family_text: data.consultation_route_family_text || '', // ★ 変更点
        consultation_route_care_manager: data.consultation_route_care_manager || false,
        consultation_route_care_manager_text: data.consultation_route_care_manager_text || '', // ★ 変更点
        consultation_route_elderly_center: data.consultation_route_elderly_center || false,
        consultation_route_elderly_center_text: data.consultation_route_elderly_center_text || '', // ★ 変更点
        consultation_route_disability_center: data.consultation_route_disability_center || false,
        consultation_route_disability_center_text: data.consultation_route_disability_center_text || '', // ★ 変更点
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
        is_relocation_to_other_city_desired: data.is_relocation_to_other_city_desired === true ? 'yes' : data.is_relocation_to_other_city_desired === false ? 'no' : '',
        relocation_admin_opinion: data.relocation_admin_opinion as ConsultationFormData['relocation_admin_opinion'] || '',
        relocation_admin_opinion_details: data.relocation_admin_opinion_details || '',
        relocation_cost_bearer: data.relocation_cost_bearer as ConsultationFormData['relocation_cost_bearer'] || '',
        relocation_cost_bearer_details: data.relocation_cost_bearer_details || '',
        relocation_notes: data.relocation_notes || '',
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
        consultation_result: data.consultation_result || ''
      };
    }

    const [formData, setFormData] = useState<ConsultationFormData>(() => initializeFormData(initialData));

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

        const dataToSubmit: Omit<ConsultationUpdate, 'staff_name'> & { staff_id?: string | null } = {
          consultation_date: formData.consultation_date,
          staff_id: formData.staff_id || null,
          consultation_route_self: formData.consultation_route_self,
          consultation_route_family: formData.consultation_route_family,
          consultation_route_family_text: formData.consultation_route_family_text || null, // ★ 変更点
          consultation_route_care_manager: formData.consultation_route_care_manager,
          consultation_route_care_manager_text: formData.consultation_route_care_manager_text || null, // ★ 変更点
          consultation_route_elderly_center: formData.consultation_route_elderly_center,
          consultation_route_elderly_center_text: formData.consultation_route_elderly_center_text || null, // ★ 変更点
          consultation_route_disability_center: formData.consultation_route_disability_center,
          consultation_route_disability_center_text: formData.consultation_route_disability_center_text || null, // ★ 変更点
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
          is_relocation_to_other_city_desired: formData.is_relocation_to_other_city_desired === 'yes' ? true : formData.is_relocation_to_other_city_desired === 'no' ? false : null,
          relocation_admin_opinion: formData.is_relocation_to_other_city_desired === 'yes' ? formData.relocation_admin_opinion || null : null,
          relocation_admin_opinion_details: formData.is_relocation_to_other_city_desired === 'yes' && formData.relocation_admin_opinion === 'other' ? formData.relocation_admin_opinion_details || null : null,
          relocation_cost_bearer: formData.is_relocation_to_other_city_desired === 'yes' ? formData.relocation_cost_bearer || null : null,
          relocation_cost_bearer_details: formData.is_relocation_to_other_city_desired === 'yes' && formData.relocation_cost_bearer === 'other' ? formData.relocation_cost_bearer_details || null : null,
          relocation_notes: formData.is_relocation_to_other_city_desired === 'yes' ? formData.relocation_notes || null : null,
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
          consultation_result: formData.consultation_result || null
        };
        if (editMode && initialData?.id) {
          const result = await updateConsultation(initialData.id, dataToSubmit as ConsultationUpdate);
          if (!result.success) {
            throw new Error(result.error || '更新に失敗しました。');
          }
          router.push(`/consultations/${initialData.id}`);
        } else {
          const result = await createConsultation(dataToSubmit as ConsultationInsert)
          if (!result.success) {
            throw new Error(result.error || '作成に失敗しました。')
          }
          router.push('/consultations');
        }
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
    
    return (
      <form onSubmit={handleSubmit} ref={ref} className="space-y-10">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-500 text-sm">{error}</div>
          </div>
        )}

        <Section1_BasicInfo
          formData={formData}
          staffList={staffList}
          handleChange={handleChange}
          calculateAge={calculateAge}
        />

        <Section2_PhysicalStatus
          formData={formData}
          handleChange={handleChange}
        />

        <Section3_MedicalIncome
          formData={formData}
          handleChange={handleChange}
        />

        <Section4_Relocation
          formData={formData}
          handleChange={handleChange}
          handleRadioChange={handleRadioChange}
        />

        <Section5_ADL
          formData={formData}
          handleChange={handleChange}
          handleRadioChange={handleRadioChange}
          setFormData={setFormData}
        />

        <Section6_CurrentHouse
          formData={formData}
          handleChange={handleChange}
          handleRadioChange={handleRadioChange}
        />

        <Section7_ConsultationContent
          formData={formData}
          handleChange={handleChange}
        />

        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => router.back()} className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">キャンセル</button>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
            {loading ? (editMode ? '更新中...' : '保存中...') : (editMode ? '更新' : '保存')}
          </button>
        </div>
      </form>
    )
  }
)

ConsultationForm.displayName = 'ConsultationForm';

export default ConsultationForm;