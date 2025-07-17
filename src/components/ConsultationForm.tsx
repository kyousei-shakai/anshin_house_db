// src/components/ConsultationForm.tsx

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
  mobility_independent: boolean
  mobility_partial_assist: boolean
  mobility_full_assist: boolean
  mobility_other: boolean
  mobility_other_text: string
  eating_independent: boolean
  eating_partial_assist: boolean
  eating_full_assist: boolean
  eating_other: boolean
  eating_other_text: string
  shopping_possible: boolean
  shopping_support_needed: boolean
  shopping_support_text: string
  cooking_possible: boolean
  cooking_support_needed: boolean
  cooking_support_text: string
  excretion_independent: boolean
  excretion_partial_assist: boolean
  excretion_full_assist: boolean
  excretion_other: boolean
  excretion_other_text: string
  diaper_usage: boolean
  garbage_disposal_independent: boolean
  garbage_disposal_support_needed: boolean
  garbage_disposal_support_text: string
  stairs_independent: boolean
  stairs_partial_assist: boolean
  stairs_full_assist: boolean
  stairs_other: boolean
  stairs_other_text: string
  second_floor_possible: boolean
  bed_or_futon: 'bed' | 'futon' | ''
  bathing_independent: boolean
  bathing_partial_assist: boolean
  bathing_full_assist: boolean
  bathing_other: boolean
  bathing_other_text: string
  unit_bath_possible: boolean
  money_management: string
  supporter_available: boolean
  supporter_text: string
  proxy_payment: boolean
  rent_payment_method: 'transfer' | 'collection' | 'automatic' | ''
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
    mobility_independent: false,
    mobility_partial_assist: false,
    mobility_full_assist: false,
    mobility_other: false,
    mobility_other_text: '',
    eating_independent: false,
    eating_partial_assist: false,
    eating_full_assist: false,
    eating_other: false,
    eating_other_text: '',
    shopping_possible: false,
    shopping_support_needed: false,
    shopping_support_text: '',
    cooking_possible: false,
    cooking_support_needed: false,
    cooking_support_text: '',
    excretion_independent: false,
    excretion_partial_assist: false,
    excretion_full_assist: false,
    excretion_other: false,
    excretion_other_text: '',
    diaper_usage: false,
    garbage_disposal_independent: false,
    garbage_disposal_support_needed: false,
    garbage_disposal_support_text: '',
    stairs_independent: false,
    stairs_partial_assist: false,
    stairs_full_assist: false,
    stairs_other: false,
    stairs_other_text: '',
    second_floor_possible: false,
    bed_or_futon: '',
    bathing_independent: false,
    bathing_partial_assist: false,
    bathing_full_assist: false,
    bathing_other: false,
    bathing_other_text: '',
    unit_bath_possible: false,
    money_management: '',
    supporter_available: false,
    supporter_text: '',
    proxy_payment: false,
    rent_payment_method: '',
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
    const fetchConsultation = async () => {
      if (editMode && consultationId) {
        try {
          const data = await consultationsApi.getById(consultationId);
          if (data) {
            setFormData({
                consultation_date: data.consultation_date ? data.consultation_date.split('T')[0] : '',
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
                hospital_support_required: data.hospital_support_required || false,
                medication_management_needed: data.medication_management_needed || false,
                mobility_independent: data.mobility_independent || false,
                mobility_partial_assist: data.mobility_partial_assist || false,
                mobility_full_assist: data.mobility_full_assist || false,
                mobility_other: data.mobility_other || false,
                mobility_other_text: data.mobility_other_text || '',
                eating_independent: data.eating_independent || false,
                eating_partial_assist: data.eating_partial_assist || false,
                eating_full_assist: data.eating_full_assist || false,
                eating_other: data.eating_other || false,
                eating_other_text: data.eating_other_text || '',
                shopping_possible: data.shopping_possible || false,
                shopping_support_needed: data.shopping_support_needed || false,
                shopping_support_text: data.shopping_support_text || '',
                cooking_possible: data.cooking_possible || false,
                cooking_support_needed: data.cooking_support_needed || false,
                cooking_support_text: data.cooking_support_text || '',
                excretion_independent: data.excretion_independent || false,
                excretion_partial_assist: data.excretion_partial_assist || false,
                excretion_full_assist: data.excretion_full_assist || false,
                excretion_other: data.excretion_other || false,
                excretion_other_text: data.excretion_other_text || '',
                diaper_usage: data.diaper_usage || false,
                garbage_disposal_independent: data.garbage_disposal_independent || false,
                garbage_disposal_support_needed: data.garbage_disposal_support_needed || false,
                garbage_disposal_support_text: data.garbage_disposal_support_text || '',
                stairs_independent: data.stairs_independent || false,
                stairs_partial_assist: data.stairs_partial_assist || false,
                stairs_full_assist: data.stairs_full_assist || false,
                stairs_other: data.stairs_other || false,
                stairs_other_text: data.stairs_other_text || '',
                second_floor_possible: data.second_floor_possible || false,
                bed_or_futon: data.bed_or_futon as ConsultationFormData['bed_or_futon'] || '',
                bathing_independent: data.bathing_independent || false,
                bathing_partial_assist: data.bathing_partial_assist || false,
                bathing_full_assist: data.bathing_full_assist || false,
                bathing_other: data.bathing_other || false,
                bathing_other_text: data.bathing_other_text || '',
                unit_bath_possible: data.unit_bath_possible || false,
                money_management: data.money_management || '',
                supporter_available: data.supporter_available || false,
                supporter_text: data.supporter_text || '',
                proxy_payment: data.proxy_payment || false,
                rent_payment_method: data.rent_payment_method as ConsultationFormData['rent_payment_method'] || '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // ★★★ ビルドエラー修正箇所 ★★★
      // 送信するデータオブジェクトを、Supabaseの型に厳密に合わせて構築する
      const dataToSubmit: ConsultationUpdate = {
        consultation_date: formData.consultation_date, // 必須項目なのでそのまま
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
        mobility_independent: formData.mobility_independent,
        mobility_partial_assist: formData.mobility_partial_assist,
        mobility_full_assist: formData.mobility_full_assist,
        mobility_other: formData.mobility_other,
        mobility_other_text: formData.mobility_other_text || null,
        eating_independent: formData.eating_independent,
        eating_partial_assist: formData.eating_partial_assist,
        eating_full_assist: formData.eating_full_assist,
        eating_other: formData.eating_other,
        eating_other_text: formData.eating_other_text || null,
        shopping_possible: formData.shopping_possible,
        shopping_support_needed: formData.shopping_support_needed,
        shopping_support_text: formData.shopping_support_text || null,
        cooking_possible: formData.cooking_possible,
        cooking_support_needed: formData.cooking_support_needed,
        cooking_support_text: formData.cooking_support_text || null,
        excretion_independent: formData.excretion_independent,
        excretion_partial_assist: formData.excretion_partial_assist,
        excretion_full_assist: formData.excretion_full_assist,
        excretion_other: formData.excretion_other,
        excretion_other_text: formData.excretion_other_text || null,
        diaper_usage: formData.diaper_usage,
        garbage_disposal_independent: formData.garbage_disposal_independent,
        garbage_disposal_support_needed: formData.garbage_disposal_support_needed,
        garbage_disposal_support_text: formData.garbage_disposal_support_text || null,
        stairs_independent: formData.stairs_independent,
        stairs_partial_assist: formData.stairs_partial_assist,
        stairs_full_assist: formData.stairs_full_assist,
        stairs_other: formData.stairs_other,
        stairs_other_text: formData.stairs_other_text || null,
        second_floor_possible: formData.second_floor_possible,
        bed_or_futon: formData.bed_or_futon || null,
        bathing_independent: formData.bathing_independent,
        bathing_partial_assist: formData.bathing_partial_assist,
        bathing_full_assist: formData.bathing_full_assist,
        bathing_other: formData.bathing_other,
        bathing_other_text: formData.bathing_other_text || null,
        unit_bath_possible: formData.unit_bath_possible,
        money_management: formData.money_management || null,
        supporter_available: formData.supporter_available,
        supporter_text: formData.supporter_text || null,
        proxy_payment: formData.proxy_payment,
        rent_payment_method: formData.rent_payment_method || null,
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

      // デバッグ用にコンソールに出力
      console.log("Submitting data:", dataToSubmit);

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
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">相談ルート</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <label className="flex items-center"><input type="checkbox" name="consultation_route_self" checked={formData.consultation_route_self} onChange={handleChange} className="mr-2" /><span>本人</span></label>
            <label className="flex items-center"><input type="checkbox" name="consultation_route_family" checked={formData.consultation_route_family} onChange={handleChange} className="mr-2" /><span>家族</span></label>
            <label className="flex items-center"><input type="checkbox" name="consultation_route_care_manager" checked={formData.consultation_route_care_manager} onChange={handleChange} className="mr-2" /><span>ケアマネ</span></label>
            <label className="flex items-center"><input type="checkbox" name="consultation_route_elderly_center" checked={formData.consultation_route_elderly_center} onChange={handleChange} className="mr-2" /><span>支援センター（高齢者）</span></label>
            <label className="flex items-center"><input type="checkbox" name="consultation_route_disability_center" checked={formData.consultation_route_disability_center} onChange={handleChange} className="mr-2" /><span>支援センター（障害者）</span></label>
          </div>
          <div className="mt-2 space-y-2">
            <div><label className="flex items-center"><input type="checkbox" name="consultation_route_government" checked={formData.consultation_route_government} onChange={handleChange} className="mr-2" /><span className="text-gray-800 mr-2">行政機関</span>{formData.consultation_route_government && (<input type="text" name="consultation_route_government_other" value={formData.consultation_route_government_other} onChange={handleChange} placeholder="詳細を入力" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" />)}</label></div>
            <div><label className="flex items-center"><input type="checkbox" name="consultation_route_other" checked={formData.consultation_route_other} onChange={handleChange} className="mr-2" /><span className="text-gray-800 mr-2">その他</span>{formData.consultation_route_other && (<input type="text" name="consultation_route_other_text" value={formData.consultation_route_other_text} onChange={handleChange} placeholder="詳細を入力" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" />)}</label></div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">属性</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <label className="flex items-center"><input type="checkbox" name="attribute_elderly" checked={formData.attribute_elderly} onChange={handleChange} className="mr-2" /><span>高齢</span></label>
            <div>
              <label className="flex items-center"><input type="checkbox" name="attribute_disability" checked={formData.attribute_disability} onChange={handleChange} className="mr-2" /><span>障がい</span></label>
              {formData.attribute_disability && (
                <div className="ml-6 mt-1 space-y-1">
                  <label className="flex items-center text-sm"><input type="checkbox" name="attribute_disability_mental" checked={formData.attribute_disability_mental} onChange={handleChange} className="mr-1" /><span>精神</span></label>
                  <label className="flex items-center text-sm"><input type="checkbox" name="attribute_disability_physical" checked={formData.attribute_disability_physical} onChange={handleChange} className="mr-1" /><span>身体</span></label>
                  <label className="flex items-center text-sm"><input type="checkbox" name="attribute_disability_intellectual" checked={formData.attribute_disability_intellectual} onChange={handleChange} className="mr-1" /><span>知的</span></label>
                </div>
              )}
            </div>
            <label className="flex items-center"><input type="checkbox" name="attribute_childcare" checked={formData.attribute_childcare} onChange={handleChange} className="mr-2" /><span>子育て</span></label>
            <label className="flex items-center"><input type="checkbox" name="attribute_single_parent" checked={formData.attribute_single_parent} onChange={handleChange} className="mr-2" /><span>ひとり親</span></label>
            <label className="flex items-center"><input type="checkbox" name="attribute_dv" checked={formData.attribute_dv} onChange={handleChange} className="mr-2" /><span>DV</span></label>
            <label className="flex items-center"><input type="checkbox" name="attribute_foreigner" checked={formData.attribute_foreigner} onChange={handleChange} className="mr-2" /><span>外国人</span></label>
            <label className="flex items-center"><input type="checkbox" name="attribute_poverty" checked={formData.attribute_poverty} onChange={handleChange} className="mr-2" /><span>生活困窮</span></label>
            <label className="flex items-center"><input type="checkbox" name="attribute_low_income" checked={formData.attribute_low_income} onChange={handleChange} className="mr-2" /><span>低所得者</span></label>
            <label className="flex items-center"><input type="checkbox" name="attribute_lgbt" checked={formData.attribute_lgbt} onChange={handleChange} className="mr-2" /><span>LGBT</span></label>
            <label className="flex items-center"><input type="checkbox" name="attribute_welfare" checked={formData.attribute_welfare} onChange={handleChange} className="mr-2" /><span>生保</span></label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">お名前</label><div className="flex items-center"><input type="text" name="name" value={formData.name} onChange={handleChange} className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white" placeholder="匿名の場合は空欄" /><span className="ml-2 text-gray-600">様</span></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">フリガナ</label><input type="text" name="furigana" value={formData.furigana} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white" /></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
            <div className="flex space-x-4">
              <label className="flex items-center"><input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} className="mr-1" /><span>男</span></label>
              <label className="flex items-center"><input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} className="mr-1" /><span>女</span></label>
              <label className="flex items-center"><input type="radio" name="gender" value="other" checked={formData.gender === 'other'} onChange={handleChange} className="mr-1" /><span>その他</span></label>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">世帯構成</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <label className="flex items-center"><input type="checkbox" name="household_single" checked={formData.household_single} onChange={handleChange} className="mr-2" /><span>独居</span></label>
            <label className="flex items-center"><input type="checkbox" name="household_couple" checked={formData.household_couple} onChange={handleChange} className="mr-2" /><span>夫婦</span></label>
            <label className="flex items-center"><input type="checkbox" name="household_common_law" checked={formData.household_common_law} onChange={handleChange} className="mr-2" /><span>内縁夫婦</span></label>
            <label className="flex items-center"><input type="checkbox" name="household_parent_child" checked={formData.household_parent_child} onChange={handleChange} className="mr-2" /><span>親子</span></label>
            <label className="flex items-center"><input type="checkbox" name="household_siblings" checked={formData.household_siblings} onChange={handleChange} className="mr-2" /><span>兄弟姉妹</span></label>
            <label className="flex items-center"><input type="checkbox" name="household_acquaintance" checked={formData.household_acquaintance} onChange={handleChange} className="mr-2" /><span>知人</span></label>
            <div><label className="flex items-center"><input type="checkbox" name="household_other" checked={formData.household_other} onChange={handleChange} className="mr-2" /><span>その他</span></label>{formData.household_other && (<input type="text" name="household_other_text" value={formData.household_other_text} onChange={handleChange} placeholder="詳細を入力" className="mt-1 w-full px-2 py-1 border border-gray-300 rounded text-sm" />)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">郵便番号</label><input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="123-4567" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">都道府県・市区町村・番地等</label><input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">自宅電話番号</label><input type="tel" name="phone_home" value={formData.phone_home} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">携帯電話番号</label><input type="tel" name="phone_mobile" value={formData.phone_mobile} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">生年月日</label>
          <div className="flex space-x-2 items-center">
            <select name="birth_year" value={formData.birth_year} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-md"><option value="">年</option>{years.map(year => (<option key={year} value={year}>{year}</option>))}</select><span>年</span>
            <select name="birth_month" value={formData.birth_month} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-md"><option value="">月</option>{months.map(month => (<option key={month} value={month}>{month}</option>))}</select><span>月</span>
            <select name="birth_day" value={formData.birth_day} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-md"><option value="">日</option>{days.map(day => (<option key={day} value={day}>{day}</option>))}</select><span>日</span>
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
              {[{ value: 'independent', label: '自立' },{ value: 'support1', label: '要支援１' },{ value: 'support2', label: '要支援２' },{ value: 'care1', label: '要介護１' },{ value: 'care2', label: '要介護２' },{ value: 'care3', label: '要介護３' },{ value: 'care4', label: '要介護４' },{ value: 'care5', label: '要介護５' }].map(option => (<label key={option.value} className="flex items-center"><input type="radio" name="physical_condition" value={option.value} checked={formData.physical_condition === option.value} onChange={handleChange} className="mr-2" /><span className="text-gray-700">{option.label}</span></label>))}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">手帳</label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2"><input type="checkbox" name="mental_disability_certificate" checked={formData.mental_disability_certificate} onChange={handleChange} className="mr-2" /><span className="text-gray-700">精神障害者保健福祉手帳</span>{formData.mental_disability_certificate && (<input type="text" name="mental_disability_level" value={formData.mental_disability_level} onChange={handleChange} placeholder="等級" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" />)}</div>
            <div className="flex items-center space-x-2"><input type="checkbox" name="physical_disability_certificate" checked={formData.physical_disability_certificate} onChange={handleChange} className="mr-2" /><span className="text-gray-700">身体障害者手帳</span>{formData.physical_disability_certificate && (<input type="text" name="physical_disability_level" value={formData.physical_disability_level} onChange={handleChange} placeholder="等級" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" />)}</div>
            <div className="flex items-center space-x-2"><input type="checkbox" name="therapy_certificate" checked={formData.therapy_certificate} onChange={handleChange} className="mr-2" /><span className="text-gray-700">療育手帳</span>{formData.therapy_certificate && (<input type="text" name="therapy_level" value={formData.therapy_level} onChange={handleChange} placeholder="区分" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" />)}</div>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">利用中の支援サービス</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <label className="flex items-center"><input type="checkbox" name="service_day_service" checked={formData.service_day_service} onChange={handleChange} className="mr-2" /><span>デイサービス</span></label>
            <label className="flex items-center"><input type="checkbox" name="service_visiting_nurse" checked={formData.service_visiting_nurse} onChange={handleChange} className="mr-2" /><span>訪問看護</span></label>
            <label className="flex items-center"><input type="checkbox" name="service_visiting_care" checked={formData.service_visiting_care} onChange={handleChange} className="mr-2" /><span>訪問介護</span></label>
            <label className="flex items-center"><input type="checkbox" name="service_home_medical" checked={formData.service_home_medical} onChange={handleChange} className="mr-2" /><span>在宅診療</span></label>
            <label className="flex items-center"><input type="checkbox" name="service_short_stay" checked={formData.service_short_stay} onChange={handleChange} className="mr-2" /><span>短期入所施設</span></label>
            <div>
              <label className="flex items-center"><input type="checkbox" name="service_other" checked={formData.service_other} onChange={handleChange} className="mr-2" /><span>その他</span></label>
              {formData.service_other && (<input type="text" name="service_other_text" value={formData.service_other_text} onChange={handleChange} placeholder="詳細" className="mt-1 w-full px-2 py-1 border border-gray-300 rounded text-sm" />)}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">サービス提供事業所</label><input type="text" name="service_provider" value={formData.service_provider} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">居宅介護支援事業所</label><input type="text" name="care_support_office" value={formData.care_support_office} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">担当</label><input type="text" name="care_manager" value={formData.care_manager} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
        </div>
        <div className="mt-4"><label className="block text-sm font-medium text-gray-700 mb-1">既往症及び病歴</label><textarea name="medical_history" value={formData.medical_history} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
      </div>

      {/* 3. 医療・収入 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">3. 医療・収入</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">かかりつけ医療機関 - 名称</label><input type="text" name="medical_institution_name" value={formData.medical_institution_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">かかりつけ医療機関 - 担当</label><input type="text" name="medical_institution_staff" value={formData.medical_institution_staff} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">収入</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm text-gray-600 mb-1">給与</label><input type="number" name="income_salary" value={formData.income_salary} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="円" /></div>
            <div><label className="block text-sm text-gray-600 mb-1">傷病手当</label><input type="number" name="income_injury_allowance" value={formData.income_injury_allowance} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="円" /></div>
            <div><label className="block text-sm text-gray-600 mb-1">年金振込額</label><input type="number" name="income_pension" value={formData.income_pension} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="円" /></div>
          </div>
          <div className="mt-2 flex items-center space-x-4">
            <label className="flex items-center"><input type="checkbox" name="welfare_recipient" checked={formData.welfare_recipient} onChange={handleChange} className="mr-2" /><span>生活保護受給</span></label>
            {formData.welfare_recipient && (<input type="text" name="welfare_staff" value={formData.welfare_staff} onChange={handleChange} placeholder="生保担当者" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" />)}
          </div>
          <div className="mt-2"><label className="block text-sm text-gray-600 mb-1">預金</label><input type="number" name="savings" value={formData.savings} onChange={handleChange} className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md" placeholder="円" /></div>
        </div>
      </div>

      {/* 4. ADL/IADL */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">4. ADL/IADL</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">認知症</label><input type="text" name="dementia" value={formData.dementia} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">病院名</label><input type="text" name="dementia_hospital" value={formData.dementia_hospital} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
        </div>
        <div className="mt-4 space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">通院支援</label>
            <div className="flex space-x-4">
              <label className="flex items-center"><input type="radio" name="hospital_support_required" checked={formData.hospital_support_required === true} onChange={() => setFormData(prev => ({...prev, hospital_support_required: true}))} className="mr-1" /><span>要</span></label>
              <label className="flex items-center"><input type="radio" name="hospital_support_required" checked={formData.hospital_support_required === false} onChange={() => setFormData(prev => ({...prev, hospital_support_required: false}))} className="mr-1" /><span>不要</span></label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">内服管理の必要性</label>
            <div className="flex space-x-4">
              <label className="flex items-center"><input type="radio" name="medication_management_needed" checked={formData.medication_management_needed === true} onChange={() => setFormData(prev => ({...prev, medication_management_needed: true}))} className="mr-1" /><span>有</span></label>
              <label className="flex items-center"><input type="radio" name="medication_management_needed" checked={formData.medication_management_needed === false} onChange={() => setFormData(prev => ({...prev, medication_management_needed: false}))} className="mr-1" /><span>無</span></label>
            </div>
          </div>
        </div>
        <div className="mt-4"><label className="block text-sm font-medium text-gray-700 mb-1">その他特記事項</label><textarea name="other_notes" value={formData.other_notes} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="例：聴力、視力、喫煙" /></div>
      </div>

      {/* 5. 相談内容等 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">5. 相談内容等</h2>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">相談内容（困りごと、何が大変でどうしたいか、等）</label><textarea name="consultation_content" value={formData.consultation_content} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">転居理由</label><textarea name="relocation_reason" value={formData.relocation_reason} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
        </div>
        <div className="mt-4">
          <h3 className="text-md font-medium text-gray-800 mb-2">緊急連絡先</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">氏名</label><input type="text" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">当事者との関係</label><input type="text" name="emergency_contact_relationship" value={formData.emergency_contact_relationship} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">郵便番号</label><input type="text" name="emergency_contact_postal_code" value={formData.emergency_contact_postal_code} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">住所</label><input type="text" name="emergency_contact_address" value={formData.emergency_contact_address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">自宅電話</label><input type="tel" name="emergency_contact_phone_home" value={formData.emergency_contact_phone_home} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">携帯電話</label><input type="tel" name="emergency_contact_phone_mobile" value={formData.emergency_contact_phone_mobile} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Mail</label><input type="email" name="emergency_contact_email" value={formData.emergency_contact_email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          </div>
        </div>
        <div className="mt-4"><label className="block text-sm font-medium text-gray-700 mb-1">相談結果</label><textarea name="consultation_result" value={formData.consultation_result} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">次回予定</label>
          <div className="space-y-2">
            <div className="flex space-x-4">
              <label className="flex items-center"><input type="radio" name="next_appointment_scheduled" checked={formData.next_appointment_scheduled === true} onChange={() => setFormData(prev => ({...prev, next_appointment_scheduled: true}))} className="mr-1" /><span>あり</span></label>
              <label className="flex items-center"><input type="radio" name="next_appointment_scheduled" checked={formData.next_appointment_scheduled === false} onChange={() => setFormData(prev => ({...prev, next_appointment_scheduled: false}))} className="mr-1" /><span>なし</span></label>
            </div>
            {formData.next_appointment_scheduled && (<input type="text" name="next_appointment_details" value={formData.next_appointment_details} onChange={handleChange} placeholder="次回予定の詳細" className="w-full px-3 py-2 border border-gray-300 rounded-md" />)}
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